import { ArrowRight, Compass, MapPin } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { DestinationsCarousel } from "@/components/home/destinations-carousel";

// TODO : ajouter des photos dans /public/discover puis renseigner "image",
// par exemple image: "/discover/houmt-souk.jpg" (sans photo, un fond coloré s'affiche).
const PLACES = [
  { key: "houmtSouk", image: "/discover/houmt-souk.webp" },
  { key: "erriadh", image: "/discover/erriadh.webp" },
  { key: "guellala", image: "/discover/guellala.webp" },
  { key: "midoun", image: "/discover/midoun.webp" },
  { key: "sidiMahrez", image: "/discover/sidi-mahrez.webp" },
];

export async function DiscoverDjerba() {
  const t = await getTranslations("home.discover");

  const items = PLACES.map(({ key, image }) => ({
    key,
    image,
    imageAlt: image ? t(`places.${key}.name`) : undefined,
    name: t(`places.${key}.name`),
    tag: t(`places.${key}.tag`),
    text: t(`places.${key}.text`),
  }));

  const count = String(PLACES.length).padStart(2, "0");

  return (
    <section
      aria-labelledby="discover-title"
      className="relative overflow-hidden bg-background py-20 text-foreground md:py-28"
    >
      {/* ---------- Décor d'arrière-plan ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-10 size-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-10 size-[28rem] rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 30%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative">
        {/* ---------- En-tête ---------- */}
        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
          <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
            <Reveal className="max-w-2xl">
              <p className="m-0 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
                <Compass aria-hidden="true" size={14} />
                {t("eyebrow")}
              </p>
              <h2
                className="mb-0 mt-5 font-display text-[clamp(2.1rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-secondary [text-wrap:balance]"
                id="discover-title"
              >
                {t("title")}
              </h2>
              <div
                aria-hidden="true"
                className="mt-6 flex items-center gap-2"
              >
                <span className="h-1 w-16 rounded-full bg-primary" />
                <span className="h-1 w-3 rounded-full bg-primary/50" />
                <span className="h-1 w-1.5 rounded-full bg-primary/30" />
              </div>
              <p className="mb-0 mt-6 max-w-xl text-lg leading-relaxed text-muted">
                {t("intro")}
              </p>
            </Reveal>

            {/* Compteur décoratif + CTA desktop */}
            <Reveal className="hidden lg:block" delay={0.1}>
              <div className="flex flex-col items-end gap-5">
                <div className="flex items-end gap-3" aria-hidden="true">
                  <span
                    className="font-display text-[7rem] font-black leading-[0.8] text-transparent"
                    style={{ WebkitTextStroke: "1.5px var(--color-primary, #f97316)" }}
                  >
                    {count}
                  </span>
                  <MapPin className="mb-2 text-primary" size={28} />
                </div>
                <Link
                  className="group inline-flex items-center gap-2 text-sm font-bold uppercase tracking-[0.14em] text-secondary transition-colors hover:text-primary"
                  href="/scooters"
                >
                  {t("ctaButton")}
                  <span className="inline-flex size-9 items-center justify-center rounded-full border border-primary/40 text-primary transition duration-300 group-hover:translate-x-1 group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowRight aria-hidden="true" size={16} />
                  </span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>

        {/* ---------- Carrousel ---------- */}
        <div className="relative mt-12">
          <DestinationsCarousel
            items={items}
            labels={{
              region: t("regionLabel"),
              prev: t("prev"),
              next: t("next"),
            }}
          />
          {/* Fondus latéraux (desktop) */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-background to-transparent xl:block"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-background to-transparent xl:block"
          />
        </div>

        {/* ---------- Bandeau d'appel à l'action ---------- */}
        <Reveal className="mx-auto mt-14 w-[calc(100%-2rem)] max-w-6xl">
          <div className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-brand-section via-brand-section to-brand-section/90 p-7 text-section-text shadow-2xl shadow-black/20 sm:p-9">
            <div
              aria-hidden="true"
              className="absolute -right-16 -top-16 size-64 rounded-full bg-primary/30 blur-3xl"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
            />

            <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/40">
                  <MapPin aria-hidden="true" size={22} />
                </span>
                <p className="m-0 max-w-xl font-display text-xl font-bold leading-snug sm:text-2xl">
                  {t("ctaText")}
                </p>
              </div>

              <Link
                className={`${buttonVariants({ variant: "primary" })} group relative shrink-0 overflow-hidden rounded-full px-8 shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40`}
                href="/scooters"
              >
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]"
                />
                <span className="relative font-bold">{t("ctaButton")}</span>
                <ArrowRight
                  aria-hidden="true"
                  className="relative transition duration-300 group-hover:translate-x-1"
                  size={18}
                />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}