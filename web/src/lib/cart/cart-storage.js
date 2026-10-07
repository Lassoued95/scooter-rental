import { cartReducer, initialCartState } from "./cart-reducer.js";
import { CART_STORAGE_KEY, loadCart, saveCart } from "./cart-storage.js";

let state = initialCartState;
let loaded = false;
let storageListening = false;
const listeners = new Set();

function emit() {
  for (const listener of listeners) listener();
}

// Lecture du navigateur au premier accès, jamais côté serveur
function ensureLoaded() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  state = { items: loadCart(), lastRemoved: null };
}

// Un autre onglet a modifié le panier
function onStorage(event) {
  if (event.key !== CART_STORAGE_KEY && event.key !== null) return;
  state = { items: loadCart(), lastRemoved: null };
  emit();
}

// L'objet renvoyé doit rester le même tant que rien ne change
export function getSnapshot() {
  ensureLoaded();
  return state;
}

// Ce que voit le serveur (et le premier rendu du navigateur) : un panier vide
export function getServerSnapshot() {
  return initialCartState;
}

export function subscribe(listener) {
  listeners.add(listener);
  if (typeof window !== "undefined" && !storageListening) {
    window.addEventListener("storage", onStorage);
    storageListening = true;
  }
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0 && storageListening) {
      window.removeEventListener("storage", onStorage);
      storageListening = false;
    }
  };
}

export function dispatch(action) {
  ensureLoaded();
  const next = cartReducer(state, action);
  if (next === state) return;
  state = next;
  saveCart(state.items);
  emit();
}

export function resetCartStoreForTests() {
  state = initialCartState;
  loaded = false;
  listeners.clear();
  storageListening = false;
}