import Image from "next/image";
import {
  ArrowUp,
  ArrowUpRight,
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
  facebook: "https://www.facebook.com/profile.php?id=61584873759219",
  instagram: "", // URL complète du compte Instagram
  mapsUrl:
    "https://www.google.com/maps/place/Location+Scooter+Djerba/@33.8516212,10.9854728,17z/",
  getyourguide:
    "https://www.getyourguide.com/souk-de-houmt-l142890/best-of-djerba-en-scooter-on-roule-on-explore-on-kiffe-t1504628/?ranking_uuid=47ffe0ed-0031-429a-bb4b-2b9613a43d56",
};

const GETYOURGUIDE_LABEL =
  "Best of Djerba en Scooter : On roule, On Explore, On kiffe ! Brik Offerte - 2026";

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
  "m-0 mb-6 text-[11px] font-bold uppercase tracking-[0.22em] text-section-text/50";
const linkClass =
  "group/link inline-flex items-center gap-1.5 rounded-sm text-[15px] text-section-text/80 transition-colors duration-200 hover:text-primary focus-visible:text-primary";
const socialBtn =
  "inline-flex size-11 items-center justify-center rounded-full border border-white/15 text-section-text/80 transition duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:border-primary";
const contactRow =
  "group/contact flex items-start gap-3.5 text-[15px] leading-6 text-section-text/80 transition-colors duration-200 hover:text-section-text";
const contactIcon =
  "mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-primary transition duration-200 group-hover/contact:border-primary group-hover/contact:bg-primary group-hover/contact:text-primary-foreground";

