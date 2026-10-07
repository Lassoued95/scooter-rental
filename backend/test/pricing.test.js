const assert = require("node:assert/strict");
const test = require("node:test");

const { countRentalDays, expandDateRange, hasDateOverlap, toUtcDate } = require("../src/utils/dateUtils");
const { calculateVehicleLineTotal, calculateTourLineTotal } = require("../src/utils/pricing");

test("countRentalDays counts both start and end dates inclusively", () => {
  assert.equal(countRentalDays("2025-01-01", "2025-01-03"), 3);
  assert.equal(countRentalDays("2025-01-01", "2025-01-01"), 1);
});

test("expandDateRange includes every day inside the rental window", () => {
  assert.deepEqual(expandDateRange("2025-01-01", "2025-01-03"), [
    "2025-01-01",
    "2025-01-02",
    "2025-01-03",
  ]);
});

test("toUtcDate rejects impossible calendar dates", () => {
  assert.equal(toUtcDate("2025-02-31"), null);
  assert.equal(toUtcDate("2024-02-29")?.toISOString(), "2024-02-29T00:00:00.000Z");
});

test("hasDateOverlap identifies overlapping rental windows", () => {
  assert.equal(hasDateOverlap("2025-01-01", "2025-01-05", "2025-01-03", "2025-01-07"), true);
  assert.equal(hasDateOverlap("2025-01-01", "2025-01-03", "2025-01-05", "2025-01-07"), false);
});

test("vehicle pricing selects the applicable tier and totals the rental amount", () => {
  const total = calculateVehicleLineTotal({
    days: 5,
    quantity: 2,
    priceTiers: [
      { minDays: 1, pricePerDay: 20 },
      { minDays: 4, pricePerDay: 15 },
    ],
    fallbackPrice: 25,
  });

  assert.equal(total, 150);
});

test("tour pricing multiplies quantity by unit price", () => {
  assert.equal(calculateTourLineTotal({ quantity: 3, unitPrice: 40 }), 120);
});
