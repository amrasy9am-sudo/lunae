import type { Locale } from "./types";

export const rm = (v: number, opts: { cents?: boolean } = {}) => {
  const cents = opts.cents ?? !Number.isInteger(Math.round(v * 100) / 100);
  return `RM${v.toLocaleString("en-MY", { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 })}`;
};

export const rm2 = (v: number) => rm(v, { cents: true });

export const dateFmt = (d: Date | string | number, lang: Locale, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }) =>
  new Date(d).toLocaleDateString(lang === "ms" ? "ms-MY" : "en-MY", { timeZone: "Asia/Kuala_Lumpur", ...opts });

export const timeFmt = (d: Date | string | number, lang: Locale) =>
  new Date(d).toLocaleTimeString(lang === "ms" ? "ms-MY" : "en-MY", { timeZone: "Asia/Kuala_Lumpur", hour: "numeric", minute: "2-digit" });

export const pad = (n: number) => String(Math.max(0, Math.floor(n))).padStart(2, "0");