// Brand icons drawn inline (stroke style, same look as the lucide icons)
function FacebookIcon(props) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
      {...props}
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height="18"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
      width="18"
      {...props}
    >
      <rect height="20" rx="5" ry="5" width="20" x="2" y="2" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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
  const hasGyg = Boolean(BUSINESS.getyourguide);

  return (
    <footer className="relative mt-auto w-full bg-brand-section text-section-text">
      {/* Filet d'accent */}
      <div
        aria-hidden="true"
        className="h-px w-full bg-gradient-to-r from-transparent via-primary/70 to-transparent"
      />

      {/* ---------- Avantages ---------- */}
      <div className="border-b border-white/10">
        <ul className="m-0 mx-auto grid w-[calc(100%-2rem)] max-w-6xl list-none grid-cols-1 p-0 sm:grid-cols-2 lg:grid-cols-5 lg:divide-x lg:divide-white/10">
          {PERKS.map(({ key, Icon }) => (
            <li
              className="flex items-center gap-3.5 py-6 text-sm font-semibold lg:justify-center lg:px-4"
              key={key}
            >
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-primary/10 text-primary">
                <Icon aria-hidden="true" size={18} />
              </span>
              <span className="leading-5">{t(`perks.${key}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ---------- Colonnes ---------- */}
      <div className="mx-auto grid w-[calc(100%-2rem)] max-w-6xl gap-x-12 gap-y-14 py-16 sm:grid-cols-2 lg:grid-cols-12">
        {/* Marque */}
        <Reveal className="sm:col-span-2 lg:col-span-4">
          <Link
            className="inline-flex items-center gap-4 font-display text-xl font-bold text-section-text"
            href="/"
          >
            <Image
              alt=""
              className="block size-14 shrink-0 rounded-xl object-cover ring-1 ring-white/15"
              height={64}
              src="/logos/location-scooter-djerba-logo.png"
              width={64}
            />
            <span>{tl("brand")}</span>
          </Link>
          <p className="mb-0 mt-5 max-w-sm leading-7 text-section-text/70">
            {t("tagline")}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <a
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-whatsapp px-6 text-sm font-bold text-primary-foreground shadow-md shadow-black/20 transition duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:-translate-y-0.5"
              href={whatsappUrl}
              rel="noreferrer"
              target="_blank"
            >
              <MessageCircle aria-hidden="true" size={18} />
              {t("whatsappCta")}
            </a>

            {BUSINESS.facebook && (
              <a
                aria-label="Facebook"
                className={socialBtn}
                href={BUSINESS.facebook}
                rel="noreferrer noopener"
                target="_blank"
              >
                <FacebookIcon />
              </a>
            )}
            {BUSINESS.instagram && (
              <a
                aria-label="Instagram"
                className={socialBtn}
                href={BUSINESS.instagram}
                rel="noreferrer noopener"
                target="_blank"
              >
                <InstagramIcon />
              </a>
            )}
          </div>
        </Reveal>

        {/* Explorer */}
        <Reveal className="lg:col-span-2" delay={0.08}>
          <nav aria-label={t("navLabel")}>
            <h2 className={columnTitle}>{t("exploreTitle")}</h2>
            <ul className="m-0 grid list-none gap-3.5 p-0">
              {exploreLinks.map((link) => (
                <li key={link.href}>
                  <Link className={linkClass} href={link.href}>
                    {link.label}
                    <ArrowUpRight
                      aria-hidden="true"
                      className="-translate-x-1 opacity-0 transition duration-200 group-hover/link:translate-x-0 group-hover/link:opacity-100"
                      size={14}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </Reveal>

        {/* Contact */}
        <Reveal className="lg:col-span-3" delay={0.16}>
          <h2 className={columnTitle}>{t("contactTitle")}</h2>
          <ul className="m-0 grid list-none gap-5 p-0">
            <li>
              <a
                className={contactRow}
                href={BUSINESS.mapsUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className={contactIcon}>
                  <MapPin aria-hidden="true" size={16} />
                </span>
                <span>
                  {t("address")}
                  <span className="mt-1 flex items-center gap-1 text-sm font-semibold text-primary">
                    {t("directions")}
                    <ArrowUpRight aria-hidden="true" size={14} />
                  </span>
                </span>
              </a>
            </li>
            <li>
              <a className={`${contactRow} items-center`} href={`tel:${BUSINESS.phoneLink}`}>
                <span className={`${contactIcon} mt-0`}>
                  <Phone aria-hidden="true" size={16} />
                </span>
                <span>{BUSINESS.phoneDisplay}</span>
              </a>
            </li>
            <li>
              <a
                className={`${contactRow} items-center`}
                href={whatsappUrl}
                rel="noreferrer"
                target="_blank"
              >
                <span className={`${contactIcon} mt-0`}>
                  <MessageCircle aria-hidden="true" size={16} />
                </span>
                <span>WhatsApp</span>
              </a>
            </li>
            {BUSINESS.email && (
              <li>
                <a
                  className={`${contactRow} items-center break-all`}
                  href={`mailto:${BUSINESS.email}`}
                >
                  <span className={`${contactIcon} mt-0`}>
                    <Mail aria-hidden="true" size={16} />
                  </span>
                  <span>{BUSINESS.email}</span>
                </a>
              </li>
            )}
            {SHOW_HOURS && (
              <li className={`${contactRow} cursor-default`}>
                <span className={contactIcon}>
                  <Clock aria-hidden="true" size={16} />
                </span>
                <span>
                  <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-section-text/50">
                    {t("hoursTitle")}
                  </span>
                  {t("hoursText")}
                </span>
              </li>
            )}
          </ul>
        </Reveal>

        {/* Réservation en ligne */}
        <Reveal className="sm:col-span-2 lg:col-span-3" delay={0.24}>
          <h2 className={columnTitle}>{hasGyg ? "Réservation en ligne" : t("followTitle")}</h2>

          {hasGyg && (
            <a
              aria-label={`GetYourGuide : ${GETYOURGUIDE_LABEL}`}
              className="group block rounded-2xl border border-white/12 bg-white/[0.04] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-primary/60 hover:bg-white/[0.07] hover:shadow-xl hover:shadow-black/30 focus-visible:border-primary"
              href={BUSINESS.getyourguide}
              rel="noreferrer noopener"
              target="_blank"
            >
              <span className="flex items-center gap-3.5">
                <span className="relative size-12 shrink-0 overflow-hidden rounded-xl ring-1 ring-white/15">
                  <Image
                    alt="GetYourGuide"
                    className="object-cover"
                    fill
                    sizes="48px"
                    src="/logos/getyourguide.webp"
                  />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-section-text">
                    GetYourGuide
                  </span>
                  <span className="mt-0.5 flex items-center gap-1 text-xs font-medium text-section-text/60">
                    <BadgeCheck aria-hidden="true" className="text-primary" size={13} />
                    Avis vérifiés
                  </span>
                </span>
              </span>

              <span className="mt-4 line-clamp-3 block text-sm leading-6 text-section-text/80">
                {GETYOURGUIDE_LABEL}
              </span>

              <span className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 text-sm font-semibold text-primary">
                Voir l&apos;offre
                <ArrowUpRight
                  aria-hidden="true"
                  className="transition duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  size={18}
                />
              </span>
            </a>
          )}

          <p
            className={`m-0 flex items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-5 py-4 text-sm font-semibold leading-6 ${
              hasGyg ? "mt-4" : ""
            }`}
          >
            <ShieldCheck aria-hidden="true" className="shrink-0 text-primary" size={20} />
            {t("payOnSite")}
          </p>

          {!hasGyg && hasSocial && (
            <ul className="m-0 mt-5 flex list-none flex-wrap gap-3 p-0">
              {BUSINESS.facebook && (
                <li>
                  <a aria-label="Facebook" className={socialBtn} href={BUSINESS.facebook} rel="noreferrer noopener" target="_blank">
                    <FacebookIcon />
                  </a>
                </li>
              )}
              {BUSINESS.instagram && (
                <li>
                  <a aria-label="Instagram" className={socialBtn} href={BUSINESS.instagram} rel="noreferrer noopener" target="_blank">
                    <InstagramIcon />
                  </a>
                </li>
              )}
            </ul>
          )}
        </Reveal>
      </div>

      {/* ---------- Barre du bas ---------- */}
      <div className="border-t border-white/10 bg-black/20">
        <div className="mx-auto flex w-[calc(100%-2rem)] max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-4 py-6 text-sm text-section-text/60">
          <div className="flex flex-col gap-1">
            <p className="m-0">
              © {year} {tl("brand")}. {t("rights")}
            </p>
            <p className="m-0 text-xs">
              Designed &amp; Developed by{" "}
              <a
                className="font-semibold text-section-text/90 transition-colors hover:text-primary hover:underline hover:underline-offset-4"
                href="https://www.instagram.com/lassoued_95/?hl=fr"
                rel="noopener noreferrer"
                target="_blank"
              >
                Mohamed Lassoued
              </a>
            </p>
          </div>

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
              className="group inline-flex min-h-10 items-center gap-2 rounded-full border border-white/20 px-4 font-semibold text-section-text/90 transition duration-200 hover:border-primary hover:bg-primary hover:text-primary-foreground"
              href="#main-content"
            >
              <ArrowUp
                aria-hidden="true"
                className="transition duration-200 group-hover:-translate-y-0.5"
                size={16}
              />
              {t("backToTop")}
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}