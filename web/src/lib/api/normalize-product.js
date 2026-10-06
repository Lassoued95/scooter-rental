const SUPPORTED_LOCALES = ["fr", "en", "de", "it", "pl", "pt"];

function asRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value
    : {};
}

function textValue(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function listValue(value) {
  return Array.isArray(value)
    ? value.filter((entry) => typeof entry === "string" && entry.trim())
    : null;
}

function localizedValue(raw, field, locale, fallback = "") {
  const translations = asRecord(raw.translations);
  const localized = asRecord(raw[field]);
  const sources = [
    ...Object.entries(translations).map(([language, fields]) => [
      language,
      asRecord(fields)[field],
    ]),
    ...Object.entries(localized).map(([language, value]) => [language, value]),
  ];
  const values = new Map();

  for (const [language, value] of sources) {
    const normalized = Array.isArray(value) ? listValue(value) : textValue(value);
    if (normalized !== null) values.set(language, normalized);
  }

  const directValue = Array.isArray(raw[field])
    ? listValue(raw[field])
    : textValue(raw[field]);
  if (directValue !== null) values.set("direct", directValue);

  const order = [locale, "en", "fr", ...values.keys()];
  for (const language of order) {
    if (values.has(language)) return values.get(language);
  }
  if (values.has("direct")) return values.get("direct");
  return fallback;
}

function normalizeImages(raw) {
  const source = raw.images ?? raw.image;
  const entries = Array.isArray(source) ? source : source ? [source] : [];
  return entries.flatMap((entry) => {
    if (typeof entry === "string" && entry.trim()) {
      return [{ url: entry.trim() }];
    }
    const image = asRecord(entry);
    if (typeof image.url !== "string" || !image.url.trim()) return [];
    return [
      {
        url: image.url.trim(),
        ...(typeof image.publicId === "string" ? { publicId: image.publicId } : {}),
      },
    ];
  });
}

function normalizePrice(raw) {
  const price = asRecord(raw.price);
  const amount = Number(raw.price?.amount ?? raw.price ?? raw.amount ?? 0);
  const tiers = raw.priceTiers ?? price.tiers ?? raw.pricing?.tiers;
  const sourceTiers = Array.isArray(tiers) ? tiers : [];
  const priceTiers = sourceTiers.flatMap((tier) => {
    const value = asRecord(tier);
    const minDays = Number(value.minDays ?? value.minimumDays ?? 1);
    const pricePerDay = Number(
      value.pricePerDay ?? value.amount ?? value.price ?? value.rate ?? NaN,
    );
    if (!Number.isFinite(minDays) || !Number.isFinite(pricePerDay)) return [];
    return [
      {
        minDays,
        pricePerDay,
        ...(typeof value.currency === "string" ? { currency: value.currency } : {}),
        ...(typeof value.unit === "string" ? { unit: value.unit } : {}),
      },
    ];
  });

  if (
    priceTiers.length === 0 &&
    Number.isFinite(amount) &&
    raw.category !== "tour" &&
    raw.type !== "tour"
  ) {
    priceTiers.push({
      minDays: 1,
      pricePerDay: amount,
      ...(typeof price.currency === "string" ? { currency: price.currency } : {}),
      ...(typeof price.unit === "string" ? { unit: price.unit } : {}),
    });
  }

  return {
    amount: Number.isFinite(amount) ? amount : 0,
    currency:
      typeof price.currency === "string" ? price.currency : undefined,
    unit: typeof price.unit === "string" ? price.unit : undefined,
    tiers: priceTiers,
  };
}

function normalizeSpecs(raw, locale) {
  const specs = asRecord(raw.specs);
  const engine = raw.engine ?? specs.engine ?? specs.engineCc;
  const parsedEngine = typeof engine === "number"
    ? engine
    : Number.parseInt(String(engine ?? ""), 10);
  return {
    ...specs,
    ...(Number.isFinite(parsedEngine) ? { engineCc: parsedEngine } : {}),
    ...(raw.engine !== undefined ? { engine: raw.engine } : {}),
    ...(raw.transmission !== undefined || specs.transmission !== undefined
      ? { transmission: raw.transmission ?? specs.transmission }
      : {}),
    ...(raw.fuel !== undefined || specs.fuel !== undefined
      ? {
          fuel: localizedValue(
            { fuel: raw.fuel ?? specs.fuel, translations: raw.translations },
            "fuel",
            locale,
          ),
        }
      : {}),
  };
}

function normalizeType(raw) {
  if (raw.type === "tour" || raw.category === "tour") return "tour";
  if (
    raw.type === "free rental" ||
    raw.rentalType === "free" ||
    (raw.category === "rental" && raw.rentalType === "free")
  ) {
    return "free rental";
  }
  return "vehicle";
}

/**
 * Converts either a Firestore API document or a localized mock product to the
 * locale-specific shape consumed by product UI.
 * @param {Object} raw
 * @param {string} locale
 * @returns {import("@/types").Product}
 */
export function normalizeProduct(raw, locale = "fr") {
  const source = asRecord(raw);
  const id = textValue(source.id) ?? textValue(source.slug) ?? "unknown-product";
  const images = normalizeImages(source);
  const price = normalizePrice(source);
  const category =
    textValue(source.category) ??
    (source.type === "tour" ? "tour" : source.type === "rental" ? "vehicle" : "rental");
  const highlights = localizedValue(source, "highlights", locale, []);
  const meetingPoint = localizedValue(source, "meetingPoint", locale, "");
  const supportedLocale = SUPPORTED_LOCALES.includes(locale) ? locale : "fr";

  return {
    id,
    slug: textValue(source.slug) ?? id,
    type: normalizeType(source),
    category,
    name: localizedValue(source, "name", supportedLocale, id),
    tagline: localizedValue(source, "tagline", supportedLocale),
    description: localizedValue(source, "description", supportedLocale),
    highlights: Array.isArray(highlights) ? highlights : [],
    ...(meetingPoint ? { meetingPoint } : {}),
    price: price.amount,
    priceTiers: price.tiers,
    ...(price.currency ? { currency: price.currency } : {}),
    ...(price.unit ? { priceUnit: price.unit } : {}),
    stock:
      source.stock !== null && source.stock !== undefined &&
      Number.isFinite(Number(source.stock))
        ? Number(source.stock)
        : null,
    ...(Number.isFinite(Number(source.capacityPerSlot))
      ? { capacityPerSlot: Number(source.capacityPerSlot) }
      : {}),
    ...(Number.isFinite(Number(source.durationHours))
      ? { durationHours: Number(source.durationHours) }
      : {}),
    specs: normalizeSpecs(source, supportedLocale),
    images,
    placeholderImage: images.length === 0,
    active: source.active !== false,
    order: Number.isFinite(Number(source.order)) ? Number(source.order) : 0,
    isTestData: source.isTestData === true,
  };
}
