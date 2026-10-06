import { ApiError, apiFetch } from "./client";
import { products as mockProducts } from "../mock/data";
import { normalizeProduct } from "./normalize-product";

const USE_MOCK = process.env.USE_MOCK === "true";
const MOCK_DELAY_MS = 80;

function delay() {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function matchesType(product, type) {
  if (!type) return true;
  return product.type === (type === "rental" ? "vehicle" : type);
}

function getRawProducts(payload) {
  if (!Array.isArray(payload?.products)) {
    throw new ApiError("Invalid products response from API", 502);
  }
  return payload.products;
}

async function fetchApiProducts(locale) {
  const payload = await apiFetch("/api/products", { revalidate: 300 });
  return getRawProducts(payload).map((product) =>
    normalizeProduct(product, locale),
  );
}

export async function getApiProducts(locale = "fr") {
  return fetchApiProducts(locale);
}

/**
 * @param {{ locale?: string, category?: string, type?: string }} [filters]
 */
export async function getProducts({ locale = "fr", category, type } = {}) {
  let products;
  if (USE_MOCK) {
    await delay();
    products = mockProducts
      .filter((product) => product.active)
      .map((product) => normalizeProduct(product, locale));
  } else {
    products = await fetchApiProducts(locale);
  }

  return products
    .filter(
      (product) =>
        product.active &&
        (!category || product.category === category) &&
        matchesType(product, type),
    )
    .sort((left, right) => left.order - right.order);
}

export async function getProduct(id, locale = "fr") {
  if (USE_MOCK) {
    await delay();
    const product = mockProducts.find(
      (candidate) =>
        (candidate.id === id || candidate.slug === id) && candidate.active,
    );
    return product ? normalizeProduct(product, locale) : null;
  }

  try {
    const payload = await apiFetch(
      `/api/products/${encodeURIComponent(id)}`,
      { revalidate: 300 },
    );
    if (!payload?.product || typeof payload.product !== "object") {
      throw new ApiError("Invalid product response from API", 502);
    }
    const product = normalizeProduct(payload.product, locale);
    return product.active ? product : null;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}
