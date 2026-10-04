import { MessageCircle } from "lucide-react";
import Image from "next/image";
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
          <Image
            alt=""
            className="brand-logo"
            height={80}
            priority
            src="/logos/location-scooter-djerba-logo.png"
            width={80}
          />
          <span>{t("brand")}</span>
        </Link>
        <div className="header-actions">
          <ThemeToggle />
          <LocaleSwitcher />
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
