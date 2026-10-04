import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";

export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  return (
    <section className="home-hero" aria-labelledby="welcome">
      <Image
        alt={t("imageAlt")}
        className="home-hero-image"
        fill
        priority
        quality={90}
        sizes="(max-width: 40rem) 100vw, 62vw"
        src="/bg/bg.png"
      />
      <div aria-hidden="true" className="home-hero-overlay" />
      <div className="home-hero-content">
        <h1 id="welcome">{t("title")}</h1>
        <p className="home-hero-description">{t("description")}</p>
        <p className="home-hero-tagline">{t("tagline")}</p>
      </div>
    </section>
  );
}
