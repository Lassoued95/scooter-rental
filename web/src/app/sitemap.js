import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/api/products";

function getSiteOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.NODE_ENV === "production"
      ? "https://www.scooterdjerba.com"
      : "http://localhost:3000");
  const origin = configuredOrigin.startsWith("http")
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return new URL(origin).origin;
}

export default async function sitemap() {
  const origin = getSiteOrigin();

  let products = [];
  try {
    products = await getProducts({ locale: "fr", type: "vehicle" });
  } catch {
    // build without product pages if the API is unreachable
  }

  const paths = [
    "",
    "/scooters",
    "/about",
    "/faq",
    ...products.map((product) => `/scooters/${product.slug}`),
  ];

  return paths.flatMap((path) => {
    const languages = Object.fromEntries(
      routing.locales.map((locale) => [locale, `${origin}/${locale}${path}`]),
    );

    return routing.locales.map((locale) => ({
      url: `${origin}/${locale}${path}`,
      lastModified: new Date(),
      alternates: { languages },
    }));
  });
}