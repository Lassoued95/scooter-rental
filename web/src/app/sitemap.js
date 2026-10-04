import { routing } from "@/i18n/routing";

function getSiteOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";
  const origin = configuredOrigin.startsWith("http")
    ? configuredOrigin
    : `https://${configuredOrigin}`;

  return new URL(origin).origin;
}

export default function sitemap() {
  const origin = getSiteOrigin();
  const localizedHomePages = Object.fromEntries(
    routing.locales.map((locale) => [locale, `${origin}/${locale}`]),
  );

  return routing.locales.map((locale) => ({
    url: localizedHomePages[locale],
    alternates: { languages: localizedHomePages },
  }));
}
