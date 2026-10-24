import type { L10n, Locale } from "./types";

export const locales: Locale[] = ["en", "ms"];
export const defaultLocale: Locale = "en";
export const hasLocale = (l: string): l is Locale => (locales as string[]).includes(l);

/** Pick the right string for a locale. */
export const pick = (lang: Locale, v: L10n | string) => (typeof v === "string" ? v : (v[lang] ?? v.en));

/** Shorthand to declare bilingual copy inline. */
export const tx = (en: string, ms: string): L10n => ({ en, ms });

/** Prefix an internal path with the locale. */
export const lhref = (lang: Locale, path: string) => {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return p === "/" ? `/${lang}` : `/${lang}${p}`;
};

/** Swap the locale in a pathname (/en/shop → /ms/shop). */
export const swapLocale = (pathname: string, to: Locale) => {
  const parts = pathname.split("/");
  if (hasLocale(parts[1] ?? "")) parts[1] = to;
  else parts.splice(1, 0, to);
  return parts.join("/") || `/${to}`;
};
