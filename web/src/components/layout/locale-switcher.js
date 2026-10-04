"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, ChevronDown, Globe2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { localeConfig } from "@/i18n/routing";

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <LocaleSwitcherMenu
      key={`${locale}:${pathname}`}
      locale={locale}
      pathname={pathname}
    />
  );
}

function LocaleSwitcherMenu({ locale, pathname }) {
  const router = useRouter();
  const t = useTranslations("layout");
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, localeConfig.findIndex((item) => item.code === locale)),
  );
  const [, startTransition] = useTransition();
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const optionRefs = useRef([]);
  const currentLocale =
    localeConfig.find((item) => item.code === locale) ?? localeConfig[0];

  useEffect(() => {
    function closeOnOutsideClick(event) {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, []);

  function focusOption(index) {
    const wrappedIndex = (index + localeConfig.length) % localeConfig.length;
    setActiveIndex(wrappedIndex);
    optionRefs.current[wrappedIndex]?.focus();
  }

  function openList(index = localeConfig.findIndex((item) => item.code === locale)) {
    const selectedIndex = Math.max(0, index);
    setActiveIndex(selectedIndex);
    setOpen(true);
    requestAnimationFrame(() => optionRefs.current[selectedIndex]?.focus());
  }

  function selectLocale(nextLocale) {
    setOpen(false);
    triggerRef.current?.focus();
    startTransition(() => router.replace(pathname, { locale: nextLocale }));
  }

  function handleTriggerKeyDown(event) {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      openList();
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  function handleOptionKeyDown(event, index) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      focusOption(index + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      focusOption(index - 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      focusOption(0);
    } else if (event.key === "End") {
      event.preventDefault();
      focusOption(localeConfig.length - 1);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      triggerRef.current?.focus();
    }
  }

  return (
    <div className="locale-switcher" ref={containerRef}>
      <button
        aria-controls="language-listbox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${t("language")}: ${currentLocale.nativeName}`}
        className="locale-trigger"
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={handleTriggerKeyDown}
        ref={triggerRef}
        type="button"
      >
        <Globe2 aria-hidden="true" size={17} />
        <span>{currentLocale.code.toUpperCase()}</span>
        <ChevronDown aria-hidden="true" className="locale-chevron" size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="locale-dropdown"
            exit={{ opacity: 0, scale: 0.97, y: -4 }}
            initial={reduceMotion ? false : { opacity: 0, scale: 0.97, y: -4 }}
            id="language-listbox"
            role="listbox"
            transition={{ duration: reduceMotion ? 0 : 0.17, ease: "easeOut" }}
          >
            {localeConfig.map((item, index) => (
              <button
                aria-selected={item.code === locale}
                className={`locale-option${item.code === locale ? " is-current" : ""}`}
                id={`locale-option-${item.code}`}
                key={item.code}
                onClick={() => selectLocale(item.code)}
                onFocus={() => setActiveIndex(index)}
                onKeyDown={(event) => handleOptionKeyDown(event, index)}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                tabIndex={activeIndex === index ? 0 : -1}
                type="button"
              >
                <span aria-hidden="true" className={`fi fi-${item.flag} locale-flag`} />
                <span className="locale-native-name">{item.nativeName}</span>
                {item.code === locale && (
                  <Check aria-hidden="true" className="locale-check" size={17} />
                )}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
