import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <section className="page-shell home-placeholder" aria-labelledby="welcome">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1 id="welcome">{t("title")}</h1>
      <p className="placeholder-copy">{t("description")}</p>
    </section>
  );
}
