import { getTranslations } from "next-intl/server";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export async function SiteFooter() {
  const t = await getTranslations("layout");

  return (
    <footer className="mt-auto w-full bg-brand-section text-section-text">
      <div className="mx-auto flex min-h-24 w-[calc(100%-2rem)] max-w-6xl items-center justify-between gap-4 py-4 text-[0.9rem] text-section-text max-sm:w-[calc(100%-1.25rem)] max-sm:flex-col max-sm:items-start max-sm:justify-center max-sm:py-6">
        <Link
          className="inline-flex items-center gap-[0.7rem] font-display text-[1.15rem] font-bold text-section-text max-sm:gap-[0.4rem] max-sm:text-[0.85rem]"
          href="/"
        >
          <Image
            alt=""
            className="block size-12 shrink-0 rounded-[0.55rem] object-cover"
            height={64}
            src="/logos/location-scooter-djerba-logo.png"
            width={64}
          />
          <span>{t("brand")}</span>
        </Link>
        <div className="flex flex-wrap items-center gap-[0.6rem] text-section-text">
          <span>{t("footer")}</span>
          <a className="hover:text-accent focus-visible:text-accent" href="tel:+21628340240">
            {t("call")}: +216 28 340 240
          </a>
        </div>
      </div>
    </footer>
  );
}
