export function calculateRentalPrice(product, days, quantity = 1) {
  if (!Number.isInteger(days) || days < 1) {
    throw new RangeError("Rental duration must be a positive whole number of days.");
  }
  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new RangeError("Quantity must be a positive whole number.");
  }

  const tiers = [...(product.priceTiers ?? [])].sort(
    (left, right) => right.minDays - left.minDays,
  );
  const tier = tiers.find((candidate) => days >= candidate.minDays);
  const pricePerDay = tier?.pricePerDay ?? product.price;
  return Math.round(pricePerDay * days * quantity * 100) / 100;
}
