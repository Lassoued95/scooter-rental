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
      className="inline-flex size-[2.6rem] min-h-[2.6rem] cursor-pointer items-center justify-center rounded-full border border-border bg-surface text-foreground hover:bg-surface-elevated max-sm:size-[2.4rem] max-sm:min-h-[2.4rem]"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      type="button"
    >
      <Moon aria-hidden="true" className="block dark:hidden" size={17} />
      <Sun aria-hidden="true" className="hidden dark:block" size={17} />
    </button>
  );
}