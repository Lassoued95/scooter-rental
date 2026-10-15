import Image from "next/image";
import {
  BadgeCheck,
  BatteryCharging,
  Bike,
  Car,
  Feather,
  Gauge,
  HardHat,
  Lock,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Float, Reveal } from "@/components/motion/reveal";
import { WordReveal } from "@/components/motion/word-reveal";
import { ParallaxImage } from "@/components/motion/parallax-image";
import { CountUp } from "@/components/motion/count-up";
import { SpotlightCard } from "@/components/motion/spotlight-card";
import { Marquee } from "@/components/motion/marquee";

const WHATSAPP_NUMBER = "21628340240";
const PHONE_LINK = "tel:+21628340240";

const stats = [
  { key: "founded", value: 2023, from: 2015 },
  { key: "rating", value: 4.9, decimals: 1, suffix: "/5" },
  { key: "vehicles", value: 5 },
  { key: "deposit", value: 0 },
];

const fleet = [
  { key: "scooter50", Icon: Feather, span: "md:col-span-2" },
  { key: "scooter125", Icon: Gauge, span: "md:col-span-2" },
  { key: "electricScooter", Icon: Zap, span: "md:col-span-2" },
  { key: "electricBike", Icon: BatteryCharging, span: "md:col-span-3" },
  { key: "bike", Icon: Bike, span: "md:col-span-3" },
];

const included = [
  { key: "helmet", Icon: HardHat },
  { key: "lock", Icon: Lock },
  { key: "insurance", Icon: ShieldCheck },
  { key: "pickup", Icon: Car },
  { key: "condition", Icon: Sparkles },
  { key: "deposit", Icon: BadgeCheck },
];

