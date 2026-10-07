function chooseVehicleTier(days, priceTiers = [], fallbackPrice = 0) {
  const sortedTiers = [...priceTiers].sort((left, right) => left.minDays - right.minDays);
  let selectedTier = null;

  for (const tier of sortedTiers) {
    if (days >= tier.minDays) {
      selectedTier = tier;
    }
  }

  if (!selectedTier) {
    return { minDays: 1, pricePerDay: Number(fallbackPrice) || 0 };
  }

  return selectedTier;
}

function calculateVehicleLineTotal({ days, quantity, priceTiers, fallbackPrice }) {
  const tier = chooseVehicleTier(days, priceTiers, fallbackPrice);
  const unitPrice = Number(tier.pricePerDay) || 0;
  return unitPrice * Number(days) * Number(quantity);
}

function calculateTourLineTotal({ quantity, unitPrice }) {
  return Number(unitPrice || 0) * Number(quantity || 0);
}

module.exports = {
  chooseVehicleTier,
  calculateVehicleLineTotal,
  calculateTourLineTotal,
};
