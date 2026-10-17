const { admin, db } = require("../config/firebase");
const { expandDateRange } = require("../utils/dateUtils");
const { sendMail } = require("./mailService");
const { ReservationError } = require("./reservationService");
const { buildStatusEmail } = require("../emails/statusEmail");

const STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];

const TRANSITIONS = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["CANCELLED", "COMPLETED"],
  CANCELLED: [],
  COMPLETED: [],
};

// Statuts comptés dans le chiffre d'affaires
const REVENUE_STATUSES = ["CONFIRMED", "COMPLETED"];
// Statuts dont le stock est encore réservé (à libérer en cas de suppression)
const STOCK_HOLDING_STATUSES = ["PENDING", "CONFIRMED"];

const DAY_MS = 24 * 60 * 60 * 1000;
const BATCH_SIZE = 400; // Firestore accepte 500 écritures max par lot

// On lit les 300 réservations les plus récentes puis on filtre ici :
// aucun index Firestore à créer, et c'est largement suffisant pour une agence locale.
const WINDOW_SIZE = 300;

function toIso(value) {
  if (!value) return null;
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  return typeof value === "string" ? value : null;
}

function serialize(doc) {
  const data = doc.data();
  return {
    id: doc.id,
    reference: data.reference || doc.id.slice(0, 8).toUpperCase(),
    status: data.status,
    type: data.type ?? "rental",
    productId: data.productId,
    productName: data.productName,
    startDate: data.startDate,
    endDate: data.endDate,
    date: data.date,
    departureTime: data.departureTime,
    quantity: data.quantity,
    unitPrice: data.unitPrice,
    totalPrice: data.totalPrice,
    currency: data.currency ?? "EUR",
    customer: {
      name: data.customer?.name ?? "",
      email: data.customer?.email ?? "",
      phone: data.customer?.phone ?? "",
      hotel: data.customer?.hotel ?? "",
      message: data.customer?.message ?? "",
    },
    locale: data.locale ?? "en",
    emails: data.emails ?? null,
    history: Array.isArray(data.history) ? data.history : [],
    createdAt: toIso(data.createdAt),
    updatedAt: toIso(data.updatedAt),
  };
}

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

function matchesSearch(reservation, query) {
  const text = normalize(query).trim();
  if (!text) return true;

  const haystack = normalize(
    [
      reservation.reference,
      reservation.productName,
      reservation.customer.name,
      reservation.customer.email,
      reservation.customer.hotel,
    ].join(" "),
  );
  if (haystack.includes(text)) return true;

  // téléphone : on compare uniquement les chiffres
  const digits = text.replace(/\D/g, "");
  return (
    digits.length >= 4 &&
    reservation.customer.phone.replace(/\D/g, "").includes(digits)
  );
}

// Calcule le stock à libérer pour une réservation de location.
// LECTURES uniquement : à appeler avant toute écriture dans la transaction.
async function readStockReleases(transaction, data) {
  if (data.type === "tour") return [];

  const refs = expandDateRange(data.startDate, data.endDate).map((date) =>
    db.collection("availability").doc(`${data.productId}_${date}`),
  );
  const snaps = await Promise.all(refs.map((ref) => transaction.get(ref)));
  return refs.map((ref, index) => ({
    ref,
    booked: Math.max(
      0,
      (Number(snaps[index].data()?.booked) || 0) - (Number(data.quantity) || 0),
    ),
  }));
}

async function listReservations({ status, q, page = 1, pageSize = 20 }) {
  const snapshot = await db
    .collection("reservations")
    .orderBy("createdAt", "desc")
    .limit(WINDOW_SIZE)
    .get();

  const all = snapshot.docs.map(serialize);

  const counts = { all: all.length, PENDING: 0, CONFIRMED: 0, CANCELLED: 0, COMPLETED: 0 };
  for (const reservation of all) {
    if (counts[reservation.status] !== undefined) counts[reservation.status] += 1;
  }

  const filtered = all.filter(
    (reservation) =>
      (!status || reservation.status === status) && matchesSearch(reservation, q),
  );

  const start = (page - 1) * pageSize;
  return {
    reservations: filtered.slice(start, start + pageSize),
    counts,
    total: filtered.length,
    page,
    pageSize,
    truncated: all.length === WINDOW_SIZE,
  };
}

async function getReservation(id) {
  const doc = await db.collection("reservations").doc(id).get();
  return doc.exists ? serialize(doc) : null;
}

