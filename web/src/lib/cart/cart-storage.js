import { isIsoDate } from "./dates.js";
import { MAX_ITEMS, MAX_QUANTITY } from "./cart-reducer.js";

export const CART_STORAGE_KEY = "lsd-cart-v1";
export const CART_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 jours

const isText = (value, max) =>
  typeof value === "string" && value.length > 0 && value.length <= max;

function getDefaultStorage() {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null; // navigation privée ou stockage bloqué
  }
}

// Seuls les champs valides du stockage navigateur sont conservés.
export function sanitizeItem(raw, now = Date.now()) {
  if (!raw || typeof raw !== "object") return null;

  const { id, kind, productId, slug, name, image, startDate, endDate, quantity, pricing, addedAt } = raw;

  if (!isText(id, 80) || !isText(productId, 100) || !isText(name, 200)) return null;
  if (kind !== "rental" && kind !== "tour") return null;
  if (!isIsoDate(startDate) || !isIsoDate(endDate) || endDate < startDate) return null;
  if (kind === "tour" && endDate !== startDate) return null;
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) return null;
  if (!Number.isFinite(addedAt) || addedAt > now + 60_000 || now - addedAt > CART_TTL_MS) return null;
  if (!pricing || !Number.isFinite(pricing.basePrice) || pricing.basePrice < 0) return null;

  const priceTiers = Array.isArray(pricing.priceTiers)
    ? pricing.priceTiers
        .filter(
          (tier) =>
            Number.isFinite(tier?.minDays) &&
            Number.isFinite(tier?.pricePerDay) &&
            tier.pricePerDay >= 0,
        )
        .slice(0, 10)
        .map((tier) => ({ minDays: tier.minDays, pricePerDay: tier.pricePerDay }))
    : [];

  const cleanImage =
    image &&
    typeof image === "object" &&
    isText(image.url, 500) &&
    image.url.startsWith("https://")
      ? { url: image.url, publicId: isText(image.publicId, 200) ? image.publicId : null }
      : null;

  return {
    id,
    kind,
    productId,
    slug: isText(slug, 120) ? slug : productId,
    name,
    image: cleanImage,
    startDate,
    endDate,
    quantity,
    pricing: {
      basePrice: pricing.basePrice,
      priceTiers,
      currency: isText(pricing.currency, 3) ? pricing.currency : "EUR",
    },
    addedAt,
  };
}

export function parseCart(json, now = Date.now()) {
  try {
    const data = JSON.parse(json);
    if (!data || data.v !== 1 || !Array.isArray(data.items)) return [];
    return data.items
      .map((raw) => sanitizeItem(raw, now))
      .filter(Boolean)
      .slice(0, MAX_ITEMS);
  } catch {
    return [];
  }
}

export function loadCart(storage = getDefaultStorage(), now = Date.now()) {
  if (!storage) return [];
  try {
    const json = storage.getItem(CART_STORAGE_KEY);
    return json ? parseCart(json, now) : [];
  } catch {
    return [];
  }
}

export function saveCart(items, storage = getDefaultStorage()) {
  if (!storage) return;
  try {
    if (items.length === 0) {
      storage.removeItem(CART_STORAGE_KEY);
      return;
    }
    const json = JSON.stringify({ v: 1, items });
    // on n'écrit que si le contenu a changé : évite les boucles entre onglets
    if (storage.getItem(CART_STORAGE_KEY) !== json) {
      storage.setItem(CART_STORAGE_KEY, json);
    }
  } catch {
    // stockage plein ou bloqué : le panier reste en mémoire pour cette visite
  }
}