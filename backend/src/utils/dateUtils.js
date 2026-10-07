function toUtcDate(dateString) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return null;
  }

  const [year, month, day] = dateString.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  if (
    Number.isNaN(value.getTime()) ||
    value.getUTCFullYear() !== year ||
    value.getUTCMonth() !== month - 1 ||
    value.getUTCDate() !== day
  ) {
    return null;
  }
  return value;
}

function formatIsoDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getTodayInTunisia() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Tunis",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const parts = formatter.formatToParts(new Date());
  const map = {};
  for (const part of parts) {
    if (part.type !== "literal") {
      map[part.type] = part.value;
    }
  }

  return `${map.year}-${map.month}-${map.day}`;
}

// Rental days are counted inclusively: start day and end day both count.
function countRentalDays(start, end) {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);

  if (!startDate || !endDate) {
    return 0;
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  if (diffMs < 0) {
    return 0;
  }

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

function expandDateRange(start, end) {
  const startDate = toUtcDate(start);
  const endDate = toUtcDate(end);

  if (!startDate || !endDate || endDate.getTime() < startDate.getTime()) {
    return [];
  }

  const days = [];
  const cursor = new Date(startDate.getTime());
  while (cursor.getTime() <= endDate.getTime()) {
    days.push(formatIsoDate(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days;
}

function hasDateOverlap(startA, endA, startB, endB) {
  const startDateA = toUtcDate(startA);
  const endDateA = toUtcDate(endA);
  const startDateB = toUtcDate(startB);
  const endDateB = toUtcDate(endB);

  if (!startDateA || !endDateA || !startDateB || !endDateB) {
    return false;
  }

  return startDateA <= endDateB && startDateB <= endDateA;
}

module.exports = {
  toUtcDate,
  formatIsoDate,
  getTodayInTunisia,
  countRentalDays,
  expandDateRange,
  hasDateOverlap,
};
