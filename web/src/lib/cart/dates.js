const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

// Vérifie un format yyyy-mm-dd ET que la date existe (pas de 2026-02-31)
export function isIsoDate(value) {
  if (typeof value !== "string" || !ISO_DATE.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function toUtcDay(value) {
  const [year, month, day] = value.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
}

// "Aujourd'hui" selon l'heure de Tunis (et pas celle du navigateur du visiteur)
export function todayInTunis(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
}

// RÈGLE MÉTIER : le jour de départ ET le jour de retour comptent
// (du lundi au mercredi = 3 jours). Si le client change la règle,
// c'est ici, et dans la fonction équivalente du backend, qu'il faut modifier.
export function countRentalDays(startDate, endDate) {
  if (!isIsoDate(startDate) || !isIsoDate(endDate)) return 0;
  const diff = Math.round((toUtcDay(endDate) - toUtcDay(startDate)) / 86_400_000);
  return diff < 0 ? 0 : diff + 1;
}