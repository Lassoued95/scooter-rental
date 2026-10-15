import {
  ArrowRight,
  Bike,
  CalendarCheck,
  MessageCircle,
  MousePointerClick,
  Sparkles,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";
import { StepsTimeline } from "@/components/home/steps-timeline";

const STEPS = [
  { key: "choose", Icon: MousePointerClick },
  { key: "request", Icon: CalendarCheck },
  { key: "confirm", Icon: MessageCircle },
  { key: "ride", Icon: Bike },
];

export async function HowItWorks() {
  const t = await getTranslations("home.how");

  return (
    <section
      aria-labelledby="how-title"
      className="relative overflow-hidden bg-surface-elevated py-20 text-foreground md:py-28"
    >
      {/* ---------- Décor d'arrière-plan ---------- */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-20 size-[26rem] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute -right-40 bottom-20 size-[26rem] rounded-full bg-primary/10 blur-[120px]" />
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)",
            backgroundSize: "28px 28px",
            maskImage:
              "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at 50% 40%, black 20%, transparent 70%)",
          }}
        />
      </div>

      <div className="relative mx-auto w-[calc(100%-2rem)] max-w-4xl">
        {/* ---------- En-tête ---------- */}
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="m-0 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            <Sparkles aria-hidden="true" size={14} />
            {t("eyebrow")}
          </p>
          <h2
            className="mb-0 mt-5 font-display text-[clamp(2.1rem,4vw,3.5rem)] font-bold leading-[1.08] tracking-tight text-secondary [text-wrap:balance]"
            id="how-title"
          >
            {t("title")}
          </h2>
          <div
            aria-hidden="true"
            className="mx-auto mt-6 flex items-center justify-center gap-2"
          >
            <span className="h-1 w-3 rounded-full bg-primary/30" />
            <span className="h-1 w-16 rounded-full bg-primary" />
            <span className="h-1 w-3 rounded-full bg-primary/30" />
          </div>
          <p className="mb-0 mt-6 text-lg leading-relaxed text-muted">
            {t("intro")}
          </p>
        </Reveal>

        {/* ---------- Frise ---------- */}
        <div className="mt-16">
          <StepsTimeline>
            <ol className="m-0 grid list-none gap-10 p-0">
              {STEPS.map(({ key, Icon }, index) => {
                const onLeft = index % 2 === 0;
                const number = String(index + 1).padStart(2, "0");

                return (
                  <Reveal
                    as="li"
                    className="relative pl-16 md:grid md:grid-cols-2 md:pl-0"
                    key={key}
                  >
                    {/* Pastille d'étape */}
                    <span className="absolute left-6 top-7 z-10 -translate-x-1/2 md:left-1/2">
                      <span
                        aria-hidden="true"
                        className="absolute inset-0 rounded-full bg-primary/40 blur-md"
                      />
                      <span className="relative flex size-14 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-xl shadow-primary/40 ring-8 ring-surface-elevated">
                        <Icon aria-hidden="true" size={24} />
                      </span>
                    </span>

                    {/* Carte */}
                    <div
                      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/50 via-border to-border p-px shadow-sm transition duration-300 hover:-translate-y-1 hover:from-primary hover:shadow-2xl hover:shadow-primary/15 md:max-w-md ${
                        onLeft
                          ? "md:col-start-1 md:mr-14 md:justify-self-end"
                          : "md:col-start-2 md:ml-14"
                      }`}
                    >
                      <div className="relative h-full overflow-hidden rounded-[calc(1.5rem-1px)] bg-surface p-6 sm:p-7">
                        {/* Numéro en filigrane */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -right-2 -top-4 select-none font-display text-[7rem] font-black leading-none text-transparent transition duration-500 group-hover:scale-110"
                          style={{
                            WebkitTextStroke:
                              "1.5px color-mix(in srgb, currentColor 14%, transparent)",
                          }}
                        >
                          {number}
                        </span>

                        {/* Halo au survol */}
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute -bottom-12 -left-12 size-40 rounded-full bg-primary/0 blur-3xl transition duration-500 group-hover:bg-primary/20"
                        />

                        <div className="relative">
                          <p className="m-0 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 font-display text-xs font-bold tracking-[0.2em] text-primary">
                            {t("eyebrow")} · {number}
                          </p>
                          <h3 className="mb-0 mt-4 font-display text-2xl font-bold leading-snug text-foreground">
                            {t(`steps.${key}.title`)}
                          </h3>
                          <p className="mb-0 mt-3 leading-relaxed text-muted">
                            {t(`steps.${key}.text`)}
                          </p>

                          <span
                            aria-hidden="true"
                            className="mt-5 block h-1 w-10 rounded-full bg-primary transition-all duration-500 group-hover:w-24"
                          />
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </StepsTimeline>
        </div>

        {/* ---------- Appel à l'action ---------- */}
        <Reveal className="mt-16 flex justify-center">
          <Link
            className={`${buttonVariants({ variant: "primary" })} group relative overflow-hidden rounded-full px-9 shadow-lg shadow-primary/30 transition duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-primary/40`}
            href="/scooters"
          >
            <span
              aria-hidden="true"
              className="absolute inset-y-0 -left-full w-1/2 -skew-x-12 bg-white/35 transition-all duration-700 group-hover:left-[150%]"
            />
            <span className="relative font-bold">{t("cta")}</span>
            <ArrowRight
              aria-hidden="true"
              className="relative transition duration-300 group-hover:translate-x-1"
              size={18}
            />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}