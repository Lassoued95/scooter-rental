"use client";

import { useTranslations } from "next-intl";

export default function LocaleError({ reset }) {
  const t = useTranslations("errors");

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-text">{t("title")}</h1>
      <p className="mt-4 max-w-xl text-muted">{t("apiUnavailable")}</p>
      <button
        className="mt-8 rounded-full bg-primary px-6 py-3 font-semibold text-white hover:bg-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        onClick={reset}
        type="button"
      >
        {t("retry")}
      </button>
    </section>
  );
}
