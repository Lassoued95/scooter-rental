
import { MessageCircle, Phone } from "lucide-react";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "./locale-switcher";
import { SiteNavigation } from "./site-navigation";
import { ThemeToggle } from "./theme-toggle";
import { buttonVariants } from "@/components/ui/button";

const PHONE_LINK = "tel:+21628340240";
const PHONE_DISPLAY = "+216 28 340 240";

export async function SiteHeader() {
  const t = await getTranslations("layout");

  return (
    <>
      {/* Top band: phone number */}
      <div className="bg-brand-section text-section-text">
        <div className="mx-auto flex min-h-10 w-[calc(100%-2rem)] max-w-6xl items-center max-sm:w-[calc(100%-1.25rem)]">
          <a
            className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary"
            href={PHONE_LINK}
          >
            <Phone aria-hidden="true" className="shrink-0 text-primary" size={16} />
            <span>
              {t("callUs")} {PHONE_DISPLAY}
            </span>
          </a>
        </div>
      </div>

      <header className="sticky top-0 z-10 border-b border-border bg-background/95 text-foreground backdrop-blur-md">
        <div className="mx-auto flex min-h-[4.75rem] w-[calc(100%-2rem)] max-w-6xl items-center justify-between gap-4 max-sm:min-h-[4.25rem] max-sm:w-[calc(100%-1.25rem)]">
          <Link
            aria-label={t("brand")}
            className="inline-flex shrink-0 items-center gap-[0.7rem] font-display text-[1.15rem] font-bold text-secondary max-sm:gap-[0.4rem] max-sm:text-[0.85rem]"
            href="/"
          >
            <Image
              alt=""
              className="block size-16 shrink-0 rounded-[0.55rem] object-cover max-sm:size-[3.25rem]"
              height={80}
              priority
              src="/logos/location-scooter-djerba-logo.png"
              width={80}
            />
            <span>{t("brand")}</span>
          </Link>
          <SiteNavigation />
          <div className="flex shrink-0 items-center gap-[0.6rem] max-sm:gap-[0.35rem]">
            <ThemeToggle />
            <LocaleSwitcher />
            <a
              className={`${buttonVariants({ variant: "primary" })} max-md:hidden`}
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
    </>
  );
}   

