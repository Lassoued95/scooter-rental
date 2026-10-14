"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  Bike,
  ChevronDown,
  Menu,
  MessageCircle,
  Route,
  X,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";

const RENTAL_ITEMS = [
  { href: "/scooters", titleKey: "navRentalLink", textKey: "navRentalText", Icon: Bike },
  { href: "/excursions", titleKey: "navExcursions", textKey: "navExcursionsText", Icon: Route },
];

const LINKS = [
  { href: "/about", key: "navAbout" },
  { href: "/faq", key: "navFaq" },
];

const isActive = (pathname, href) =>
  pathname === href || pathname.startsWith(`${href}/`);

const linkClass =
  "border-b-2 border-transparent py-1 text-sm font-semibold text-foreground transition-colors hover:text-primary focus-visible:text-primary";

export function SiteNavigation() {
  const pathname = usePathname();

  // key={pathname} : le menu se referme tout seul à chaque changement de page
  return <SiteNavigationMenu key={pathname} pathname={pathname} />;
}

function RentalMenu({ pathname }) {
  const t = useTranslations("layout");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);
  const closeTimer = useRef(null);

  const active = RENTAL_ITEMS.some((item) => isActive(pathname, item.href));

  function openNow() {
    clearTimeout(closeTimer.current);
    setOpen(true);
  }

  // petit délai pour que le menu ne se ferme pas si la souris dévie un instant
  function closeSoon() {
    clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }
    function onKeyDown(event) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      className="relative"
      onBlur={(event) => {
        if (!containerRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
      onPointerEnter={(event) => event.pointerType === "mouse" && openNow()}
      onPointerLeave={(event) => event.pointerType === "mouse" && closeSoon()}
      ref={containerRef}
    >
      <button
        aria-controls="rental-menu"
        aria-expanded={open}
        className={`${linkClass} inline-flex items-center gap-1 ${
          active ? "border-primary text-primary" : ""
        }`}
        onClick={(event) => {
          // souris : on garde ouvert ; tactile et clavier : on bascule
          const fromMouse = event.nativeEvent.pointerType === "mouse";
          setOpen(fromMouse ? true : !open);
        }}
        ref={buttonRef}
        type="button"
      >
        {t("navScooters")}
        <ChevronDown
          aria-hidden="true"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          size={16}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 top-full z-30 w-72 pt-3"
            exit={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            id="rental-menu"
            initial={{ opacity: 0, y: reduceMotion ? 0 : -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <ul className="m-0 grid list-none gap-1 rounded-2xl border border-border bg-surface p-2 shadow-xl">
              {RENTAL_ITEMS.map(({ href, titleKey, textKey, Icon }) => {
                const current = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      aria-current={current ? "page" : undefined}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 transition hover:bg-surface-elevated focus-visible:bg-surface-elevated ${
                        current ? "bg-surface-elevated" : ""
                      }`}
                      href={href}
                    >
                      <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                        <Icon aria-hidden="true" size={20} />
                      </span>
                      <span className="grid">
                        <span className="text-sm font-bold text-foreground">
                          {t(titleKey)}
                        </span>
                        <span className="text-xs text-muted">{t(textKey)}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SiteNavigationMenu({ pathname }) {
  const t = useTranslations("layout");
  const [open, setOpen] = useState(false);

  return (
    <>
      <nav
        aria-label={t("mainNavigation")}
        className="hidden items-center gap-6 md:flex"
      >
        <RentalMenu pathname={pathname} />
        {LINKS.map(({ href, key }) => {
          const current = isActive(pathname, href);
          return (
            <Link
              aria-current={current ? "page" : undefined}
              className={`${linkClass} ${current ? "border-primary text-primary" : ""}`}
              href={href}
              key={key}
            >
              {t(key)}
            </Link>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 md:hidden">
        <button
          aria-expanded={open}
          aria-label={open ? t("closeMenu") : t("openMenu")}
          className="inline-flex size-[2.4rem] items-center justify-center rounded-full border border-border bg-surface text-foreground hover:bg-surface-elevated"
          onClick={() => setOpen((wasOpen) => !wasOpen)}
          type="button"
        >
          {open ? (
            <X aria-hidden="true" size={18} />
          ) : (
            <Menu aria-hidden="true" size={18} />
          )}
        </button>
      </div>

      {open && (
        <nav
          aria-label={t("mainNavigation")}
          className="absolute inset-x-0 top-full z-20 grid gap-1 border-b border-border bg-background px-5 pb-5 pt-3 shadow-lg md:hidden"
        >
          <p className="m-0 px-3 pt-2 text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {t("navScooters")}
          </p>
          {RENTAL_ITEMS.map(({ href, titleKey, Icon }) => (
            <Link
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="flex min-h-11 items-center gap-3 rounded-lg px-3 font-semibold text-foreground hover:bg-surface-elevated focus-visible:bg-surface-elevated"
              href={href}
              key={href}
              onClick={() => setOpen(false)}
            >
              <Icon aria-hidden="true" className="text-primary" size={18} />
              {t(titleKey)}
            </Link>
          ))}

          <hr className="my-2 border-border" />

          {LINKS.map(({ href, key }) => (
            <Link
              aria-current={isActive(pathname, href) ? "page" : undefined}
              className="flex min-h-11 items-center rounded-lg px-3 font-semibold text-foreground hover:bg-surface-elevated focus-visible:bg-surface-elevated"
              href={href}
              key={key}
              onClick={() => setOpen(false)}
            >
              {t(key)}
            </Link>
          ))}

          <a
            className={`${buttonVariants({ variant: "primary" })} mt-2 w-full`}
            href="https://wa.me/21628340240"
            onClick={() => setOpen(false)}
            rel="noreferrer"
            target="_blank"
          >
            <MessageCircle aria-hidden="true" size={16} />
            <span>{t("book")}</span>
          </a>
        </nav>
      )}
    </>
  );
}