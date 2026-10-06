import { addMockReservation, getMockAvailability } from "@/lib/mock/availability";
import { faqs, options, reviews, settings, tourSlots } from "@/lib/mock/data";
import { reservationSchema } from "@/lib/schemas";

const MOCK_DELAY_MS = 80;
const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export { getProduct, getProducts } from "./products";

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

async function request(path, options) {
  const response = await fetch(`${apiBaseUrl}${path}`, options);
  if (!response.ok) {
    throw new Error(`API request failed (${response.status} ${response.statusText}): ${path}`);
  }
  return response.json();
}

export async function getAvailability(productId, requestOptions) {
  if (apiBaseUrl) {
    const query = new URLSearchParams(requestOptions);
    return request(`/products/${encodeURIComponent(productId)}/availability?${query}`);
  }
  await delay();
  return getMockAvailability(productId, requestOptions);
}

export async function getTourSlots(date) {
  if (apiBaseUrl) {
    return request(`/tour-slots?date=${encodeURIComponent(date)}`);
  }
  await delay();
  return tourSlots.filter((slot) => slot.date === date);
}

export async function createReservation(input) {
  const reservation = reservationSchema.parse({
    ...input,
    id: input.id ?? `reservation-${globalThis.crypto.randomUUID()}`,
    status: input.status ?? "PENDING",
  });

  if (apiBaseUrl) {
    return request("/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reservation),
    });
  }

  await delay();
  addMockReservation(reservation);
  return reservation;
}

export async function getOptions() {
  if (apiBaseUrl) return request("/options");
  await delay();
  return options.filter((option) => option.active);
}

export async function getSettings() {
  if (apiBaseUrl) return request("/settings");
  await delay();
  return settings;
}

export async function getReviews() {
  if (apiBaseUrl) return request("/reviews");
  await delay();
  return reviews;
}

export async function getFaqs() {
  if (apiBaseUrl) return request("/faqs");
  await delay();
  return faqs;
}
