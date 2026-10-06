import { describe, expect, it } from "vitest";
import { normalizeProduct } from "./normalize-product";

describe("normalizeProduct", () => {
  it("uses the requested locale, then English, French, and first available translation", () => {
    const raw = {
      id: "translated-product",
      translations: {
        en: { name: "English name" },
        fr: { name: "Nom français" },
        it: { name: "Nome italiano" },
      },
    };

    expect(normalizeProduct(raw, "de").name).toBe("English name");
    expect(normalizeProduct({ ...raw, translations: { fr: { name: "Nom" } } }, "pt").name)
      .toBe("Nom");
    expect(normalizeProduct({ ...raw, translations: { it: { name: "Nome" } } }, "pt").name)
      .toBe("Nome");
    expect(
      normalizeProduct(
        { ...raw, translations: { en: { name: "English" }, de: { name: "Deutsch" } } },
        "de",
      ).name,
    ).toBe("Deutsch");
  });

  it("normalizes the observed Firestore fields and image URL variants", () => {
    const product = normalizeProduct(
      {
        id: "scooter-id",
        name: "Scooter",
        slug: "scooter",
        category: "scooter",
        engine: "50cc",
        fuel: "petrol",
        transmission: "automatic",
        stock: 6,
        price: { amount: 20, currency: "EUR", unit: "day" },
        active: true,
        isTestData: true,
        images: ["https://res.cloudinary.com/demo/scooter.jpg", {
          url: "https://res.cloudinary.com/demo/side.jpg",
          publicId: "side",
        }],
      },
      "en",
    );

    expect(product).toMatchObject({
      id: "scooter-id",
      slug: "scooter",
      name: "Scooter",
      category: "scooter",
      type: "vehicle",
      price: 20,
      priceTiers: [{ minDays: 1, pricePerDay: 20, currency: "EUR", unit: "day" }],
      stock: 6,
      specs: { engineCc: 50, fuel: "petrol", transmission: "automatic" },
      images: [
        { url: "https://res.cloudinary.com/demo/scooter.jpg" },
        { url: "https://res.cloudinary.com/demo/side.jpg", publicId: "side" },
      ],
      placeholderImage: false,
      active: true,
      isTestData: true,
    });
  });

  it("does not throw for missing fields or translations and marks the placeholder", () => {
    expect(() => normalizeProduct({}, "de")).not.toThrow();
    expect(normalizeProduct({}, "de")).toMatchObject({
      id: "unknown-product",
      name: "unknown-product",
      type: "vehicle",
      description: "",
      highlights: [],
      stock: null,
      images: [],
      placeholderImage: true,
      active: true,
      order: 0,
      isTestData: false,
    });
  });

  it("normalizes tours and Location Free rentals to distinct product types", () => {
    expect(normalizeProduct({ category: "tour" }).type).toBe("tour");
    expect(
      normalizeProduct({ category: "rental", rentalType: "free" }).type,
    ).toBe("free rental");
  });
});
