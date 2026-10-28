import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const handleI18nRouting = createMiddleware(routing);

function getPreferredLocale(request) {
  const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
  return routing.locales.includes(cookieLocale)
    ? cookieLocale
    : routing.defaultLocale;
}

export default function proxy(request) {
  const { pathname } = request.nextUrl;
  const firstSegment = pathname.split("/")[1];

  // Valid language prefix: next-intl handles it
  if (routing.locales.includes(firstSegment)) {
    return handleI18nRouting(request);
  }

  // Looks like a language code but is not supported (/xx/...): normal 404
  if (/^[a-z]{2}$/.test(firstSegment)) return NextResponse.next();

  // No language prefix (/, /about, /faq, /scooters/...): redirect, keeping path and query
  const locale = getPreferredLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = pathname === "/" ? `/${locale}` : `/${locale}${pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // everything except the API, Next.js internals and static files (anything with a dot)
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};