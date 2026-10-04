/**
 * Returns a translated value, falling back to English when the locale is absent.
 *
 * @param {Record<string, string> | string | undefined} translations
 * @param {string} locale
 * @returns {string}
 */
export function getLocalizedText(translations, locale) {
  if (typeof translations === "string") return translations;
  return translations?.[locale] || translations?.en || "";
}
