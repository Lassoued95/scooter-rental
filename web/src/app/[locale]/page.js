import { getTranslations, setRequestLocale } from "next-intl/server";
import { HeroFlythrough } from "@/components/home/hero-flythrough";
import { DiscoverDjerba } from "@/components/home/discover-djerba";
import { HowItWorks } from "@/components/home/how-it-works";
import { VideoShowcase } from "@/components/home/video-showcase";
export default async function HomePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const images = [
    { src: "/bg/bg.webp", alt: t("imageAlt") },
    { src: "/bg/bg2.webp", alt: "" },
    { src: "/bg/bg3.webp", alt: "" },
  ];

  return (
    <>
      <HeroFlythrough images={images}>
        <h1
          id="welcome"
          className="m-0 max-w-[10ch] font-display text-[clamp(3rem,6vw,5.5rem)] leading-[1.02] tracking-[-0.045em] text-section-text [text-shadow:0_2px_24px_rgb(0_0_0/0.5)] [text-wrap:balance] max-sm:max-w-[12ch] max-sm:text-[clamp(2.35rem,10vw,3.5rem)]"
        >
          {t("title")}
        </h1>
        <p className="mb-0 mt-5 max-w-[35rem] text-[clamp(1rem,1.5vw,1.15rem)] leading-[1.7] text-section-text [text-shadow:0_1px_14px_rgb(0_0_0/0.5)] [text-wrap:pretty] max-sm:mt-4 max-sm:text-base">
          {t("description")}
        </p>
        <p className="mb-0 mt-[0.85rem] max-w-[34rem] text-[clamp(1rem,1.8vw,1.2rem)] font-bold leading-[1.6] text-primary-hover [text-shadow:0_1px_14px_rgb(0_0_0/0.5)]">
          {t("tagline")}
        </p>
      </HeroFlythrough>
      <VideoShowcase />
      <DiscoverDjerba />
      <HowItWorks />
    </>
  );
}