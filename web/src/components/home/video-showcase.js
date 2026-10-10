import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { BackgroundVideo } from "@/components/home/background-video";

export async function VideoShowcase() {
  const t = await getTranslations("home");
  const td = await getTranslations("home.discover");

  return (
    <section
      aria-labelledby="video-tagline"
      className="relative isolate flex min-h-[70svh] items-end overflow-hidden bg-brand-section text-section-text"
    >
      <BackgroundVideo
        className="absolute inset-0 -z-20 size-full"
        mp4="/video/video.mp4"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-brand-section/85 via-brand-section/25 to-transparent"
      />

      <Reveal className="mx-auto w-[calc(100%-2rem)] max-w-6xl pb-12 pt-32 md:pb-16">
        <p
          className="m-0 max-w-[18ch] font-display text-[clamp(2rem,5vw,4rem)] leading-[1.05] tracking-[-0.02em] [text-shadow:0_2px_24px_rgb(0_0_0/0.5)] [text-wrap:balance]"
          id="video-tagline"
        >
          {t("tagline")}
        </p>
        <Link
          className={`${buttonVariants({ variant: "primary" })} mt-6`}
          href="/scooters"
        >
          {td("ctaButton")}
        </Link>
      </Reveal>
    </section>
  );
}