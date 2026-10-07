import { describe, expect, it } from "vitest";
import { todayInTunis } from "./dates.js";
import {
  computeCartTotal,
  computeLineTotal,
  countRentalDays,
  pickPricePerDay,
} from "./pricing.js";

const tiers = [
  { minDays: 1, pricePerDay: 25 },
  { minDays: 3, pricePerDay: 22 },
  { minDays: 7, pricePerDay: 20 },
  { minDays: 14, pricePerDay: 18 },
];

describe("countRentalDays", () => {
  it("compte le jour de départ et le jour de retour", () => {
    expect(countRentalDays("2026-10-12", "2026-10-14")).toBe(3);
    expect(countRentalDays("2026-10-12", "2026-10-12")).toBe(1);
  });
  it("traverse un changement de mois", () => {
    expect(countRentalDays("2026-10-30", "2026-11-02")).toBe(4);
  });
  it("renvoie 0 pour des dates invalides ou inversées", () => {
    expect(countRentalDays("2026-10-14", "2026-10-12")).toBe(0);
    expect(countRentalDays("2026-02-31", "2026-03-02")).toBe(0);
    expect(countRentalDays("hier", "demain")).toBe(0);
    expect(countRentalDays(undefined, undefined)).toBe(0);
  });
});

describe("pickPricePerDay", () => {
  it.each([
    [1, 25],
    [2, 25],
    [3, 22],
    [6, 22],
    [7, 20],
    [13, 20],
    [14, 18],
    [60, 18],
  ])("%i jours = %i par jour", (days, expected) => {
    expect(pickPricePerDay(tiers, days, 30)).toBe(expected);
  });
  it("retombe sur le prix de base sans palier", () => {
    expect(pickPricePerDay([], 5, 30)).toBe(30);
    expect(pickPricePerDay(undefined, 5, 30)).toBe(30);
  });
});

describe("computeLineTotal / computeCartTotal", () => {
  const rental = {
    id: "a",
    kind: "rental",
    startDate: "2026-10-12",
    endDate: "2026-10-14",
    quantity: 2,
    pricing: { basePrice: 25, priceTiers: tiers, currency: "EUR" },
  };
  const tour = {
    id: "b",
    kind: "tour",
    startDate: "2026-10-12",
    endDate: "2026-10-12",
    quantity: 1,
    pricing: { basePrice: 40, priceTiers: [], currency: "EUR" },
  };

  it("calcule une location : 3 jours x 22 x 2 = 132", () => {
    expect(computeLineTotal(rental)).toEqual({ days: 3, unitPrice: 22, total: 132 });
  });
  it("calcule un tour : prix par scooter", () => {
    expect(computeLineTotal(tour)).toEqual({ days: 1, unitPrice: 40, total: 40 });
  });
  it("additionne le panier", () => {
    expect(computeCartTotal([rental, tour]).total).toBe(172);
    expect(computeCartTotal([]).total).toBe(0);
  });
});

describe("todayInTunis", () => {
  it("utilise l'heure de Tunis (UTC+1)", () => {
    expect(todayInTunis(new Date("2026-10-07T10:00:00Z"))).toBe("2026-10-07");
    expect(todayInTunis(new Date("2026-10-07T23:30:00Z"))).toBe("2026-10-08");
  });
});