import { getTranslations, setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";

const swatches = [
  ["background", "--background"],
  ["surface", "--surface"],
  ["surfaceElevated", "--surface-elevated"],
  ["text", "--text"],
  ["muted", "--text-muted"],
  ["border", "--border"],
  ["primary", "--primary"],
  ["primaryHover", "--primary-hover"],
  ["secondary", "--secondary"],
  ["accent", "--accent"],
  ["whatsapp", "--whatsapp"],
  ["focusRing", "--focus-ring"],
  ["success", "--success"],
  ["error", "--error"],
];

const lightThemeVariables = Object.fromEntries(
  [
    "background",
    "surface",
    "surface-elevated",
    "text",
    "text-muted",
    "border",
    "primary",
    "primary-hover",
    "primary-foreground",
    "secondary",
    "secondary-hover",
    "secondary-foreground",
    "accent",
    "accent-foreground",
    "whatsapp",
    "focus-ring",
    "success",
    "success-background",
    "error",
    "error-background",
    "brand-section",
    "section-text",
  ].map((token) => [`--${token}`, `var(--palette-light-${token})`]),
);

function Swatches({ t }) {
  return (
    <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
      {swatches.map(([key, token]) => (
        <div
          className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-border p-3 text-[0.8rem] font-bold text-foreground"
          key={token}
        >
          <span>{t(key)}</span>
          <span
            aria-hidden="true"
            className="row-span-2 size-10 rounded-[0.55rem] border border-border"
            style={{ backgroundColor: `var(${token})` }}
          />
          <code className="text-xs font-medium text-muted">var({token})</code>
        </div>
      ))}
    </div>
  );
}

function ButtonDemo({ label, variant, hoverLabel }) {
  const hoverClass = {
    primary: "!border-primary-hover !bg-primary-hover",
    secondary: "!border-secondary-hover !bg-secondary-hover",
    ghost: "!border-foreground !bg-surface-elevated",
    whatsapp: "-translate-y-0.5",
  }[variant];

  return (
    <div className="grid justify-items-start gap-[0.65rem]">
      <Button className="w-full" variant={variant}>
        {label}
      </Button>
      <Button className={`w-full ${hoverClass}`} variant={variant}>
        {label} · {hoverLabel}
      </Button>
    </div>
  );
}

function ThemeSamples({ title, dark = false, t }) {
  return (
    <section
      aria-labelledby={`styleguide-${dark ? "dark" : "light"}`}
      className={`my-8 rounded-2xl border border-border p-[clamp(1rem,3vw,2rem)] ${
        dark ? "dark" : ""
      } bg-background text-foreground`}
      style={dark ? undefined : lightThemeVariables}
    >
      <h2
        className="mb-6 mt-0 font-display text-[1.75rem] text-secondary"
        id={`styleguide-${dark ? "dark" : "light"}`}
      >
        {title}
      </h2>
      <section aria-label={t("palette")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("palette")}
        </h3>
        <Swatches t={t} />
      </section>
      <section aria-label={t("typography")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("typography")}
        </h3>
        <p className="my-3 font-display text-[clamp(2.25rem,5vw,3.25rem)] leading-[1.1] text-foreground">
          {t("headingOne")}
        </p>
        <p className="my-3 font-display text-[2rem] leading-[1.2] text-foreground">
          {t("headingTwo")}
        </p>
        <p className="my-3 text-[1.375rem] font-bold text-foreground">
          {t("headingThree")}
        </p>
        <p className="my-3 max-w-3xl text-base leading-[1.65] text-muted">
          {t("bodySample")}
        </p>
        <p className="my-3 text-sm text-muted">{t("smallSample")}</p>
      </section>
      <section aria-label={t("buttons")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("buttons")}
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] items-start gap-3">
          <ButtonDemo
            hoverLabel={t("hover")}
            label={t("primaryButton")}
            variant="primary"
          />
          <ButtonDemo
            hoverLabel={t("hover")}
            label={t("secondaryButton")}
            variant="secondary"
          />
          <ButtonDemo
            hoverLabel={t("hover")}
            label={t("ghostButton")}
            variant="ghost"
          />
          <ButtonDemo
            hoverLabel={t("hover")}
            label={t("whatsappButton")}
            variant="whatsapp"
          />
        </div>
      </section>
      <section aria-label={t("cards")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("cards")}
        </h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,10rem),1fr))] gap-3">
          <article className="rounded-2xl border border-border bg-surface p-5 text-foreground">
            <h4 className="mb-2 mt-0 font-display text-xl text-secondary">
              {t("cardTitle")}
            </h4>
            <p className="m-0 leading-[1.6] text-muted">{t("cardBody")}</p>
          </article>
          <article className="rounded-2xl border border-border bg-surface-elevated p-5 text-foreground">
            <h4 className="mb-2 mt-0 font-display text-xl text-secondary">
              {t("elevatedCardTitle")}
            </h4>
            <p className="m-0 leading-[1.6] text-muted">{t("cardBody")}</p>
          </article>
        </div>
      </section>
      <section aria-label={t("badges")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("badges")}
        </h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex min-h-8 items-center justify-center rounded-full bg-accent px-3 py-1 text-[0.85rem] font-bold text-accent-foreground">
            {t("accentBadge")}
          </span>
          <span className="inline-flex min-h-8 items-center justify-center rounded-full bg-success-background px-3 py-1 text-[0.85rem] font-bold text-success">
            {t("successBadge")}
          </span>
          <span className="inline-flex min-h-8 items-center justify-center rounded-full bg-error-background px-3 py-1 text-[0.85rem] font-bold text-error">
            {t("errorBadge")}
          </span>
        </div>
      </section>
      <section aria-label={t("inputs")} className="mt-8">
        <h3 className="mb-4 mt-0 text-[1.15rem] font-bold text-foreground">
          {t("inputs")}
        </h3>
        <div className="grid max-w-md gap-2">
          <label
            className="text-[0.9rem] font-bold text-foreground"
            htmlFor={`styleguide-email-${dark ? "dark" : "light"}`}
          >
            {t("emailLabel")}
          </label>
          <input
            className="min-h-[2.9rem] rounded-[0.6rem] border-2 border-border bg-surface px-3 py-[0.6rem] text-foreground placeholder:text-muted focus-visible:border-focus"
            id={`styleguide-email-${dark ? "dark" : "light"}`}
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
    <div className="mx-auto w-[calc(100%-2rem)] max-w-6xl py-12 pb-20 max-sm:w-[calc(100%-1.25rem)]">
      <p className="mb-2 mt-0 text-sm font-bold text-primary">{t("eyebrow")}</p>
      <h1 className="m-0 font-display text-[clamp(2.5rem,7vw,4.5rem)] leading-[1.05] text-secondary">
        {t("title")}
      </h1>
      <p className="mb-10 mt-4 max-w-3xl leading-[1.7] text-muted">
        {t("intro")}
      </p>
      <ThemeSamples title={t("lightMode")} t={t} />
      <ThemeSamples dark title={t("darkMode")} t={t} />
    </div>
  );
}
