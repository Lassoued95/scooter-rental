"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, Link } from "@/i18n/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";

const links = [
  { href: "/scooters", key: "navScooters" },
  { href: "/about", key: "navAbout" },
  { href: "/faq", key: "navFaq" },
];

export function SiteNavigation() {
  const pathname = usePathname();

  return <SiteNavigationMenu key={pathname} />;
}

function SiteNavigationMenu() {
  const t = useTranslations("layout");
  const [open, setOpen] = useState(false);

  function closeMenu() {
    setOpen(false);
  }

  return (
    <>
      <nav aria-label={t("mainNavigation")} className="hidden items-center gap-6 md:flex">
        {links.map(({ href, key }) => (
          <Link
            className="text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:text-primary"
            href={href}
            key={key}
          >
            {t(key)}
          </Link>
        ))}
      </nav>
      <div className="flex items-center gap-2 md:hidden">
        <button
          aria-expanded={open}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className="inline-flex size-[2.4rem] items-center justify-center rounded-full border border-border bg-surface text-foreground hover:bg-surface-elevated"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          type="button"
        >
          {open ? (
            <X aria-hidden="true" size={18} />
          ) : (
            <Menu aria-hidden="true" size={18} />
          )}
        </button>
      </div>
      {open && (
        <nav
          aria-label={t("mainNavigation")}
          className="absolute inset-x-0 top-full z-20 grid gap-1 border-b border-border bg-background px-5 pb-5 pt-3 shadow-lg md:hidden"
        >
          {links.map(({ href, key }) => (
            <Link
              className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-foreground hover:bg-surface-elevated focus-visible:bg-surface-elevated"
              href={href}
              key={key}
              onClick={closeMenu}
            >
              {t(key)}
            </Link>
          ))}
          <a
            className={`${buttonVariants({ variant: "primary" })} mt-2 w-full`}
            href="https://wa.me/21628340240"
            onClick={closeMenu}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={16} />
            <span>{t("book")}</span>
          </a>
        </nav>
      )}
    </>
  );
}
