import { apiFetch } from "./client";

export function getAvailability(productId, startDate, endDate) {
  const query = new URLSearchParams({ start: startDate, end: endDate });
  return apiFetch(
    `/api/products/${encodeURIComponent(productId)}/availability?${query}`,
    { revalidate: 15 },
  );
}
