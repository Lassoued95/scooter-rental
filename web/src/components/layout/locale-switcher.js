"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const t = useTranslations("layout");

  return (
    <nav className="locale-links" aria-label={t("language")}>
      {routing.locales.map((supportedLocale) => (
        <Link
          aria-current={locale === supportedLocale ? "page" : undefined}
          className="locale-link"
          href={pathname}
          key={supportedLocale}
          locale={supportedLocale}
          hrefLang={supportedLocale}
        >
          {supportedLocale.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
