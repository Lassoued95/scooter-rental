import { getTranslations, setRequestLocale } from "next-intl/server";

const swatches = [
  ["background", "--background", "#FFF8EC", "#0A1228"],
  ["surface", "--surface", "#FFFFFF", "#111D3A"],
  ["surfaceElevated", "--surface-elevated", "#F2EBDF", "#1B2C50"],
  ["text", "--text", "#16254A", "#FFF4E4"],
  ["muted", "--text-muted", "#58677F", "#BDC9DC"],
  ["border", "--border", "#858D99", "#7182A0"],
  ["primary", "--primary", "#FF7A1A", "#FF7A1A"],
  ["primaryHover", "--primary-hover", "#FF9140", "#FF9140"],
  ["secondary", "--secondary", "#16254A", "#58B8F0"],
  ["accent", "--accent", "#58B8F0", "#58B8F0"],
  ["whatsapp", "--whatsapp", "#1FAF5A", "#25D366"],
  ["focusRing", "--focus-ring", "#16254A", "#58B8F0"],
  ["success", "--success", "#1C633E", "#85E0A8"],
  ["error", "--error", "#A5242A", "#FFB4AB"],
];

function Swatches({ dark, t }) {
  return (
    <div className="styleguide-swatches">
      {swatches.map(([key, token, lightValue, darkValue]) => (
        <div className="styleguide-swatch" key={token}>
          <span>{t(key)}</span>
          <span
            aria-hidden="true"
            className="styleguide-swatch-chip"
            style={{ backgroundColor: `var(${token})` }}
          />
          <code>{dark ? darkValue : lightValue}</code>
        </div>
      ))}
    </div>
  );
}

function ButtonDemo({ label, className, hoverLabel }) {
  return (
    <div className="styleguide-button-demo">
      <button className={`token-button ${className}`} type="button">
        {label}
      </button>
      <button className={`token-button ${className} is-hover`} type="button">
        {label} · {hoverLabel}
      </button>
    </div>
  );
}

function ThemeSamples({ title, themeClass, t }) {
  return (
    <section aria-labelledby={`styleguide-${themeClass}`} className={`styleguide-theme ${themeClass}`}>
      <h2 id={`styleguide-${themeClass}`}>{title}</h2>
      <section className="styleguide-section" aria-label={t("palette")}>
        <h3>{t("palette")}</h3>
        <Swatches dark={themeClass === "theme-dark"} t={t} />
      </section>
      <section className="styleguide-section" aria-label={t("typography")}>
        <h3>{t("typography")}</h3>
        <p className="type-sample type-sample-h1">{t("headingOne")}</p>
        <p className="type-sample type-sample-h2">{t("headingTwo")}</p>
        <p className="type-sample type-sample-h3">{t("headingThree")}</p>
        <p className="type-sample type-sample-body">{t("bodySample")}</p>
        <p className="type-sample type-sample-small">{t("smallSample")}</p>
      </section>
      <section className="styleguide-section" aria-label={t("buttons")}>
        <h3>{t("buttons")}</h3>
        <div className="styleguide-button-row">
          <ButtonDemo className="token-button-primary" hoverLabel={t("hover")} label={t("primaryButton")} />
          <ButtonDemo className="token-button-secondary" hoverLabel={t("hover")} label={t("secondaryButton")} />
          <ButtonDemo className="token-button-ghost" hoverLabel={t("hover")} label={t("ghostButton")} />
          <ButtonDemo className="token-button-whatsapp" hoverLabel={t("hover")} label={t("whatsappButton")} />
        </div>
      </section>
      <section className="styleguide-section" aria-label={t("cards")}>
        <h3>{t("cards")}</h3>
        <div className="styleguide-card-row">
          <article className="styleguide-card">
            <h4>{t("cardTitle")}</h4>
            <p>{t("cardBody")}</p>
          </article>
          <article className="styleguide-card styleguide-card-elevated">
            <h4>{t("elevatedCardTitle")}</h4>
            <p>{t("cardBody")}</p>
          </article>
        </div>
      </section>
      <section className="styleguide-section" aria-label={t("badges")}>
        <h3>{t("badges")}</h3>
        <div className="styleguide-badges">
          <span className="styleguide-badge">{t("accentBadge")}</span>
          <span className="styleguide-badge styleguide-badge-success">{t("successBadge")}</span>
          <span className="styleguide-badge styleguide-badge-error">{t("errorBadge")}</span>
        </div>
      </section>
      <section className="styleguide-section" aria-label={t("inputs")}>
        <h3>{t("inputs")}</h3>
        <div className="styleguide-form">
          <label htmlFor={`styleguide-email-${themeClass}`}>{t("emailLabel")}</label>
          <input
            id={`styleguide-email-${themeClass}`}
            placeholder={t("emailPlaceholder")}
            type="email"
          />
        </div>
      </section>
    </section>
  );
}

export default async function StyleguidePage({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("styleguide");

  return (
    <div className="page-shell styleguide">
      <p className="eyebrow">{t("eyebrow")}</p>
      <h1>{t("title")}</h1>
      <p className="styleguide-intro">{t("intro")}</p>
      <ThemeSamples themeClass="theme-light" title={t("lightMode")} t={t} />
      <ThemeSamples themeClass="theme-dark" title={t("darkMode")} t={t} />
    </div>
  );
}
