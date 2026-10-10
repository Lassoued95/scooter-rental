import { Bike, CalendarCheck, MessageCircle, MousePointerClick } from "lucide-react";
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
      className="overflow-hidden bg-surface-elevated py-20 text-foreground md:py-28"
    >
      <div className="mx-auto w-[calc(100%-2rem)] max-w-4xl">
        <Reveal className="max-w-2xl">
          <p className="m-0 text-sm font-bold uppercase tracking-[0.18em] text-primary">
            {t("eyebrow")}
          </p>
          <h2
            className="mb-0 mt-4 font-display text-[clamp(2rem,3.8vw,3.25rem)] leading-tight text-secondary [text-wrap:balance]"
            id="how-title"
          >
            {t("title")}
          </h2>
          <p className="mb-0 mt-4 text-lg leading-relaxed text-muted">
            {t("intro")}
          </p>
        </Reveal>

        <div className="mt-14">
          <StepsTimeline>
            <ol className="m-0 grid list-none gap-10 p-0">
              {STEPS.map(({ key, Icon }, index) => {
                const onLeft = index % 2 === 0;
                return (
                  <Reveal
                    as="li"
                    className="relative pl-16 md:grid md:grid-cols-2 md:pl-0"
                    key={key}
                  >
                    <span className="absolute left-6 top-6 z-10 flex size-12 -translate-x-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-8 ring-surface-elevated md:left-1/2">
                      <Icon aria-hidden="true" size={22} />
                    </span>

                    <div
                      className={`rounded-3xl border border-border bg-surface p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg md:max-w-md ${
                        onLeft
                          ? "md:col-start-1 md:mr-12 md:justify-self-end"
                          : "md:col-start-2 md:ml-12"
                      }`}
                    >
                      <p className="m-0 font-display text-sm font-bold tracking-[0.2em] text-primary">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mb-0 mt-2 font-display text-2xl text-foreground">
                        {t(`steps.${key}.title`)}
                      </h3>
                      <p className="mb-0 mt-2 leading-relaxed text-muted">
                        {t(`steps.${key}.text`)}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </ol>
          </StepsTimeline>
        </div>

        <Reveal className="mt-12">
          <Link
            className={buttonVariants({ variant: "primary" })}
            href="/scooters"
          >
            {t("cta")}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}