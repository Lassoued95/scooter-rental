import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

function mergeFallbackMessages(fallback, messages) {
  return Object.fromEntries(
    Array.from(new Set([...Object.keys(fallback), ...Object.keys(messages)]), (key) => {
      const fallbackValue = fallback[key];
      const messageValue = messages[key];
      const isObject =
        fallbackValue !== null &&
        messageValue !== null &&
        typeof fallbackValue === "object" &&
        typeof messageValue === "object" &&
        !Array.isArray(fallbackValue) &&
        !Array.isArray(messageValue);

      return [
        key,
        isObject
          ? mergeFallbackMessages(fallbackValue, messageValue)
          : messageValue ?? fallbackValue,
      ];
    }),
  );
}

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  const [messages, englishMessages] = await Promise.all([
    import(`../../messages/${locale}.json`),
    import("../../messages/en.json"),
  ]);

  return {
    locale,
    messages: mergeFallbackMessages(englishMessages.default, messages.default),
  };
});
