// Transforme un produit "excursion" en données simples pour la carte
export function toExcursionCard(product) {
  const image = product.images?.[0];
  const amount = Number(product.price?.amount ?? product.price);

  return {
    id: product.id,
    slug: product.slug ?? product.id,
    name: product.name,
    description: product.tagline || product.description || "",
    tourType: product.tourType ?? null,
    unit: product.price?.unit ?? product.priceUnit ?? "person",
    price: Number.isFinite(amount) ? amount : null,
    currency: product.currency ?? product.price?.currency ?? "EUR",
    places: Number(product.capacityPerSlot) || null,
    // même convention que les scooters : publicId Cloudinary, sinon URL distante
    image: image?.publicId
      ? { src: image.publicId, cloudinary: true }
      : image?.url
        ? { src: image.url, remote: true }
        : null,
  };
}