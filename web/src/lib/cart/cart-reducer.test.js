import { describe, expect, it } from "vitest";
import {
  MAX_ITEMS,
  MAX_QUANTITY,
  cartReducer,
  initialCartState,
} from "./cart-reducer.js";

let counter = 0;
const makeItem = (overrides = {}) => ({
  id: `item-${++counter}`,
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
  ...overrides,
});

const add = (state, item) => cartReducer(state, { type: "add", item });

describe("cartReducer", () => {
  it("ajoute un article", () => {
    const state = add(initialCartState, makeItem());
    expect(state.items).toHaveLength(1);
  });

  it("fusionne un même produit aux mêmes dates", () => {
    let state = add(initialCartState, makeItem({ quantity: 1 }));
    state = add(state, makeItem({ quantity: 2 }));
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it("plafonne la quantité", () => {
    let state = add(initialCartState, makeItem({ quantity: MAX_QUANTITY }));
    state = add(state, makeItem({ quantity: 5 }));
    expect(state.items[0].quantity).toBe(MAX_QUANTITY);
  });

  it("refuse un onzième article", () => {
    let state = initialCartState;
    for (let i = 0; i < MAX_ITEMS + 2; i += 1) {
      state = add(state, makeItem({ productId: `p-${i}` }));
    }
    expect(state.items).toHaveLength(MAX_ITEMS);
  });

  it("change la quantité en la bornant", () => {
    const item = makeItem();
    let state = add(initialCartState, item);
    state = cartReducer(state, { type: "setQuantity", id: item.id, quantity: 0 });
    expect(state.items[0].quantity).toBe(1);
    state = cartReducer(state, { type: "setQuantity", id: item.id, quantity: 99 });
    expect(state.items[0].quantity).toBe(MAX_QUANTITY);
  });

  it("fusionne deux lignes devenues identiques après un changement de dates", () => {
    const first = makeItem({ startDate: "2026-10-12", endDate: "2026-10-14", quantity: 1 });
    const second = makeItem({ startDate: "2026-10-20", endDate: "2026-10-22", quantity: 2 });
    let state = add(add(initialCartState, first), second);
    state = cartReducer(state, {
      type: "setDates",
      id: second.id,
      startDate: "2026-10-12",
      endDate: "2026-10-14",
    });
    expect(state.items).toHaveLength(1);
    expect(state.items[0].quantity).toBe(3);
  });

  it("supprime puis annule la suppression à la même place", () => {
    const a = makeItem({ productId: "a" });
    const b = makeItem({ productId: "b" });
    const c = makeItem({ productId: "c" });
    let state = [a, b, c].reduce(add, initialCartState);

    state = cartReducer(state, { type: "remove", id: b.id });
    expect(state.items.map((item) => item.productId)).toEqual(["a", "c"]);
    expect(state.lastRemoved.item.productId).toBe("b");

    state = cartReducer(state, { type: "undoRemove" });
    expect(state.items.map((item) => item.productId)).toEqual(["a", "b", "c"]);
    expect(state.lastRemoved).toBeNull();
  });

  it("vide le panier", () => {
    const state = cartReducer(add(initialCartState, makeItem()), { type: "clear" });
    expect(state).toEqual(initialCartState);
  });

  it("ignore une action inconnue", () => {
    expect(cartReducer(initialCartState, { type: "???" })).toBe(initialCartState);
  });
});