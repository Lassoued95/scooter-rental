function parseImage(raw) {
  if (!raw) return null;

  if (typeof raw === "string") {
    if (raw.startsWith("http")) return { src: raw, remote: true };
    if (raw.startsWith("/")) return { src: raw };
    return { src: raw, cloudinary: true }; // bare publicId
  }

  if (raw.publicId) return { src: raw.publicId, cloudinary: true };
  const url = raw.url ?? raw.src;
  return url ? parseImage(url) : null;
}

function pickFromPrice(product) {
  const tiers = product.priceTiers ?? product.prices ?? [];
  const values = tiers
    .map((tier) => tier.pricePerDay ?? tier.price)
    .filter(Number.isFinite);
  if (values.length) return Math.min(...values);

  const single = product.pricePerDay ?? product.price ?? product.basePrice;
  return Number.isFinite(single) ? single : null;
}

function pickGroup(product) {
  const text = `${product.name} ${product.specs?.engine ?? ""}`.toLowerCase();
  if (text.includes("electric") || product.specs?.fuel === "electric") {
    return "electric";
  }
  const match = text.match(/(\d{2,3})/);
  if (match) return Number(match[1]) >= 100 ? "125" : "50";
  return "50";
}

export function toScooterCard(product) {
  const group = pickGroup(product);
  const cc = `${product.name} ${product.specs?.engine ?? ""}`.match(/(\d{2,3})\s*cc/i);

  return {
    id: product.id ?? product.slug,
    slug: product.slug ?? product.id,
    name: product.name,
    description: product.description ?? "",
    image: parseImage(product.images?.[0] ?? product.image ?? product.imageUrl),
    fromPrice: pickFromPrice(product),
    group,
    engine: cc ? `${cc[1]}cc` : null,
    fuel: group === "electric" ? "electric" : (product.specs?.fuel ?? "petrol"),
  };
}