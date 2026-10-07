import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Cog,
  Fuel,
  Gauge,
  MessageCircle,
  ShieldCheck,
  Users,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getProducts } from "@/lib/api/products";
import { whatsappCtaClass } from "@/components/scooters/cta";
import { DetailGallery } from "@/components/scooters/detail-gallery";
import {
  FadeUp,
  Float,
  ParallaxText,
  TitleReveal,
} from "@/components/scooters/detail-motion";
import { MobileCtaBar } from "@/components/scooters/mobile-cta-bar";
import { PricingCard } from "@/components/scooters/pricing-card";
import { ReservationForm } from "@/components/scooters/reservation-form";

const WHATSAPP_NUMBER = "21628340240";

export const revalidate = 300;

function formatPrice(amount, locale) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}

function imageSrc(image, width = 1600) {
  if (!image) return null;
  if (image.url) return image.url;

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  return image.publicId && cloudName
    ? `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto,w_${width}/${image.publicId}`
    : null;
}

async function findProduct(slug, locale) {
  const products = await getProducts({ locale, type: "vehicle" });
  return products.find((product) => product.slug === slug) ?? null;
}

export async function generateMetadata({ params }) {
  const { locale, slug } = await params;
  const [product, t] = await Promise.all([
    findProduct(slug, locale),
    getTranslations({ locale, namespace: "products" }),
  ]);

  if (!product) {
    return { title: t("notFoundTitle") };
  }

  const description =
    product.description || product.tagline || t("metaDescription");
  const cover = imageSrc(product.images?.[0]);

  return {
    title: `${product.name} | ${t("metaTitle")}`,
    description,
    alternates: {
      canonical: `/${locale}/scooters/${product.slug}`,
      languages: Object.fromEntries(
        routing.locales.map((supportedLocale) => [
          supportedLocale,
          `/${supportedLocale}/scooters/${product.slug}`,
        ]),
      ),
    },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      ...(cover ? { images: [cover] } : {}),
    },
  };
}

function SectionTitle({ children }) {
  return (
    <>
      <span className="mb-4 block h-1 w-12 rounded-full bg-primary" />
      <h2 className="m-0 font-display text-2xl text-foreground sm:text-3xl">
        {children}
      </h2>
    </>
  );
}

