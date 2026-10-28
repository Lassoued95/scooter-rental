import { defineRouting } from "next-intl/routing";
import localeEntries from "./locales.json";

export const localeConfig = localeEntries;

export const routing = defineRouting({
  locales: localeConfig.map(({ code }) => code),
  defaultLocale: "fr",
  localeDetection: false,
  localePrefix: "always",
  localeCookie: { maxAge: 60 * 60 * 24 * 365 },
  // hreflang is already provided by the page metadata; the automatic
  // Link header points x-default to the unprefixed URL and conflicts with it
  alternateLinks: false,
});