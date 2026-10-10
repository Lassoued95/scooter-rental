const assert = require("node:assert/strict");
const test = require("node:test");

const { validateAvailabilityQuery } = require("../src/utils/availabilityQuery");

test("accepts a valid inclusive date range up to 60 days", () => {
  const result = validateAvailabilityQuery({
    id: "scooter-125",
    start: "2026-10-01",
    end: "2026-11-29",
  });
  assert.deepEqual(result, {
    success: true,
    productId: "scooter-125",
    startDate: "2026-10-01",
    endDate: "2026-11-29",
  });
});

test("rejects invalid IDs, impossible dates, reversed dates, and ranges over 60 days", () => {
  assert.equal(validateAvailabilityQuery({ id: "bad/id", start: "2026-10-01", end: "2026-10-02" }).success, false);
  assert.equal(validateAvailabilityQuery({ id: "scooter", start: "2026-02-30", end: "2026-03-01" }).success, false);
  assert.equal(validateAvailabilityQuery({ id: "scooter", start: "2026-10-02", end: "2026-10-01" }).success, false);
  assert.equal(validateAvailabilityQuery({ id: "scooter", start: "2026-10-01", end: "2026-11-30" }).success, false);
});

test("rejects missing or non-string date query values", () => {
  assert.equal(validateAvailabilityQuery({ id: "scooter", start: ["2026-10-01"], end: "2026-10-02" }).success, false);
  assert.equal(validateAvailabilityQuery({ id: "scooter", start: "2026-10-01" }).success, false);
});
