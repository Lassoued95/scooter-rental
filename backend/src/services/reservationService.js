const { admin, db } = require("../config/firebase");
const { sendMail } = require("./mailService");
const { countRentalDays, expandDateRange, getTodayInTunisia, toUtcDate } = require("../utils/dateUtils");
const { calculateVehicleLineTotal } = require("../utils/pricing");

class ReservationError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ReservationError";
    this.status = status;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]);
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

async function createVehicleReservation(input) {
  const item = input.items[0];
  const { startDate, endDate } = item;
  const start = toUtcDate(startDate);
  const end = toUtcDate(endDate);
  const days = countRentalDays(startDate, endDate);

  if (!start || !end || days === 0 || days > 60 || startDate < getTodayInTunisia()) {
    throw new ReservationError("Choose a valid rental date range.", 400);
  }

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
  const escapedDates = `${escapeHtml(startDate)} – ${escapeHtml(endDate)}`;
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
      sendMail({
        to: process.env.AGENCY_NOTIFY_EMAIL,
        subject: `New rental request: ${reservation.productName.replace(/[\r\n]+/g, " ")}`,
        html: notification,
        text: notification.replace(/<[^>]*>/g, " "),
        replyTo: reservation.customer.email,
      }),
    );
  } else {
    console.error("AGENCY_NOTIFY_EMAIL is not configured; agency notification was not sent.");
  }

  emails.push(
    sendMail({
      to: reservation.customer.email,
      subject: "We received your scooter reservation request",
      html: [
        `<p>Hello ${escapedCustomer},</p>`,
        `<p>We received your request for <strong>${escapedName}</strong>.</p>`,
        `<p><strong>Dates:</strong> ${escapedDates}<br>`,
        `<strong>Quantity:</strong> ${reservation.quantity}<br>`,
        `<strong>Estimated total:</strong> ${escapedTotal}</p>`,
        "<p>Your reservation is pending confirmation. We will contact you shortly.</p>",
      ].join(""),
      text: `Hello ${reservation.customer.name}, we received your request for ${reservation.productName}, ${startDate} to ${endDate}. Your reservation is pending confirmation.`,
    }),
  );
  await Promise.all(emails);

  return {
    id: reservation.id,
    status: reservation.status,
    totalPrice: reservation.totalPrice,
    currency: reservation.currency,
  };
}

module.exports = { createVehicleReservation, ReservationError };