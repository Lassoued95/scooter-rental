"use client";

import { useMemo, useSyncExternalStore } from "react";
import { MAX_ITEMS } from "@/lib/cart/cart-reducer";
import { sanitizeItem } from "@/lib/cart/cart-storage";
import { computeCartTotal } from "@/lib/cart/pricing";
import {
  dispatch,
  getServerSnapshot,
  getSnapshot,
  subscribe,
} from "@/lib/cart/cart-store";

const subscribeNothing = () => () => {};

// false pendant le rendu serveur et l'hydratation, puis true : évite un flash « panier vide »
function useHydrated() {
  return useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
}

function newId() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
}

// Actions stables : définies une seule fois, hors de React
const actions = {
  addItem(input) {
    const item = sanitizeItem({
      ...input,
      endDate: input.kind === "tour" ? input.startDate : input.endDate,
      id: newId(),
      addedAt: Date.now(),
    });
    if (!item) return { ok: false, reason: "invalid" };

    const current = getSnapshot().items;
    const exists = current.some(
      (other) =>
        other.productId === item.productId &&
        other.startDate === item.startDate &&
        other.endDate === item.endDate,
    );
    if (!exists && current.length >= MAX_ITEMS) {
      return { ok: false, reason: "max_items" };
    }

    dispatch({ type: "add", item });
    return { ok: true };
  },

  setQuantity(id, quantity) {
    dispatch({ type: "setQuantity", id, quantity });
  },

  setDates(id, startDate, endDate) {
    const target = getSnapshot().items.find((item) => item.id === id);
    if (!target) return;
    dispatch({
      type: "setDates",
      id,
      startDate,
      endDate: target.kind === "tour" ? startDate : endDate,
    });
  },

  removeItem(id) {
    dispatch({ type: "remove", id });
  },
  undoRemove() {
    dispatch({ type: "undoRemove" });
  },
  dismissUndo() {
    dispatch({ type: "dismissUndo" });
  },
  clear() {
    dispatch({ type: "clear" });
  },
};

export function useCart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const hydrated = useHydrated();
  const totals = useMemo(() => computeCartTotal(state.items), [state.items]);

  return useMemo(
    () => ({
      items: state.items,
      lastRemoved: state.lastRemoved,
      count: state.items.length,
      totalQuantity: state.items.reduce((sum, item) => sum + item.quantity, 0),
      totals,
      hydrated,
      ...actions,
    }),
    [state, totals, hydrated],
  );
}

// Conservé pour ne pas modifier le layout : le panier n'a plus besoin de contexte
export function CartProvider({ children }) {
  return children;
}