const ctaButton =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-base font-bold transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:-translate-y-0.5";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/about`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/about`]),
      ),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function AboutPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  const tl = await getTranslations("layout");

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("whatsappMessage"),
  )}`;

  const includedLabels = included.map(({ key }) => t(`included.${key}`));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: "Location Scooter Djerba",
    description: t("metaDescription"),
    telephone: "+21628340240",
    foundingDate: "2023",
    address: {
      "@type": "PostalAddress",
      streetAddress: t("locationText"),
      addressLocality: "Djerba",
      addressCountry: "TN",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* HERO */}
      <section
        aria-labelledby="about-title"
        className="relative isolate flex min-h-[min(92svh,56rem)] items-end overflow-hidden bg-brand-section text-section-text"
      >
        <ParallaxImage
          className="absolute inset-0 -z-20"
          position="center 40%"
          priority
          src="/bg/bg2.png"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-t from-brand-section/90 via-brand-section/35 to-brand-section/10"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-linear-to-r from-brand-section/70 via-brand-section/20 to-transparent"
        />

        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl pb-32 pt-32 md:pb-44">
          <Reveal y={16}>
            <p className="m-0 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {t("eyebrow")}
            </p>
          </Reveal>

          <WordReveal
            as="h1"
            className="mt-6 max-w-[15ch] font-display text-[clamp(2.6rem,6.2vw,5.5rem)] leading-[1.03] tracking-[-0.03em] [text-shadow:0_2px_30px_rgb(0_0_0/0.45)] [text-wrap:balance]"
            id="about-title"
            text={t("title")}
          />

          <Reveal delay={0.55} y={20}>
            <p className="mt-6 max-w-xl text-[clamp(1.05rem,1.6vw,1.3rem)] leading-relaxed [text-shadow:0_1px_16px_rgb(0_0_0/0.5)]">
              {t("intro")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* CHIFFRES */}
      <div className="relative z-10 mx-auto -mt-20 w-[calc(100%-2rem)] max-w-6xl">
        <Reveal>
          <ul className="m-0 grid list-none grid-cols-2 gap-px overflow-hidden rounded-3xl border border-border bg-border p-0 shadow-2xl lg:grid-cols-4">
            {stats.map(({ key, value, from, decimals, suffix }) => (
              <li
                className="border-t-4 border-primary bg-surface px-4 py-7 text-center"
                key={key}
              >
                <p className="m-0 font-display text-[clamp(2.1rem,4vw,3.25rem)] leading-none text-secondary">
                  <CountUp
                    decimals={decimals}
                    from={from}
                    suffix={suffix}
                    to={value}
                  />
                </p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted sm:text-sm">
                  {t(`stats.${key}`)}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      {/* HISTOIRE */}
      <section
        aria-labelledby="story-title"
        className="bg-background pb-20 pt-24 text-foreground md:pb-28 md:pt-32"
      >
        <div className="mx-auto grid w-[calc(100%-2rem)] max-w-6xl items-center gap-16 lg:grid-cols-2">
          <Reveal>
            <span className="mb-6 block h-1 w-16 rounded-full bg-primary" />
            <h2
              className="m-0 font-display text-[clamp(2rem,3.8vw,3.25rem)] leading-tight text-secondary"
              id="story-title"
            >
              {t("storyTitle")}
            </h2>
            <p className="mt-6 font-display text-[clamp(1.3rem,2.2vw,1.8rem)] leading-snug text-foreground">
              {t("storyP1")}
            </p>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted">
              {t("storyP2")}
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            {/* TODO: remplacer par de vraies photos de l'agence et de la flotte */}
            <div className="relative mx-auto w-full max-w-xl pb-10 pl-6 lg:max-w-none">
              <div className="relative ml-auto aspect-[4/5] w-[86%] overflow-hidden rounded-3xl shadow-2xl">
                <ParallaxImage
                  alt={t("storyImageAlt")}
                  className="absolute inset-0"
                  sizes="(min-width: 1024px) 40vw, 90vw"
                  src="/bg/bg3.png"
                />
              </div>
              <div className="absolute bottom-0 left-0 aspect-square w-[46%] overflow-hidden rounded-3xl border-8 border-background shadow-2xl">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  sizes="25vw"
                  src="/bg/bg.png"
                />
              </div>
              <Float className="absolute left-0 top-8">
                <div className="rounded-2xl bg-primary px-5 py-4 text-primary-foreground shadow-xl">
                  <p className="m-0 text-xs font-bold uppercase tracking-[0.16em]">
                    {t("stats.founded")}
                  </p>
                  <p className="m-0 font-display text-4xl leading-none">2023</p>
                </div>
              </Float>
            </div>
          </Reveal>
        </div>
      </section>

      {/* BANDEAU */}
      <div className="bg-primary py-4 font-display text-xl text-primary-foreground md:text-2xl">
        <Marquee items={includedLabels} />
      </div>

      {/* FLOTTE */}
      <section
        aria-labelledby="fleet-title"
        className="bg-surface-elevated py-20 text-foreground md:py-28"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
          <Reveal className="max-w-2xl">
            <span className="mb-6 block h-1 w-16 rounded-full bg-primary" />
            <h2
              className="m-0 font-display text-[clamp(2rem,3.8vw,3.25rem)] leading-tight text-secondary"
              id="fleet-title"
            >
              {t("fleetTitle")}
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted">
              {t("fleetIntro")}
            </p>
          </Reveal>

          <ul className="mt-12 grid list-none gap-5 p-0 md:grid-cols-6">
            {fleet.map(({ key, Icon, span }, index) => (
              <Reveal
                as="li"
                className={span}
                delay={index * 0.08}
                key={key}
              >
                <SpotlightCard className="h-full p-7">
                  <Icon
                    aria-hidden="true"
                    className="pointer-events-none absolute -bottom-6 -right-6 size-36 rotate-12 text-primary/10"
                    strokeWidth={1.25}
                  />
                  <p className="m-0 font-display text-sm font-bold tracking-[0.2em] text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <span className="mt-5 inline-flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
                    <Icon aria-hidden="true" size={26} />
                  </span>
                  <h3 className="mb-0 mt-5 font-display text-2xl text-foreground">
                    {t(`fleet.${key}.name`)}
                  </h3>
                  <p className="mb-0 mt-2 max-w-sm leading-relaxed text-muted">
                    {t(`fleet.${key}.text`)}
                  </p>
                </SpotlightCard>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* INCLUS */}
      <section
        aria-labelledby="included-title"
        className="relative isolate overflow-hidden bg-brand-section py-20 text-section-text md:py-28"
      >
        <div
          aria-hidden="true"
          className="absolute -left-24 top-0 -z-10 size-96 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -right-24 -z-10 size-96 rounded-full bg-accent/15 blur-3xl"
        />
        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
          <Reveal className="max-w-2xl">
            <span className="mb-6 block h-1 w-16 rounded-full bg-primary" />
            <h2
              className="m-0 font-display text-[clamp(2rem,3.8vw,3.25rem)] leading-tight"
              id="included-title"
            >
              {t("includedTitle")}
            </h2>
          </Reveal>

          <ul className="mt-12 grid list-none gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
            {included.map(({ key, Icon }, index) => (
              <Reveal as="li" delay={index * 0.07} key={key}>
                <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-primary/70 hover:bg-white/10">
                  <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon aria-hidden="true" size={22} />
                  </span>
                  <span className="text-lg font-semibold">
                    {t(`included.${key}`)}
                  </span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* LOCALISATION */}
      <section
        aria-labelledby="location-title"
        className="bg-background py-20 text-foreground md:py-28"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
          <Reveal className="relative overflow-hidden rounded-3xl border border-border shadow-2xl">
            <iframe
              allowFullScreen
              className="block h-[26rem] w-full border-0 lg:h-[34rem] dark:[filter:invert(0.9)_hue-rotate(180deg)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              src="https://www.google.com/maps?q=33.8516212,10.9854728&z=17&output=embed"
              title={t("mapTitle")}
            />
            <div className="border-t border-border bg-surface p-6 lg:absolute lg:left-6 lg:top-6 lg:w-[23rem] lg:rounded-2xl lg:border lg:bg-surface/95 lg:shadow-xl lg:backdrop-blur">
              <h2
                className="m-0 font-display text-3xl leading-tight text-secondary"
                id="location-title"
              >
                {t("locationTitle")}
              </h2>
              <p className="mb-0 mt-4 flex items-start gap-3 leading-relaxed">
                <MapPin
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-primary"
                  size={22}
                />
                <span>{t("locationText")}</span>
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  className={buttonVariants({ variant: "secondary" })}
                  href="https://www.google.com/maps/place/Location+Scooter+Djerba/@33.8516212,10.9854728,17z/"
                  rel="noreferrer"
                  target="_blank"
                >
                  <Navigation aria-hidden="true" size={16} />
                  <span>{t("directions")}</span>
                </a>
                <a
                  className={buttonVariants({ variant: "ghost" })}
                  href={PHONE_LINK}
                >
                  <Phone aria-hidden="true" size={16} />
                  <span>{tl("call")}</span>
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* APPEL À L'ACTION */}
      <section
        aria-labelledby="cta-title"
        className="bg-background pb-20 text-foreground md:pb-28"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-16 text-center text-primary-foreground shadow-2xl md:px-16 md:py-24">
            <Float
              className="absolute -right-16 -top-16 -z-10 size-72 rounded-full bg-brand-section/10"
              distance={14}
              duration={6}
            />
            <Float
              className="absolute -bottom-20 -left-10 -z-10 size-64 rounded-full bg-white/20"
              distance={12}
              duration={5}
            />
            <h2
              className="m-0 mx-auto max-w-[18ch] font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] [text-wrap:balance]"
              id="cta-title"
            >
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto mb-0 mt-4 max-w-xl text-lg font-medium">
              {t("ctaText")}
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                className={`${ctaButton} bg-brand-section text-section-text`}
                href="/scooters"
              >
                {t("ctaBook")}
              </Link>
              <a
                className={`${ctaButton} bg-background text-foreground`}
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={18} />
                <span>{t("ctaWhatsapp")}</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}