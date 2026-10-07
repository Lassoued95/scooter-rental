export function formatMoney(amount, locale, currency = "EUR") {
  const hasCents = Math.round(amount * 100) % 100 !== 0;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Équivalent approximatif en dinars ; null si le taux est inconnu
export function eurToTnd(amountEur, rate) {
  if (!Number.isFinite(rate) || rate <= 0) return null;
  return Math.round(amountEur * rate * 100) / 100;
}