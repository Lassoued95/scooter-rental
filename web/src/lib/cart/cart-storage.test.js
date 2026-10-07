import { describe, expect, it } from "vitest";
import {
  CART_STORAGE_KEY,
  CART_TTL_MS,
  loadCart,
  parseCart,
  sanitizeItem,
  saveCart,
} from "./cart-storage.js";

const NOW = Date.parse("2026-10-07T10:00:00Z");

const validItem = (overrides = {}) => ({
  id: "abc-123",
  kind: "rental",
  productId: "tank-125",
  slug: "tank-125",
  name: "Tank 125",
  image: { url: "https://res.cloudinary.com/demo/image/upload/x.jpg", publicId: "x" },
  startDate: "2026-10-12",
  endDate: "2026-10-14",
  quantity: 2,
  pricing: {
    basePrice: 25,
    priceTiers: [{ minDays: 3, pricePerDay: 22 }],
    currency: "EUR",
  },
  addedAt: NOW - 1000,
  ...overrides,
});

function fakeStorage(initial = {}) {
  const data = { ...initial };
  let writes = 0;
  return {
    getItem: (key) => (key in data ? data[key] : null),
    setItem: (key, value) => {
      data[key] = String(value);
      writes += 1;
    },
    removeItem: (key) => {
      delete data[key];
    },
    get writes() {
      return writes;
    },
  };
}

describe("sanitizeItem", () => {
  it("accepte un article valide", () => {
    expect(sanitizeItem(validItem(), NOW)).not.toBeNull();
  });

  it.each([
    ["dates inversées", { startDate: "2026-10-14", endDate: "2026-10-12" }],
    ["date impossible", { startDate: "2026-02-31" }],
    ["quantité nulle", { quantity: 0 }],
    ["quantité trop grande", { quantity: 11 }],
    ["type inconnu", { kind: "hotel" }],
    ["prix négatif", { pricing: { basePrice: -5, priceTiers: [] } }],
    ["article expiré", { addedAt: NOW - CART_TTL_MS - 1 }],
    ["tour sur plusieurs jours", { kind: "tour", endDate: "2026-10-15" }],
  ])("rejette : %s", (_label, overrides) => {
    expect(sanitizeItem(validItem(overrides), NOW)).toBeNull();
  });

  it("supprime une image non sécurisée mais garde l'article", () => {
    const item = sanitizeItem(validItem({ image: { url: "http://exemple.com/x.jpg" } }), NOW);
    expect(item.image).toBeNull();
  });

  it("ne garde pas les champs inconnus", () => {
    const item = sanitizeItem(validItem({ isAdmin: true }), NOW);
    expect(item.isAdmin).toBeUndefined();
  });
});

describe("parseCart / loadCart / saveCart", () => {
  it("renvoie un panier vide pour des données corrompues", () => {
    expect(parseCart("pas du json", NOW)).toEqual([]);
    expect(parseCart(JSON.stringify({ v: 2, items: [] }), NOW)).toEqual([]);
    expect(parseCart(JSON.stringify({ v: 1, items: "x" }), NOW)).toEqual([]);
  });

  it("écarte les articles invalides et expirés", () => {
    const json = JSON.stringify({
      v: 1,
      items: [validItem(), validItem({ id: "x", quantity: 0 }), validItem({ id: "y", addedAt: 0 })],
    });
    expect(parseCart(json, NOW)).toHaveLength(1);
  });

  it("sauvegarde puis recharge", () => {
    const storage = fakeStorage();
    const items = [sanitizeItem(validItem(), NOW)];
    saveCart(items, storage);
    expect(loadCart(storage, NOW)).toEqual(items);
  });

  it("n'écrit pas si le contenu est identique", () => {
    const storage = fakeStorage();
    const items = [sanitizeItem(validItem(), NOW)];
    saveCart(items, storage);
    saveCart(items, storage);
    expect(storage.writes).toBe(1);
  });

  it("supprime la clé quand le panier est vide", () => {
    const storage = fakeStorage({ [CART_STORAGE_KEY]: "{}" });
    saveCart([], storage);
    expect(storage.getItem(CART_STORAGE_KEY)).toBeNull();
  });

  it("fonctionne sans stockage disponible", () => {
    expect(loadCart(null, NOW)).toEqual([]);
    expect(() => saveCart([], null)).not.toThrow();
  });
});