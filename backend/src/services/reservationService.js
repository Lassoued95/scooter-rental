const { admin, db } = require("../config/firebase");
const { createHash } = require("crypto");
const { sendMail } = require("./mailService");
const { countRentalDays, expandDateRange, getTodayInTunisia, toUtcDate } = require("../utils/dateUtils");
const { calculateVehicleLineTotal } = require("../utils/pricing");
const { buildStatusEmail, escapeHtml, sanitizeSubject } = require("../emails/statusEmail");

const CONTACT_REQUEST_LIMIT = 3;
const CONTACT_WINDOW_MS = 24 * 60 * 60 * 1000;

async function sendMailSafely(message) {
  try {
    return await sendMail(message);
  } catch (error) {
    console.error("Reservation email failed:", error.code || error.name || "MAIL_FAILED");
    return { ok: false, error: "MAIL_FAILED" };
  }
}

class ReservationError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ReservationError";
    this.status = status;
  }
}

function getPriceDetails(product) {
  const sourcePrice = product.price;
  const priceTiers =
    product.priceTiers ??
    product.pricing?.tiers ??
    (typeof sourcePrice === "object" ? sourcePrice?.tiers : undefined) ??
    [];
  const fallbackPrice = Number(
    sourcePrice?.amount ?? product.basePrice ?? sourcePrice,
  );

  return {
    priceTiers: Array.isArray(priceTiers) ? priceTiers : [],
    fallbackPrice: Number.isFinite(fallbackPrice) ? fallbackPrice : 0,
  };
}

function contactRateLimitRef(type, value) {
  const digest = createHash("sha256").update(value).digest("hex");
  return db.collection("reservation_contact_limits").doc(`${type}_${digest}`);
}

async function recordContactRequest(customer) {
  const now = Date.now();
  const cutoff = now - CONTACT_WINDOW_MS;
  const phoneDigits = customer.phone.replace(/\D/g, "");
  const refs = [
    contactRateLimitRef("email", customer.email.trim().toLowerCase()),
    contactRateLimitRef("phone", phoneDigits || customer.phone.trim()),
  ];

  const limited = await db.runTransaction(async (transaction) => {
    const snapshots = await Promise.all(refs.map((ref) => transaction.get(ref)));
    const recentRequests = snapshots.map((snapshot) =>
      (snapshot.data()?.requests ?? []).filter(
        (timestamp) => Number(timestamp) >= cutoff && Number(timestamp) <= now,
      ),
    );

    if (recentRequests.some((requests) => requests.length >= CONTACT_REQUEST_LIMIT)) {
      return true;
    }

    refs.forEach((ref, index) => {
      transaction.set(ref, { requests: [...recentRequests[index], now] }, { merge: true });
    });
    return false;
  });

  if (limited) {
    throw new ReservationError(
      "The reservation limit for this email address or phone number is 3 requests per 24 hours.",
      429,
    );
  }
}

