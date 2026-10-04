import { mockReservations, products, tourSlots } from "./data";

const reservations = [...mockReservations];

function isActiveReservation(reservation) {
  return reservation.status !== "CANCELLED";
}

export function getMockAvailability(productId, request = {}) {
  const product = products.find((candidate) => candidate.id === productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);

  const matchingReservations = reservations.filter(
    (reservation) => reservation.productId === productId && isActiveReservation(reservation),
  );

  if (product.type === "rental") {
    const { startDate, endDate } = request;
    if (!startDate || !endDate || endDate <= startDate) {
      throw new RangeError("Rental availability requires a valid startDate and endDate.");
    }

    const events = matchingReservations.flatMap((reservation) => {
      const overlapStart = reservation.startDate > startDate ? reservation.startDate : startDate;
      const overlapEnd = reservation.endDate < endDate ? reservation.endDate : endDate;
      if (overlapStart >= overlapEnd) return [];
      return [
        { date: overlapStart, quantity: reservation.quantity },
        { date: overlapEnd, quantity: -reservation.quantity },
      ];
    });
    events.sort(
      (left, right) =>
        left.date.localeCompare(right.date) || left.quantity - right.quantity,
    );
    let reservedUnits = 0;
    let maxReservedUnits = 0;
    for (const event of events) {
      reservedUnits += event.quantity;
      maxReservedUnits = Math.max(maxReservedUnits, reservedUnits);
    }

    return {
      available: Math.max(0, product.stock - maxReservedUnits),
      requested: request.quantity ?? 1,
      isAvailable: product.stock - maxReservedUnits >= (request.quantity ?? 1),
    };
  }

  const { date, slotId } = request;
  if (!date || !slotId) {
    throw new TypeError("Tour availability requires a date and slotId.");
  }

  const slot = tourSlots.find((candidate) => candidate.id === slotId && candidate.date === date);
  if (!slot) return { available: 0, requested: request.quantity ?? 1, isAvailable: false };

  const reservedPlaces = matchingReservations
    .filter(
      (reservation) => reservation.startDate === date && reservation.slotId === slotId,
    )
    .reduce((sum, reservation) => sum + reservation.quantity, 0);
  const available = Math.max(0, Math.min(slot.capacity, product.capacityPerSlot) - reservedPlaces);
  const requested = request.quantity ?? 1;
  return { available, requested, isAvailable: available >= requested };
}

export function addMockReservation(reservation) {
  reservations.push(reservation);
}
