"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@wrksz/themes/client";
import { useTranslations } from "next-intl";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("layout");

  return (
    <button
      aria-label={t("toggleTheme")}
      className="icon-button"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      type="button"
    >
      <Moon aria-hidden="true" className="theme-icon-light" size={17} />
      <Sun aria-hidden="true" className="theme-icon-dark" size={17} />
    </button>
  );
}