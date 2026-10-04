import { MessageCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const t = await getTranslations("layout");

  return (
    <header className="site-header">
      <div className="header-inner">
        <Link aria-label={t("brand")} className="brand" href="/">
          <span aria-hidden="true" className="brand-mark">
            <span>S</span>
          </span>
          <span>{t("brand")}</span>
        </Link>
        <div className="header-actions">
          <LocaleSwitcher />
          <ThemeToggle />
          <a
            className="book-link"
            href="https://wa.me/21628340240"
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={16} />
            <span>{t("book")}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
