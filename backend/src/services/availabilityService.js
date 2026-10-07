const { db } = require("../config/firebase");
const { expandDateRange } = require("../utils/dateUtils");

function buildAvailabilityId(productId, date) {
  return `${productId}_${date}`;
}

async function getProductAvailability(productId, dateRange) {
  const ids = dateRange.map((date) => buildAvailabilityId(productId, date));
  const snapshots = await Promise.all(
    ids.map((id) => db.collection("availability").doc(id).get()),
  );

  return snapshots.reduce((accumulator, snapshot) => {
    const data = snapshot.data() || {};
    const date = snapshot.id.replace(`${productId}_`, "");
    accumulator[date] = {
      booked: Number(data.booked) || 0,
    };
    return accumulator;
  }, {});
}

async function getAvailabilitySnapshot(product, item) {
  const { type, stock, capacityPerSlot } = product;

  if (type === "vehicle") {
    const dates = expandDateRange(item.startDate, item.endDate);
    const byDay = await getProductAvailability(product.id, dates);
    const maxBooked = dates.reduce(
      (max, date) => Math.max(max, Number(byDay[date]?.booked || 0)),
      0,
    );
    const available = Number(stock || 0) - maxBooked;
    return {
      available,
      stock: Number(stock || 0),
      dates,
      bookedByDate: byDay,
    };
  }

  if (type === "tour") {
    if (!capacityPerSlot) {
      return {
        available: 0,
        stock: 0,
        dates: [item.date],
        bookedByDate: {},
        blocked: true,
      };
    }

    const dateKey = item.date;
    const doc = await db.collection("availability").doc(buildAvailabilityId(product.id, dateKey)).get();
    const booked = Number(doc.data()?.booked || 0);
    const available = Number(capacityPerSlot) - booked;

    return {
      available,
      stock: Number(capacityPerSlot),
      dates: [dateKey],
      bookedByDate: { [dateKey]: { booked } },
    };
  }

  return {
    available: 0,
    stock: 0,
    dates: [],
    bookedByDate: {},
  };
}

module.exports = {
  buildAvailabilityId,
  getProductAvailability,
  getAvailabilitySnapshot,
};
