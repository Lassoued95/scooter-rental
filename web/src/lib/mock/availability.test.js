import { describe, expect, it } from "vitest";
import { getMockAvailability } from "./availability";

describe("getMockAvailability", () => {
  it("accounts for rental reservations that overlap the requested dates", () => {
    expect(
      getMockAvailability("scooter-50cc", {
        startDate: "2026-10-06",
        endDate: "2026-10-07",
        quantity: 3,
      }),
    ).toEqual({ available: 3, requested: 3, isAvailable: true });
  });

  it("does not count a rental reservation ending on the requested start date", () => {
    expect(
      getMockAvailability("scooter-50cc", {
        startDate: "2026-10-08",
        endDate: "2026-10-09",
      }),
    ).toEqual({ available: 5, requested: 1, isAvailable: true });
  });

  it("subtracts tour bookings from the selected slot capacity", () => {
    expect(
      getMockAvailability("tour-island", {
        date: "2026-10-05",
        slotId: "morning",
        quantity: 6,
      }),
    ).toEqual({ available: 5, requested: 6, isAvailable: false });
  });

  it("returns unavailable when the selected tour slot does not exist", () => {
    expect(
      getMockAvailability("tour-island", {
        date: "2026-10-06",
        slotId: "morning",
      }),
    ).toEqual({ available: 0, requested: 1, isAvailable: false });
  });

  it("surfaces unknown product identifiers", () => {
    expect(() => getMockAvailability("missing", {})).toThrow("Unknown product");
  });
});
