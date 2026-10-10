import Image from "next/image";
import {
  ArrowUp,
  BadgeCheck,
  Car,
  Clock,
  HardHat,
  Lock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/motion/reveal";

/* ---------- À COMPLÉTER AVEC LE CLIENT (vide = masqué) ---------- */
const BUSINESS = {
  phoneDisplay: "+216 28 340 240",
  phoneLink: "+21628340240",
  whatsapp: "21628340240",
  email: "", // ex. "contact@votre-domaine.com"
  facebook: "", // URL complète de la page Facebook
  instagram: "", // URL complète du compte Instagram
  mapsUrl:
    "https://www.google.com/maps/place/Location+Scooter+Djerba/@33.8516212,10.9854728,17z/",
};

const SHOW_HOURS = false; // passer à true quand le texte des horaires est confirmé

// "enabled: false" tant que la page n'existe pas (évite les liens vers une erreur 404)
const EXPLORE_LINKS = [
  { href: "/scooters", key: "navScooters", namespace: "layout", enabled: true },
  { href: "/about", key: "navAbout", namespace: "layout", enabled: true },
  { href: "/faq", key: "navFaq", namespace: "layout", enabled: false },
  { href: "/contact", key: "contact", namespace: "footer", enabled: false },
];

const LEGAL_LINKS = [
  { href: "/terms", key: "terms", enabled: false },
  { href: "/privacy", key: "privacy", enabled: false },
];

const PERKS = [
  { key: "helmet", Icon: HardHat },
  { key: "lock", Icon: Lock },
  { key: "insurance", Icon: ShieldCheck },
  { key: "pickup", Icon: Car },
  { key: "deposit", Icon: BadgeCheck },
];

const columnTitle =
  "m-0 mb-4 text-xs font-bold uppercase tracking-[0.16em] text-primary";
const linkClass =
  "rounded-sm text-section-text/80 transition hover:text-section-text hover:underline hover:decoration-primary hover:underline-offset-4 focus-visible:text-section-text";
const socialClass =
  "inline-flex min-h-10 items-center rounded-full border border-white/25 px-4 text-sm font-semibold text-section-text transition hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tl = await getTranslations("layout");

  const year = new Date().getFullYear();
  const whatsappUrl = `https://wa.me/${BUSINESS.whatsapp}?text=${encodeURIComponent(
    t("whatsappMessage"),
  )}`;

  const exploreLinks = EXPLORE_LINKS.filter((link) => link.enabled).map(
    (link) => ({
      ...link,
      label: link.namespace === "layout" ? tl(link.key) : t(link.key),
    }),
  );
  const legalLinks = LEGAL_LINKS.filter((link) => link.enabled);
  const hasSocial = Boolean(BUSINESS.facebook || BUSINESS.instagram);

  return (
    <footer className="mt-auto w-full bg-brand-section text-section-text">
      {/* Bande d'avantages */}
      <div className="border-b border-white/10">
        <ul className="m-0 mx-auto grid w-[calc(100%-2rem)] max-w-6xl list-none gap-x-6 gap-y-4 p-0 py-6 sm:grid-cols-2 lg:grid-cols-5">
          {PERKS.map(({ key, Icon }) => (
            <li className="flex items-center gap-3 text-sm font-semibold" key={key}>
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon aria-hidden="true" size={18} />
              </span>
              {t(`perks.${key}`)}
            </li>
          ))}
        </ul>
      </div>

      {/* Colonnes */}
      <div className="mx-auto grid w-[calc(100%-2rem)] max-w-6xl gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1.3fr_1fr]">
        <Reveal className="sm:col-span-2 lg:col-span-1">
          <Link
            className="inline-flex items-center gap-3 font-display text-xl font-bold text-section-text"
            href="/"
          >
            <Image
              alt=""
              className="block size-14 shrink-0 rounded-xl object-cover"
              height={64}
              src="/logos/location-scooter-djerba-logo.png"
              width={64}
            />
            <span>{tl("brand")}</span>
          </Link>
          <p className="mb-0 mt-4 max-w-sm leading-7 text-section-text/80">
            {t("tagline")}
          </p>
          <a
            className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-5 text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5"
            href={whatsappUrl}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={18} />
            {t("whatsappCta")}
          </a>
        </Reveal>

        <Reveal delay={0.08}>
          <nav aria-label={t("navLabel")}>
            <h2 className={columnTitle}>{t("exploreTitle")}</h2>
            <ul className="m-0 grid list-none gap-3 p-0">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        <Reveal delay={0.16}>
          <h2 className={columnTitle}>{t("contactTitle")}</h2>
          <ul className="m-0 grid list-none gap-4 p-0 text-section-text/80">
            <li>
              <a
                className="flex items-start gap-3 transition hover:text-section-text"
                href={BUSINESS.mapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MapPin aria-hidden="true" className="mt-0.5 shrink-0 text-primary" size={18} />
                <span>
                  {t("address")}
                  <span className="mt-1 block text-sm font-semibold text-primary">
                    {t("directions")}
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 transition hover:text-section-text"
                href={`tel:${BUSINESS.phoneLink}`}
              >
                <Phone aria-hidden="true" className="shrink-0 text-primary" size={18} />
                <span>{BUSINESS.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                className="flex items-center gap-3 transition hover:text-section-text"
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <MessageCircle aria-hidden="true" className="shrink-0 text-primary" size={18} />
                <span>WhatsApp</span>
              </a>
            </li>
            {BUSINESS.email && (
              <li>
                <a
                  className="flex items-center gap-3 break-all transition hover:text-section-text"
                  href={`mailto:${BUSINESS.email}`}
                >
                  <Mail aria-hidden="true" className="shrink-0 text-primary" size={18} />
                  <span>{BUSINESS.email}</span>
                </a>
              </li>
            )}
          </ul>
        </Reveal>

        <Reveal delay={0.24}>
          {SHOW_HOURS && (
            <>
              <h2 className={columnTitle}>{t("hoursTitle")}</h2>
              <p className="m-0 flex items-start gap-3 leading-7 text-section-text/80">
                <Clock aria-hidden="true" className="mt-1 shrink-0 text-primary" size={18} />
                <span>{t("hoursText")}</span>
              </p>
            </>
          )}

          {hasSocial && (
            <>
              <h2 className={`${columnTitle} ${SHOW_HOURS ? "mt-8" : ""}`}>
                {t("followTitle")}
              </h2>
              <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
                {BUSINESS.facebook && (
                  <li>
                    <a className={socialClass} href={BUSINESS.facebook} rel="noreferrer noopener" target="_blank">
                      Facebook
                    </a>
                  </li>
                )}
                {BUSINESS.instagram && (
                  <li>
                    <a className={socialClass} href={BUSINESS.instagram} rel="noreferrer noopener" target="_blank">
                      Instagram
                    </a>
                  </li>
                )}
              </ul>
            </>
          )}

          <p
            className={`m-0 rounded-2xl border border-white/15 bg-white/5 p-4 text-sm font-semibold leading-6 ${
              SHOW_HOURS || hasSocial ? "mt-8" : ""
            }`}
          >
            {t("payOnSite")}
          </p>
        </Reveal>
      </div>

      {/* Barre du bas */}
      <div className="border-t border-white/10">
        <div className="mx-auto flex w-[calc(100%-2rem)] max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 py-5 text-sm text-section-text/70">
          <p className="m-0">
            © {year} {tl("brand")}. {t("rights")}
          </p>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {legalLinks.length > 0 && (
              <nav aria-label={t("legalLabel")}>
                <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <Link className={linkClass} href={link.href}>
                        {t(link.key)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            )}
            <a
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/25 px-4 font-semibold text-section-text transition hover:border-primary hover:bg-primary hover:text-primary-foreground"
              href="#main-content"
            >
              <ArrowUp aria-hidden="true" size={16} />
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}