import { apiFetch } from "./client";

export function createReservation(input) {
  return apiFetch("/api/reservations", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