async function createVehicleReservation(input) {
  const item = input.items[0];
  const { startDate, endDate } = item;
  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);
  const days = countRentalDays(startDate, endDate);

  if (!start || !end || days === 0 || days > 60 || startDate < getTodayInTunisia()) {
    throw new ReservationError("Choose a valid rental date range.", 400);
  }

  await recordContactRequest(input.customer);

  const dateRange = expandDateRange(startDate, endDate);
  const productRef = db.collection("products").doc(item.productId);
  const reservationRef = db.collection("reservations").doc();
  const availabilityRefs = dateRange.map((date) =>
    db.collection("availability").doc(`${item.productId}_${date}`),
  );

  const reservation = await db.runTransaction(async (transaction) => {
    const productSnapshot = await transaction.get(productRef);
    if (!productSnapshot.exists) {
      throw new ReservationError("This vehicle is no longer available.", 404);
    }

    const product = { id: productSnapshot.id, ...productSnapshot.data() };
    if (product.active !== true || product.type !== "vehicle") {
      throw new ReservationError("This vehicle is no longer available.", 404);
    }

    const stock = Number(product.stock);
    if (!Number.isInteger(stock) || stock < 1 || item.quantity > stock) {
      throw new ReservationError("The requested quantity is not available.", 409);
    }

    const availabilitySnapshots = await Promise.all(
      availabilityRefs.map((reference) => transaction.get(reference)),
    );
    const bookedByDay = availabilitySnapshots.map((snapshot) =>
      Number(snapshot.data()?.booked) || 0,
    );

    if (bookedByDay.some((booked) => booked + item.quantity > stock)) {
      throw new ReservationError("The vehicle is not available for those dates.", 409);
    }

    const { priceTiers, fallbackPrice } = getPriceDetails(product);
    const totalPrice = calculateVehicleLineTotal({
      days,
      quantity: item.quantity,
      priceTiers,
      fallbackPrice,
    });
    if (!Number.isFinite(totalPrice) || totalPrice <= 0) {
      throw new ReservationError("This vehicle does not have a valid rental price.", 409);
    }

    const customer = {
      name: input.customer.fullName,
      email: input.customer.email,
      phone: input.customer.phone,
      ...(input.customer.hotel ? { hotel: input.customer.hotel } : {}),
      ...(input.customer.message ? { message: input.customer.message } : {}),
    };
    const record = {
      id: reservationRef.id,
      reference: reservationRef.id.slice(0, 8).toUpperCase(),
      productId: product.id,
      productName: String(product.name ?? product.id),
      type: "rental",
      startDate,
      endDate,
      quantity: item.quantity,
      totalPrice: Math.round((totalPrice + Number.EPSILON) * 100) / 100,
      currency: "EUR",
      status: "PENDING",
      customer,
      locale: input.locale,
      termsAccepted: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    transaction.create(reservationRef, record);
    availabilityRefs.forEach((reference, index) => {
      transaction.set(
        reference,
        { booked: bookedByDay[index] + item.quantity },
        { merge: true },
      );
    });

    return record;
  });

  const escapedName = escapeHtml(reservation.productName);
  const escapedCustomer = escapeHtml(reservation.customer.name);
  const escapedEmail = escapeHtml(reservation.customer.email);
  const escapedPhone = escapeHtml(reservation.customer.phone);
  const escapedDates = `${escapeHtml(startDate)} - ${escapeHtml(endDate)}`;
  const escapedTotal = escapeHtml(`${reservation.totalPrice.toFixed(2)} EUR`);
  const extraDetails = [
    reservation.customer.hotel
      ? `<p><strong>Hotel:</strong> ${escapeHtml(reservation.customer.hotel)}</p>`
      : "",
    reservation.customer.message
      ? `<p><strong>Message:</strong> ${escapeHtml(reservation.customer.message)}</p>`
      : "",
  ].join("");
  const notification = [
    `<h2>New scooter reservation request</h2>`,
    `<p><strong>Vehicle:</strong> ${escapedName}</p>`,
    `<p><strong>Dates:</strong> ${escapedDates}</p>`,
    `<p><strong>Quantity:</strong> ${reservation.quantity}</p>`,
    `<p><strong>Total:</strong> ${escapedTotal}</p>`,
    `<p><strong>Customer:</strong> ${escapedCustomer}</p>`,
    `<p><strong>Email:</strong> ${escapedEmail}</p>`,
    `<p><strong>Phone:</strong> ${escapedPhone}</p>`,
    extraDetails,
    `<p>Reservation ID: ${escapeHtml(reservation.id)}</p>`,
  ].join("");

  const emails = [];
  if (process.env.AGENCY_NOTIFY_EMAIL) {
    emails.push(
      sendMailSafely({
        to: process.env.AGENCY_NOTIFY_EMAIL,
        subject: sanitizeSubject(`New rental request: ${reservation.productName}`),
        html: notification,
        text: notification.replace(/<[^>]*>/g, " "),
        replyTo: reservation.customer.email,
      }),
    );
  } else {
    console.error("AGENCY_NOTIFY_EMAIL is not configured; agency notification was not sent.");
  }

  emails.push(
    sendMailSafely({
      to: reservation.customer.email,
      ...buildStatusEmail("RECEIVED", {
        ...reservation,
        reference: reservation.reference,
      }),
    }),
  );
  await Promise.all(emails);

  return {
    id: reservation.id,
    status: reservation.status,
    reference: reservation.reference,
    totalPrice: reservation.totalPrice,
    currency: reservation.currency,
  };
}

module.exports = {
  createVehicleReservation,
  recordContactRequest,
  ReservationError,
};