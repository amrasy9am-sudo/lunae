"use client";

import { createContext, useContext, useEffect, useLayoutEffect, useState, useCallback } from "react";
import type { L10n, Locale } from "@/lib/types";
import { lhref, pick } from "@/lib/i18n";
import { rehydrateAll, useUI } from "@/lib/store";
import { isAfterSunset, KL } from "@/lib/astro";

/* ---------------- Language ---------------- */
const LangCtx = createContext<Locale>("en");
export const useLang = () => useContext(LangCtx);
export function useT() {
  const lang = useLang();
  return useCallback((v: L10n | string) => pick(lang, v), [lang]);
}
export function useHref() {
  const lang = useLang();
  return useCallback((p: string) => lhref(lang, p), [lang]);
}

/* ---------------- Theme (Sun-up ↔ Moonlight) ---------------- */
export type ThemePref = "auto" | "day" | "midnight";
type Theme = "day" | "midnight";
interface ThemeCtxT {
  theme: Theme;
  pref: ThemePref;
  setPref: (p: ThemePref) => void;
  city: string;
}
const ThemeCtx = createContext<ThemeCtxT>({ theme: "day", pref: "auto", setPref: () => {}, city: KL.city });
export const useTheme = () => useContext(ThemeCtx);

function readPref(): ThemePref {
  try {
    const v = localStorage.getItem("lunae-theme");
    if (v === "day" || v === "midnight" || v === "auto") return v;
  } catch {}
  return "auto";
}

function apply(t: Theme, animate: boolean) {
  const el = document.documentElement;
  if (el.getAttribute("data-theme") === t) return;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (animate && doc.startViewTransition && !reduce) doc.startViewTransition(() => el.setAttribute("data-theme", t));
  else el.setAttribute("data-theme", t);
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [pref, setPrefState] = useState<ThemePref>("auto");
  const [theme, setTheme] = useState<Theme>("day");
  const city = KL.city;

  // Re-apply the stored attribute after dev remounts, and sync React state with the DOM set by the inline script.
  useLayoutEffect(() => {
    const p = readPref();
    setPrefState(p);
    const t = p === "auto" ? (isAfterSunset(new Date()) ? "midnight" : "day") : p;
    apply(t, false);
    setTheme(t);
  }, []);

  // Auto mode: re-check against local sunset every minute.
  useEffect(() => {
    if (pref !== "auto") return;
    const tick = () => {
      const t: Theme = isAfterSunset(new Date()) ? "midnight" : "day";
      setTheme((prev) => {
        if (prev !== t) apply(t, true);
        return t;
      });
    };
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [pref]);

  const setPref = (p: ThemePref) => {
    try {
      localStorage.setItem("lunae-theme", p);
    } catch {}
    setPrefState(p);
    const t: Theme = p === "auto" ? (isAfterSunset(new Date()) ? "midnight" : "day") : p;
    apply(t, true);
    setTheme(t);
    document.documentElement.setAttribute("data-theme-pref", p);
  };

  return <ThemeCtx.Provider value={{ theme, pref, setPref, city }}>{children}</ThemeCtx.Provider>;
}

/* ---------------- Toast ---------------- */
function Toaster() {
  const toast = useUI((s) => s.toast);
  const set = useUI((s) => s.set);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => set({ toast: null }), 4000);
    return () => clearTimeout(id);
  }, [toast, set]);
  const color = { success: "bg-success", warning: "bg-warning", error: "bg-error", info: "bg-info" };
  return (
    <div aria-live="polite" role="status" className="pointer-events-none fixed inset-x-0 bottom-24 z-[80] flex justify-center px-4 md:bottom-8">
      {toast && (
        <div
          key={toast.id}
          className="animate-fade-up bg-primary text-primary-ink pointer-events-auto flex items-center gap-3 rounded-full py-3 pr-5 pl-4 text-sm font-medium shadow-[var(--shadow-e3)]"
        >
          <span className={`h-2 w-2 rounded-full ${color[toast.kind]}`} aria-hidden />
          {toast.text}
        </div>
      )}
    </div>
  );
}

export function Providers({ lang, children }: { lang: Locale; children: React.ReactNode }) {
  useEffect(() => {
    rehydrateAll();
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});
    try {
      document.cookie = `lunae-lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch {}
  }, [lang]);
  return (
    <LangCtx.Provider value={lang}>
      <ThemeProvider>
        {children}
        <Toaster />
      </ThemeProvider>
    </LangCtx.Provider>
  );
}
