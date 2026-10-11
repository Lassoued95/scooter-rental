import { MapPin, MessageCircle, Phone } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { Float, Reveal } from "@/components/motion/reveal";
import { FaqList } from "@/components/faq/faq-list";

const WHATSAPP_NUMBER = "21628340240";
const PHONE_LINK = "tel:+21628340240";
const MAPS_URL =
  "https://www.google.com/maps/place/Location+Scooter+Djerba/@33.8516212,10.9854728,17z/";

const GROUPS = ["booking", "payment", "vehicles", "practical"];

// enabled: false = la question n'est ni affichée ni traduite.
// À ACTIVER seulement quand le gérant a confirmé la réponse, puis ajouter
// "questions.<id>.q" et "questions.<id>.a" dans les 6 fichiers de messages :
//   ageLicence (âge minimum et permis), fuel (carburant), returnTime (heure de retour),
//   cancellation (politique d'annulation), hours (horaires), breakdown (panne ou accident)
const FAQ_ITEMS = [
  { id: "howToBook", group: "booking", enabled: true },
  { id: "confirmation", group: "booking", enabled: true },
  { id: "severalVehicles", group: "booking", enabled: true },
  { id: "changeOrCancel", group: "booking", enabled: true },
  { id: "cancellation", group: "booking", enabled: false },

  { id: "howToPay", group: "payment", enabled: true },
  { id: "deposit", group: "payment", enabled: true },
  { id: "included", group: "payment", enabled: true },

  { id: "whichVehicles", group: "vehicles", enabled: true },
  { id: "condition", group: "vehicles", enabled: true },
  { id: "availability", group: "vehicles", enabled: true },
  { id: "ageLicence", group: "vehicles", enabled: false },
  { id: "fuel", group: "vehicles", enabled: false },

  { id: "hotelPickup", group: "practical", enabled: true },
  { id: "where", group: "practical", enabled: true },
  { id: "contact", group: "practical", enabled: true },
  { id: "returnTime", group: "practical", enabled: false },
  { id: "hours", group: "practical", enabled: false },
  { id: "breakdown", group: "practical", enabled: false },
];

export async function generateMetadata({ params }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: `/${locale}/faq`,
      languages: Object.fromEntries(
        routing.locales.map((l) => [l, `/${l}/faq`]),
      ),
    },
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function FaqPage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");

  const items = FAQ_ITEMS.filter((item) => item.enabled).map((item) => ({
    id: item.id,
    group: item.group,
    question: t(`questions.${item.id}.q`),
    answer: t(`questions.${item.id}.a`),
  }));

  // on n'affiche un thème que s'il contient au moins une question
  const groups = GROUPS.filter((id) => items.some((item) => item.group === id)).map(
    (id) => ({ id, label: t(`groups.${id}`) }),
  );

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    t("whatsappMessage"),
  )}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* EN-TÊTE */}
      <section
        aria-labelledby="faq-title"
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
        <div className="mx-auto w-[calc(100%-2rem)] max-w-4xl py-20 md:py-28">
          <Reveal y={16}>
            <p className="m-0 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-semibold uppercase tracking-[0.16em] backdrop-blur">
              <span className="size-2 animate-pulse rounded-full bg-primary" />
              {t("eyebrow")}
            </p>
            <h1
              className="mb-0 mt-6 font-display text-[clamp(2.5rem,6vw,4.75rem)] leading-[1.05] tracking-[-0.03em] [text-wrap:balance]"
              id="faq-title"
            >
              {t("title")}
            </h1>
            <p className="mb-0 mt-5 max-w-xl text-[clamp(1.05rem,1.6vw,1.25rem)] leading-relaxed text-section-text/85">
              {t("intro")}
            </p>
          </Reveal>
        </div>
      </section>

      {/* QUESTIONS */}
      <section className="bg-background py-14 text-foreground md:py-20">
        <div className="mx-auto w-[calc(100%-2rem)] max-w-3xl">
          <FaqList
            allLabel={t("all")}
            filterLabel={t("filterLabel")}
            groups={groups}
            items={items}
          />
        </div>
      </section>

      {/* UNE AUTRE QUESTION ? */}
      <section
        aria-labelledby="faq-contact-title"
        className="bg-background pb-20 text-foreground md:pb-28"
      >
        <div className="mx-auto w-[calc(100%-2rem)] max-w-3xl">
          <Reveal className="relative isolate overflow-hidden rounded-3xl bg-primary px-6 py-12 text-center text-primary-foreground shadow-2xl md:px-12 md:py-16">
            <Float
              className="absolute -right-12 -top-12 -z-10 size-52 rounded-full bg-brand-section/10"
              distance={12}
              duration={6}
            />
            <Float
              className="absolute -bottom-16 -left-8 -z-10 size-48 rounded-full bg-white/20"
              distance={10}
              duration={5}
            />
            <h2
              className="m-0 font-display text-[clamp(1.8rem,4vw,2.75rem)] leading-tight [text-wrap:balance]"
              id="faq-contact-title"
            >
              {t("stillTitle")}
            </h2>
            <p className="mx-auto mb-0 mt-3 max-w-md text-lg font-medium">
              {t("stillText")}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-section px-7 text-base font-bold text-section-text transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:-translate-y-0.5"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" size={18} />
                {t("ctaWhatsapp")}
              </a>
              <a
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-background px-7 text-base font-bold text-foreground transition duration-200 hover:-translate-y-0.5 hover:shadow-xl focus-visible:-translate-y-0.5"
                href={PHONE_LINK}
              >
                <Phone aria-hidden="true" size={18} />
                {t("ctaCall")}
              </a>
            </div>
            <a
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline decoration-primary-foreground/40 underline-offset-4 hover:decoration-primary-foreground"
              href={MAPS_URL}
              rel="noreferrer"
              target="_blank"
            >
              <MapPin aria-hidden="true" size={16} />
              {t("address")}
            </a>
          </Reveal>
        </div>
      </section>
    </>
  );
}