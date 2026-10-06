const SERVER_BASE = process.env.API_URL ?? "http://localhost:5000";
const BROWSER_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// Lecture (GET) : mise en cache côté Next.js pendant `revalidate` secondes.
// Écriture (POST...) : jamais de cache.
export async function apiFetch(path, { revalidate = 300, ...options } = {}) {
  const base = typeof window === "undefined" ? SERVER_BASE : BROWSER_BASE;
  const isRead = !options.method || options.method.toUpperCase() === "GET";

  let response;
  try {
    response = await fetch(`${base}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...options.headers },
      ...(isRead ? { next: { revalidate } } : { cache: "no-store" }),
    });
  } catch {
    throw new ApiError("API unreachable", 503);
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? response.statusText, response.status);
  }

  return data;
}