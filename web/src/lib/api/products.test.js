import { afterEach, describe, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("product data layer", () => {
  it("normalizes and filters the existing mock products by locale and type", async () => {
    vi.stubEnv("USE_MOCK", "true");
    const { getProducts, getProduct } = await import("./products");

    const vehicles = await getProducts({ locale: "en", type: "vehicle" });
    const scooter = await getProduct("scooter-50cc", "de");

    expect(vehicles).toHaveLength(3);
    expect(vehicles.every((product) => product.type === "vehicle")).toBe(true);
    expect(vehicles[0].name).toBe("50cc Scooter");
    expect(scooter.name).toBe("50-ccm-Roller");
  });
});
