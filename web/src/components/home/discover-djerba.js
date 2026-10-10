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
  { key: "guellala", image: "/discover/sidi-mahrez.webp" },
  { key: "midoun", image: "/discover/midoun.webp" },
  { key: "sidiMahrez", image: "/discover/guellala.webp" },
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

  return (
    <section
      aria-labelledby="discover-title"
      className="overflow-hidden bg-background py-20 text-foreground md:py-28"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
        <Reveal className="max-w-2xl">
          <p className="m-0 text-sm font-bold uppercase tracking-[0.18em] text-primary">
            {t("eyebrow")}
          </p>
          <h2
            className="mb-0 mt-4 font-display text-[clamp(2rem,3.8vw,3.25rem)] leading-tight text-secondary [text-wrap:balance]"
            id="discover-title"
          >
            {t("title")}
          </h2>
          <p className="mb-0 mt-4 text-lg leading-relaxed text-muted">
            {t("intro")}
          </p>
        </Reveal>
      </div>

      <div className="mt-10">
        <DestinationsCarousel
          items={items}
          labels={{
            region: t("regionLabel"),
            prev: t("prev"),
            next: t("next"),
          }}
        />
      </div>

      <Reveal className="mx-auto mt-8 flex w-[calc(100%-2rem)] max-w-6xl flex-wrap items-center gap-4">
        <p className="m-0 text-lg font-semibold">{t("ctaText")}</p>
        <Link className={buttonVariants({ variant: "primary" })} href="/scooters">
          {t("ctaButton")}
        </Link>
      </Reveal>
    </section>
  );
}