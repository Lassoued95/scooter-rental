import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@wrksz/themes/next";
import "flag-icons/css/flag-icons.min.css";
import { routing } from "@/i18n/routing";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { OG_LOCALES } from "@/lib/og-locales";
import "../globals.css";

const SITE_URL = "https://www.scooterdjerba.com";

const sans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

const display = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({ locale, namespace: "metadata" });

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    alternates: {
      languages: {
        ...Object.fromEntries(
          routing.locales.map((supportedLocale) => [
            supportedLocale,
            `/${supportedLocale}`,
          ]),
        ),
        "x-default": `/${routing.defaultLocale}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: "Location Scooter Djerba",
      title: t("title"),
      description: t("description"),
      locale: OG_LOCALES[locale] ?? locale,
    },
  };
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html data-scroll-behavior="smooth" lang={locale} suppressHydrationWarning>
      <body className={`${sans.variable} ${display.variable}`}>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SiteHeader />
            <main id="main-content">{children}</main>
            <SiteFooter />
            <WhatsAppButton />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}