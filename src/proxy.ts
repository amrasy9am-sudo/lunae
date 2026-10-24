import { NextResponse, type NextRequest } from "next/server";

const locales = ["en", "ms"];

function preferred(req: NextRequest) {
  const cookie = req.cookies.get("lunae-lang")?.value;
  if (cookie && locales.includes(cookie)) return cookie;
  const al = req.headers.get("accept-language") ?? "";
  const langs = al
    .split(",")
    .map((p) => {
      const [tag, q] = p.trim().split(";q=");
      return { tag: tag.toLowerCase(), q: q ? parseFloat(q) : 1 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { tag } of langs) {
    if (tag.startsWith("ms") || tag.startsWith("id")) return "ms";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const has = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (has) return;
  const url = req.nextUrl.clone();
  url.pathname = `/${preferred(req)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|img|icon|apple-icon|favicon|manifest|robots|sitemap|sw\\.js|.*\\.(?:png|jpg|jpeg|webp|svg|ico|txt|xml|json|js|css|woff2?)$).*)"],
};
