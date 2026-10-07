import { countRentalDays } from "./dates.js";

export { countRentalDays };

const round2 = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

// Prix par jour du palier le plus élevé atteint ; prix de base si aucun palier ne s'applique
export function pickPricePerDay(priceTiers, days, basePrice = 0) {
  const tiers = Array.isArray(priceTiers)
    ? priceTiers
        .filter(
          (tier) =>
            Number.isFinite(tier?.minDays) && Number.isFinite(tier?.pricePerDay),
        )
        .sort((a, b) => a.minDays - b.minDays)
    : [];

  let price = Number.isFinite(basePrice) ? basePrice : 0;
  for (const tier of tiers) {
    if (days >= tier.minDays) price = tier.pricePerDay;
  }
  return price;
}

// Affichage seulement : le prix FINAL est recalculé par le serveur.
export function computeLineTotal(item) {
  const pricing = item.pricing ?? {};
  const quantity = Number.isFinite(item.quantity) ? item.quantity : 1;

  const days =
    item.kind === "tour" ? 1 : countRentalDays(item.startDate, item.endDate);

  const unitPrice =
    item.kind === "tour"
      ? (pricing.basePrice ?? 0)
      : pickPricePerDay(pricing.priceTiers, days, pricing.basePrice);

  return { days, unitPrice, total: round2(unitPrice * days * quantity) };
}

export function computeCartTotal(items) {
  const lines = items.map((item) => ({ id: item.id, ...computeLineTotal(item) }));
  const total = round2(lines.reduce((sum, line) => sum + line.total, 0));
  const currency = items[0]?.pricing?.currency ?? "EUR";
  return { lines, total, currency };
}