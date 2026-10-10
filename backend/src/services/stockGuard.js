const { db } = require("../config/firebase");
const { expandDateRange, getTodayInTunisia } = require("../utils/dateUtils");

class StockGuardError extends Error {
  constructor(requiredStock) {
    super(`Stock too low: ${requiredStock}`);
    this.name = "StockGuardError";
    this.code = "STOCK_TOO_LOW";
    this.requiredStock = requiredStock;
  }
}

async function assertStockNotBelowUpcomingReservations(
  transaction,
  productId,
  newStock,
) {
  const reservations = await transaction.get(
    db.collection("reservations").where("productId", "==", productId),
  );
  const upcomingDates = new Set();
  const today = getTodayInTunisia();

  for (const reservation of reservations.docs) {
    const data = reservation.data();
    if (data.status === "CANCELLED") continue;

    for (const date of expandDateRange(data.startDate, data.endDate)) {
      if (date >= today) upcomingDates.add(date);
    }
  }

  if (upcomingDates.size === 0) return;

  const availabilityRefs = [...upcomingDates].map((date) =>
    db.collection("availability").doc(`${productId}_${date}`),
  );
  const availability = await Promise.all(
    availabilityRefs.map((reference) => transaction.get(reference)),
  );
  const requiredStock = availability.reduce(
    (maximum, snapshot) =>
      Math.max(maximum, Number(snapshot.data()?.booked) || 0),
    0,
  );

  if (newStock < requiredStock) {
    throw new StockGuardError(requiredStock);
  }
}

module.exports = {
  StockGuardError,
  assertStockNotBelowUpcomingReservations,
};
