"use client";

import { useTranslations } from "next-intl";

export default function LocaleNotFound() {
  const t = useTranslations("errors");

  return (
    <section className="mx-auto flex min-h-[50vh] max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-text">{t("notFoundTitle")}</h1>
      <p className="mt-4 max-w-xl text-muted">{t("notFoundMessage")}</p>
    </section>
  );
}
