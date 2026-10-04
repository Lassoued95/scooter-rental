import { describe, expect, it } from "vitest";
import { calculateRentalPrice } from "./pricing";

const scooter = {
  price: 18,
  priceTiers: [
    { minDays: 1, pricePerDay: 18 },
    { minDays: 3, pricePerDay: 16 },
    { minDays: 7, pricePerDay: 14 },
    { minDays: 14, pricePerDay: 12 },
  ],
};

describe("calculateRentalPrice", () => {
  it.each([
    [1, 1, 18],
    [2, 1, 36],
    [3, 1, 48],
    [7, 1, 98],
    [14, 1, 168],
    [3, 2, 96],
  ])("prices %i days for %i scooter(s)", (days, quantity, expected) => {
    expect(calculateRentalPrice(scooter, days, quantity)).toBe(expected);
  });

  it("uses the base rate if no duration tiers are provided", () => {
    expect(calculateRentalPrice({ price: 9 }, 2)).toBe(18);
  });

  it.each([
    [0, 1],
    [-1, 1],
    [1.5, 1],
    [1, 0],
    [1, 1.5],
  ])("rejects invalid rental values (%i days, %i quantity)", (days, quantity) => {
    expect(() => calculateRentalPrice(scooter, days, quantity)).toThrow(RangeError);
  });
});
