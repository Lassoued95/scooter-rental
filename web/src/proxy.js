import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

export default function proxy(request) {
  if (request.nextUrl.pathname === "/") {
    const preferredLocale = request.cookies.get("NEXT_LOCALE")?.value;
    const locale = routing.locales.includes(preferredLocale)
      ? preferredLocale
      : routing.defaultLocale;
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = `/${locale}`;
    return NextResponse.redirect(localizedUrl);
  }

  const localePrefix = request.nextUrl.pathname.split("/")[1];
  if (!routing.locales.includes(localePrefix)) return NextResponse.next();

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/", "/:locale([a-z]{2})/:path*"],
};
