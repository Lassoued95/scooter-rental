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
    productId: data.productId,
    productName: data.productName,
    startDate: data.startDate,
    endDate: data.endDate,
    quantity: data.quantity,
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
    let releases = [];
    if (nextStatus === "CANCELLED") {
      const refs = expandDateRange(data.startDate, data.endDate).map((date) =>
        db.collection("availability").doc(`${data.productId}_${date}`),
      );
      const snaps = await Promise.all(refs.map((ref) => transaction.get(ref)));
      releases = refs.map((ref, index) => ({
        ref,
        booked: Math.max(
          0,
          (Number(snaps[index].data()?.booked) || 0) - (Number(data.quantity) || 0),
        ),
      }));
    }

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

module.exports = { listReservations, getReservation, updateReservationStatus };