async function updateReservationStatus(id, nextStatus, adminUser) {
  if (!STATUSES.includes(nextStatus)) {
    throw new ReservationError("Invalid status.", 400);
  }

  const reservationRef = db.collection("reservations").doc(id);

  const outcome = await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reservationRef);
    if (!snapshot.exists) throw new ReservationError("Reservation not found.", 404);

    const data = snapshot.data();
    const current = data.status;

    // même statut : rien à faire (un double clic ne casse rien)
    if (current === nextStatus) return { unchanged: true };

    if (!TRANSITIONS[current]?.includes(nextStatus)) {
      throw new ReservationError(
        `Cannot change the status from ${current} to ${nextStatus}.`,
        409,
      );
    }

    // Toutes les LECTURES avant toutes les ÉCRITURES (règle des transactions Firestore)
    const releases =
      nextStatus === "CANCELLED" ? await readStockReleases(transaction, data) : [];

    transaction.update(reservationRef, {
      status: nextStatus,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      history: admin.firestore.FieldValue.arrayUnion({
        status: nextStatus,
        at: new Date().toISOString(),
        by: adminUser?.email ?? adminUser?.uid ?? "admin",
      }),
    });

    // on libère le stock des jours annulés
    releases.forEach(({ ref, booked }) => {
      transaction.set(ref, { booked }, { merge: true });
    });

    return { unchanged: false };
  });

  let reservation = await getReservation(id);
  let emailSent = null;

  // e-mail au client : ne fait jamais échouer le changement de statut
  if (!outcome.unchanged && (nextStatus === "CONFIRMED" || nextStatus === "CANCELLED")) {
    let deliveryState = "failed";
    emailSent = false;
    try {
      const email = buildStatusEmail(nextStatus, reservation);
      const result = await sendMail({ to: reservation.customer.email, ...email });
      emailSent = result.ok === true;
      deliveryState = result.ok ? "sent" : result.skipped ? "skipped" : "failed";
    } catch (error) {
      console.error("Reservation status email failed:", error.code || error.name || "MAIL_FAILED");
    }

    try {
      await reservationRef.update({
        [`emails.${nextStatus.toLowerCase()}`]: deliveryState,
      });
    } catch (error) {
      console.error("Failed to record reservation email status:", error.code || error.name || "UNKNOWN");
    }

    reservation = await getReservation(id);
  }

  return { reservation, emailSent };
}

// Supprime une réservation (et libère son stock si elle le bloquait encore)
async function deleteReservation(id) {
  const reservationRef = db.collection("reservations").doc(id);

  await db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(reservationRef);
    if (!snapshot.exists) throw new ReservationError("Reservation not found.", 404);

    const data = snapshot.data();

    // LECTURES avant ÉCRITURES
    const releases = STOCK_HOLDING_STATUSES.includes(data.status)
      ? await readStockReleases(transaction, data)
      : [];

    transaction.delete(reservationRef);
    releases.forEach(({ ref, booked }) => {
      transaction.set(ref, { booked }, { merge: true });
    });
  });

  return { id };
}

// Supprime toutes les réservations et remet le stock à jour
async function deleteAllReservations() {
  const snapshot = await db.collection("reservations").get();
  if (snapshot.empty) return { deleted: 0 };

  // stock à libérer, regroupé par jour et par produit
  const decrements = new Map();
  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (data.type === "tour" || !STOCK_HOLDING_STATUSES.includes(data.status)) return;

    expandDateRange(data.startDate, data.endDate).forEach((date) => {
      const key = `${data.productId}_${date}`;
      decrements.set(key, (decrements.get(key) || 0) + (Number(data.quantity) || 0));
    });
  });

  const availabilityRefs = [...decrements.keys()].map((key) =>
    db.collection("availability").doc(key),
  );
  const availabilitySnaps = availabilityRefs.length
    ? await db.getAll(...availabilityRefs)
    : [];

  const operations = snapshot.docs.map((doc) => (batch) => batch.delete(doc.ref));
  availabilitySnaps.forEach((snap, index) => {
    const ref = availabilityRefs[index];
    const booked = Math.max(
      0,
      (Number(snap.data()?.booked) || 0) - decrements.get(ref.id),
    );
    operations.push((batch) => batch.set(ref, { booked }, { merge: true }));
  });

  // lots de 400 opérations (limite Firestore : 500)
  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    operations.slice(i, i + BATCH_SIZE).forEach((apply) => apply(batch));
    await batch.commit();
  }

  return { deleted: snapshot.size };
}

// Chiffre d'affaires des 7 et 30 derniers jours (réservations confirmées ou terminées)
async function getRevenueStats(now = new Date()) {
  const since = new Date(now.getTime() - 30 * DAY_MS);
  const sevenDaysAgo = now.getTime() - 7 * DAY_MS;

  const snapshot = await db
    .collection("reservations")
    .where("createdAt", ">=", admin.firestore.Timestamp.fromDate(since))
    .get();

  const stats = {
    last7Days: { total: 0, count: 0 },
    last30Days: { total: 0, count: 0 },
    currency: "EUR",
  };

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    if (!REVENUE_STATUSES.includes(data.status)) return;

    const createdAt = toIso(data.createdAt);
    if (!createdAt) return;

    const amount = Number(data.totalPrice) || 0;
    stats.last30Days.total += amount;
    stats.last30Days.count += 1;

    if (new Date(createdAt).getTime() >= sevenDaysAgo) {
      stats.last7Days.total += amount;
      stats.last7Days.count += 1;
    }
  });

  stats.last7Days.total = Math.round(stats.last7Days.total * 100) / 100;
  stats.last30Days.total = Math.round(stats.last30Days.total * 100) / 100;
  return stats;
}

module.exports = {
  listReservations,
  getReservation,
  updateReservationStatus,
  deleteReservation,
  deleteAllReservations,
  getRevenueStats,
};