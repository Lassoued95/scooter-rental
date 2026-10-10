const { countRentalDays, toUtcDate } = require("./dateUtils");

const PRODUCT_ID_PATTERN = /^[a-z0-9-]{1,80}$/i;

function validateAvailabilityQuery({ id, start, end }) {
  if (typeof id !== "string" || !PRODUCT_ID_PATTERN.test(id)) {
    return { success: false, message: "Invalid product ID." };
  }

  if (typeof start !== "string" || typeof end !== "string") {
    return { success: false, message: "Start and end dates are required." };
  }

  if (!toUtcDate(start) || !toUtcDate(end)) {
    return { success: false, message: "Dates must be valid ISO calendar dates." };
  }

  const days = countRentalDays(start, end);
  if (days < 1 || days > 60) {
    return { success: false, message: "Date range must be between 1 and 60 days." };
  }

  return { success: true, productId: id, startDate: start, endDate: end };
}

module.exports = { validateAvailabilityQuery };
