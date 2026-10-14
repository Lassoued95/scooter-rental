import { getTranslations, setRequestLocale } from "next-intl/server";
import { getProducts } from "@/lib/api/products";
import { routing } from "@/i18n/routing";
import { toExcursionCard } from "@/lib/excursion-card";
import { ExcursionsGrid } from "@/components/excursions/excursions-grid";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "excursions" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/excursions`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/excursions`]),
      ),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function ExcursionsPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [t, fetched] = await Promise.all([
    getTranslations("excursions"),
    getProducts({ locale, type: "tour" }),
  ]);

  const tours = fetched
    .filter((product) => product.type === "tour")
    .sort(
      (left, right) =>
        (left.order ?? 0) - (right.order ?? 0) ||
        left.name.localeCompare(right.name, locale),
    );

  return (
    <div className="bg-background text-foreground">
      <section className="mx-auto max-w-6xl px-5 pb-8 pt-14 sm:px-8 sm:pt-20">
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">
          {t("eyebrow")}
        </p>
        <h1 className="m-0 max-w-3xl font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
          {t("title")}
        </h1>
        <p className="mb-0 mt-5 max-w-3xl text-base leading-7 text-muted sm:text-lg">
          {t("intro")}
        </p>
        <p className="mb-0 mt-5 max-w-4xl text-sm font-medium leading-6 text-secondary">
          {t("trustLine")}
        </p>
      </section>

      <section
        aria-label={t("title")}
        className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8"
      >
        <ExcursionsGrid items={tours.map(toExcursionCard)} />
      </section>
    </div>
  );
}