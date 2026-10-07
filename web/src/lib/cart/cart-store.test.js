import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  dispatch,
  getServerSnapshot,
  getSnapshot,
  resetCartStoreForTests,
  subscribe,
} from "./cart-store.js";

const item = {
  id: "i-1",
  kind: "rental",
  productId: "tank-125",
  slug: "tank-125",
  name: "Tank 125",
  image: null,
  startDate: "2026-10-12",
  endDate: "2026-10-14",
  quantity: 1,
  pricing: { basePrice: 25, priceTiers: [], currency: "EUR" },
  addedAt: 1,
};

describe("cart store", () => {
  beforeEach(() => resetCartStoreForTests());

  it("démarre avec un panier vide", () => {
    expect(getSnapshot().items).toEqual([]);
  });

  it("notifie les abonnés puis arrête après désabonnement", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);

    dispatch({ type: "add", item });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getSnapshot().items).toHaveLength(1);

    unsubscribe();
    dispatch({ type: "clear" });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("ne notifie pas pour une action sans effet", () => {
    const listener = vi.fn();
    subscribe(listener);
    dispatch({ type: "remove", id: "inconnu" });
    expect(listener).not.toHaveBeenCalled();
  });

  it("renvoie la même référence tant que rien ne change", () => {
    expect(getSnapshot()).toBe(getSnapshot());
  });

  it("garde un snapshot serveur stable et vide", () => {
    expect(getServerSnapshot()).toBe(getServerSnapshot());
    expect(getServerSnapshot().items).toEqual([]);
  });
});