export default async function ScooterDetailsPage({ params }) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const [product, t] = await Promise.all([
    findProduct(slug, locale),
    getTranslations("products"),
  ]);

  if (!product) notFound();

  /* ---------- data ---------- */
  const gallery = (product.images ?? [])
    .map((image, index) => ({
      src: imageSrc(image),
      alt: index === 0 ? product.name : `${product.name} — ${index + 1}`,
    }))
    .filter((image) => image.src);

  const sortedTiers = [...(product.priceTiers ?? [])]
    .filter((tier) => Number.isFinite(tier.pricePerDay))
    .sort((a, b) => a.minDays - b.minDays);
  const basePrice = sortedTiers[0]?.pricePerDay;
  const maxPrice = sortedTiers.length
    ? Math.max(...sortedTiers.map((tier) => tier.pricePerDay))
    : 0;
  const flatPrice = Number(product.price);
  const lowestPrice = sortedTiers.length
    ? Math.min(...sortedTiers.map((tier) => tier.pricePerDay))
    : Number.isFinite(flatPrice)
      ? flatPrice
      : null;

  const tiers = sortedTiers.map((tier) => ({
    key: tier.minDays,
    label:
      tier.minDays === 1
        ? t("detail.oneDay")
        : t("detail.fromDays", { days: tier.minDays }),
    price: formatPrice(tier.pricePerDay, locale),
    ratio: tier.pricePerDay / maxPrice,
    saving:
      basePrice > tier.pricePerDay
        ? Math.round((1 - tier.pricePerDay / basePrice) * 100)
        : 0,
  }));
  const fromPrice = lowestPrice != null ? formatPrice(lowestPrice, locale) : null;
  const singlePrice = tiers.length === 0 ? fromPrice : null;

  const specValue = (group, key) =>
    t.has(`specValues.${group}.${key}`)
      ? t(`specValues.${group}.${key}`)
      : String(key);

  const fuelKey = product.specs?.fuel;
  const transmissionKey = product.specs?.transmission;
  const passengers = product.specs?.passengers;

  const specs = [
    product.specs?.engine && {
      key: "engine",
      Icon: Gauge,
      label: t("detail.engine"),
      value: specValue("engine", product.specs.engine),
    },
    fuelKey && {
      key: "fuel",
      Icon: Fuel,
      label: t("detail.fuel"),
      value: specValue("fuel", fuelKey),
    },
    transmissionKey && {
      key: "transmission",
      Icon: Cog,
      label: t("detail.transmission"),
      value: specValue("transmission", transmissionKey),
    },
    passengers != null &&
      Number.isFinite(Number(passengers)) && {
        key: "passengers",
        Icon: Users,
        label: t("detail.passengers"),
        value: t("specs.passengers", { count: Number(passengers) }),
      },
  ].filter(Boolean);

  const categoryKey = product.category ?? "";
  const category = t.has(`categories.${categoryKey}`)
    ? t(`categories.${categoryKey}`)
    : categoryKey.replaceAll("_", " ");

  const lead = product.tagline || product.description || "";
  const showDescription =
    Boolean(product.description) && lead !== product.description;
  const highlights = product.highlights ?? [];

  const digits = String(product.specs?.engine ?? "").match(/\d{2,3}/)?.[0];
  const watermark = digits ?? (fuelKey === "electric" ? "EV" : null);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("whatsappMessage", { name: product.name }),
  )}`;
  const trust = [
    t("detail.trustPay"),
    t("detail.trustNoDeposit"),
    t("detail.trustHelmets"),
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: gallery.map((image) => image.src),
    ...(lowestPrice != null
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "EUR",
            price: lowestPrice,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };

  /* ---------- render ---------- */
  return (
    <main className="bg-background text-foreground">
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
        type="application/ld+json"
      />

      {/* HERO */}
      <section
        aria-labelledby="product-title"
        className="relative isolate overflow-hidden bg-brand-section text-section-text"
      >
        <div
          aria-hidden="true"
          className="absolute -left-24 top-0 -z-10 size-96 rounded-full bg-primary/25 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-32 -right-24 -z-10 size-[28rem] rounded-full bg-accent/20 blur-3xl"
        />
        {watermark && (
          <ParallaxText className="pointer-events-none absolute -bottom-6 right-0 -z-10 m-0 select-none font-display text-[clamp(7rem,24vw,22rem)] leading-none text-transparent [-webkit-text-stroke:1.5px_rgb(255_255_255/0.12)]">
            {watermark}
          </ParallaxText>
        )}

        <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl pb-28 pt-8 sm:pt-12 lg:pb-32">
          <Link
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 text-sm font-semibold backdrop-blur transition hover:bg-white/20"
            href="/scooters"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            {t("detail.backToVehicles")}
          </Link>

          <div className="mt-10 grid items-center gap-14 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
            <div>
              <FadeUp y={14}>
                <p className="m-0 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] backdrop-blur">
                  <span className="size-2 animate-pulse rounded-full bg-primary" />
                  {category}
                </p>
              </FadeUp>

              <TitleReveal
                className="mb-0 mt-6 font-display text-[clamp(2.4rem,5.2vw,4.5rem)] leading-[1.04] tracking-[-0.03em] [text-wrap:balance]"
                id="product-title"
                text={product.name}
              />

              {lead && (
                <FadeUp delay={0.35} y={18}>
                  <p className="mb-0 mt-5 line-clamp-4 max-w-md text-lg leading-relaxed text-section-text/85">
                    {lead}
                  </p>
                </FadeUp>
              )}

              {fromPrice && (
                <FadeUp delay={0.45} y={18}>
                  <p className="mb-0 mt-8 flex items-baseline gap-2">
                    <span className="text-sm font-semibold uppercase tracking-[0.14em] text-section-text/80">
                      {t("from")}
                    </span>
                    <span className="font-display text-5xl leading-none">
                      {fromPrice}
                    </span>
                    <span className="text-base font-medium text-section-text/80">
                      / {t("perDay")}
                    </span>
                  </p>
                </FadeUp>
              )}

              <FadeUp delay={0.55} y={18}>
                <a
                  className={`${whatsappCtaClass} mt-8`}
                  href={whatsappUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  <MessageCircle aria-hidden="true" size={19} />
                  <span className="relative">{t("bookWhatsapp")}</span>
                </a>
              </FadeUp>
            </div>

            <FadeUp delay={0.2} y={30}>
              <div className="relative">
                {gallery.length > 0 ? (
                  <DetailGallery
                    images={gallery}
                    labels={{
                      region: t("detail.photos"),
                      prev: t("detail.galleryPrev"),
                      next: t("detail.galleryNext"),
                    }}
                  />
                ) : (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-[2rem] border border-white/15 bg-white/5 text-sm font-medium text-section-text/80">
                    {t("detail.noPhoto")}
                  </div>
                )}
                <Float
                  className="absolute -top-4 right-4 z-10 sm:-right-5"
                  distance={6}
                  duration={3.5}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-bold text-primary-foreground shadow-xl">
                    <ShieldCheck aria-hidden="true" size={16} />
                    {t("detail.trustNoDeposit")}
                  </span>
                </Float>
              </div>
            </FadeUp>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <div className="relative -mt-12 rounded-t-[2.5rem] bg-background pb-28 pt-14 lg:pb-24">
        <div className="mx-auto grid w-[calc(100%-2rem)] max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <div className="grid gap-14">
            {showDescription && (
              <FadeUp>
                <SectionTitle>{t("detail.description")}</SectionTitle>
                <p className="mb-0 mt-5 max-w-2xl whitespace-pre-line text-lg leading-8 text-muted">
                  {product.description}
                </p>
              </FadeUp>
            )}

            {specs.length > 0 && (
              <section aria-labelledby="specs-title">
                <FadeUp>
                  <span className="mb-4 block h-1 w-12 rounded-full bg-primary" />
                  <h2
                    className="m-0 font-display text-2xl text-foreground sm:text-3xl"
                    id="specs-title"
                  >
                    {t("detail.specifications")}
                  </h2>
                </FadeUp>
                <ul className="mb-0 mt-6 grid list-none grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))] gap-4 p-0">
                  {specs.map(({ key, Icon, label, value }, index) => (
                    <FadeUp as="li" delay={index * 0.08} key={key}>
                      <div className="h-full rounded-3xl border border-border bg-surface p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
                        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                          <Icon aria-hidden="true" size={22} />
                        </span>
                        <p className="mb-0 mt-4 text-xs font-bold uppercase tracking-[0.14em] text-muted">
                          {label}
                        </p>
                        <p className="mb-0 mt-1 font-display text-xl text-foreground">
                          {value}
                        </p>
                      </div>
                    </FadeUp>
                  ))}
                </ul>
              </section>
            )}

            {highlights.length > 0 && (
              <section aria-labelledby="highlights-title">
                <FadeUp>
                  <span className="mb-4 block h-1 w-12 rounded-full bg-primary" />
                  <h2
                    className="m-0 font-display text-2xl text-foreground sm:text-3xl"
                    id="highlights-title"
                  >
                    {t("detail.highlights")}
                  </h2>
                </FadeUp>
                <ul className="mb-0 mt-6 grid list-none gap-3 p-0 sm:grid-cols-2">
                  {highlights.map((highlight, index) => (
                    <FadeUp as="li" delay={index * 0.06} key={highlight}>
                      <div className="flex h-full items-start gap-3 rounded-2xl border border-border bg-surface p-4">
                        <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                          <Check aria-hidden="true" size={14} strokeWidth={3} />
                        </span>
                        <span className="leading-6 text-foreground">
                          {highlight}
                        </span>
                      </div>
                    </FadeUp>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className="grid gap-8">
            <FadeUp delay={0.1}>
              <PricingCard
                cta={{ href: whatsappUrl, label: t("bookWhatsapp") }}
                perDay={t("perDay")}
                reservationCta={{
                  href: "#reservation",
                  label: t("reservation.submit"),
                }}
                singlePrice={singlePrice}
                tiers={tiers}
                title={t("detail.pricing")}
                trust={trust}
              />
            </FadeUp>
            <FadeUp delay={0.15}>
              <ReservationForm
                productId={product.id}
                stock={product.stock}
                whatsappUrl={whatsappUrl}
              />
            </FadeUp>
          </div>
        </div>
      </div>

      <MobileCtaBar
        fromLabel={t("from")}
        href="#reservation"
        label={t("reservation.submit")}
        perDay={t("perDay")}
        price={fromPrice}
      />
    </main>
  );
}