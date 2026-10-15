import { BadgeCheck, Car, MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SiteNavigation } from "./site-navigation";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const PHONE_LINK = "tel:+21628340240";
const PHONE_DISPLAY = "+216 28 340 240";
const WHATSAPP_LINK = "https://wa.me/21628340240";

export async function SiteHeader() {
  const t = await getTranslations("layout");
  const tf = await getTranslations("footer");

  return (
    <>
      {/* ---------- Bande supérieure ---------- */}
      <div className="relative bg-brand-section text-section-text">
        <div className="mx-auto flex min-h-11 w-[calc(100%-2rem)] max-w-6xl items-center justify-between gap-4 max-sm:w-[calc(100%-1.25rem)]">
          <a
            className="group inline-flex items-center gap-2.5 text-sm font-semibold transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
            href={PHONE_LINK}
          >
            <span className="relative inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary transition duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
              <span
                aria-hidden="true"
                className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-duration:2.5s]"
              />
              <Phone aria-hidden="true" className="relative" size={14} />
            </span>
            <span className="max-sm:text-[13px]">
              {t("callUs")}{" "}
              <span className="font-bold tracking-wide">{PHONE_DISPLAY}</span>
            </span>
          </a>

          <ul className="m-0 hidden list-none items-center gap-6 p-0 text-xs font-semibold text-section-text/80 md:flex">
            <li className="flex items-center gap-2">
              <Car aria-hidden="true" className="text-primary" size={15} />
              {tf("perks.pickup")}
            </li>
            <li aria-hidden="true" className="h-3.5 w-px bg-white/20" />
            <li className="flex items-center gap-2">
              <BadgeCheck aria-hidden="true" className="text-primary" size={15} />
              {tf("perks.deposit")}
            </li>
          </ul>
        </div>

        {/* Filet d'accent */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent"
        />
      </div>

      {/* ---------- Header principal ---------- */}
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/80 text-foreground shadow-[0_8px_30px_-12px_rgba(0,0,0,0.25)] backdrop-blur-xl supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto flex min-h-[4.75rem] w-[calc(100%-2rem)] max-w-6xl items-center justify-between gap-4 max-sm:min-h-[4.25rem] max-sm:w-[calc(100%-1.25rem)]">
          {/* Logo */}
          <Link
            aria-label={t("brand")}
            className="group inline-flex shrink-0 items-center gap-3.5 font-display text-[1.15rem] font-bold tracking-tight text-secondary max-sm:gap-2.5 max-sm:text-[0.85rem]"
            href="/"
          >
            <span className="relative inline-flex shrink-0">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-xl bg-primary/40 opacity-0 blur-lg transition duration-500 group-hover:opacity-100"
              />
              <Image
                alt=""
                className="relative block size-14 shrink-0 rounded-xl object-cover ring-1 ring-border transition duration-300 group-hover:scale-105 max-sm:size-[3rem]"
                height={80}
                priority
                src="/logos/location-scooter-djerba-logo.png"
                width={80}
              />
            </span>
            <span>{t("brand")}</span>
          </Link>

          {/* Navigation */}
          <SiteNavigation />

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2.5 max-sm:gap-1.5">
            <ThemeToggle />
            <LocaleSwitcher />

            {/* CTA desktop */}
            <a
              className={`${buttonVariants({ variant: "primary" })} group relative overflow-hidden rounded-full px-6 shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40 max-md:hidden`}
              href={WHATSAPP_LINK}
              rel="noreferrer"
              target="_blank"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/30 transition-all duration-700 group-hover:left-[150%]"
              />
              <MessageCircle aria-hidden="true" className="relative" size={16} />
              <span className="relative">{t("book")}</span>
            </a>

            {/* CTA mobile : icône seule */}
            <a
              aria-label={t("book")}
              className="inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition duration-200 hover:-translate-y-0.5 md:hidden"
              href={WHATSAPP_LINK}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={18} />
            </a>
          </div>
        </div>

        {/* Filet dégradé sous le header */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
      </header>
    </>
  );
}