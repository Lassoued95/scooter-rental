import { describe, expect, it } from "vitest";
import { localeConfig } from "../../i18n/routing";
import { getLocalizedText } from "../i18n";
import { faqs, options, products, reviews } from "./data";

const translations = [
  ...products.flatMap((product) => [
    product.name,
    product.description,
    product.specs?.fuel,
    product.highlights,
    product.meetingPoint,
  ]),
  ...options.map((option) => option.name),
  ...reviews.map((review) => review.text),
  ...faqs.flatMap((faq) => [faq.question, faq.answer]),
].filter(Boolean);

describe("mock content translations", () => {
  it("provides localized content for every configured locale", () => {
    for (const translation of translations) {
      for (const { code } of localeConfig) {
        expect(translation[code]).toBeDefined();
      }
    }
  });

  it("falls back to English when a locale translation is missing", () => {
    expect(getLocalizedText({ en: "Island tour" }, "pl")).toBe("Island tour");
    expect(getLocalizedText(undefined, "pl")).toBe("");
  });
});
