"use client";

import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Moon, Search, ShoppingBag, Sun, User, X, SunMoon } from "lucide-react";
import { Logo } from "../logo";
import { L } from "../ui";
import { useLang, useT, useTheme } from "../providers";
import { useAccount, useCart, useUI, useWishlist } from "@/lib/store";
import { swapLocale, tx } from "@/lib/i18n";
import { categories, products } from "@/data/catalogue";

export const NAV = [
  { href: "/shop", label: tx("Shop", "Kedai"), mega: true },
  { href: "/shop/face", label: tx("Face", "Muka") },
  { href: "/shop/lips-cheeks", label: tx("Lips & Cheeks", "Bibir & Pipi") },
  { href: "/shop/eyes", label: tx("Eyes", "Mata") },
  { href: "/shop/skincare", label: tx("Skincare", "Penjagaan Kulit") },
  { href: "/shade-finder", label: tx("Shade Finder", "Pencari Rona") },
  { href: "/journal", label: tx("Journal", "Jurnal") },
  { href: "/circle", label: tx("Lunae Circle", "Lunae Circle") },
];

export function ThemeSwitch({ compact = false }: { compact?: boolean }) {
  const { theme, pref, setPref } = useTheme();
  const t = useT();
  const next = pref === "auto" ? (theme === "day" ? "midnight" : "day") : pref === "day" ? "midnight" : "auto";
  const label =
    pref === "auto"
      ? t(tx(theme === "day" ? "Day mode · auto" : "Moonlight · auto", theme === "day" ? "Mod siang · auto" : "Moonlight · auto"))
      : t(tx(theme === "day" ? "Day mode" : "Moonlight mode", theme === "day" ? "Mod siang" : "Mod Moonlight"));
  return (
    <button
      type="button"
      onClick={() => setPref(next)}
      className="text-ink-2 hover:bg-surface-2 inline-flex h-10 items-center gap-2 rounded-full px-2.5 text-[13px] transition"
      aria-label={`${label}. ${t(tx("Switch theme", "Tukar tema"))}`}
      title={t(tx("Day → Moonlight → Auto (follows sunset)", "Siang → Moonlight → Auto (ikut matahari terbenam)"))}
    >
      {pref === "auto" ? (
        <SunMoon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      ) : theme === "day" ? (
        <Sun className="h-[18px] w-[18px]" strokeWidth={1.5} />
      ) : (
        <Moon className="h-[18px] w-[18px]" strokeWidth={1.5} />
      )}
      {!compact && (
        <span className="hidden xl:inline" suppressHydrationWarning>
          {label}
        </span>
      )}
    </button>
  );
}

export function LangSwitch() {
  const lang = useLang();
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="border-line flex h-8 items-center rounded-full border p-0.5 text-[11px] font-semibold tracking-wider" role="group" aria-label="Language / Bahasa">
      {(["ms", "en"] as const).map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => router.push(swapLocale(pathname, l))}
          className={`h-7 rounded-full px-2.5 uppercase transition ${lang === l ? "bg-primary text-primary-ink" : "text-ink-2 hover:text-ink"}`}
        >
          {l === "ms" ? "BM" : "EN"}
        </button>
      ))}
    </div>
  );
}

function MegaMenu({ onClose }: { onClose: () => void }) {
  const t = useT();
  return (
    <div className="border-line bg-surface absolute inset-x-0 top-full hidden border-b shadow-[var(--shadow-e2)] lg:block" onMouseLeave={onClose}>
      <div className="container-lux grid grid-cols-[1fr_1fr_1fr_1fr_1.3fr] gap-8 py-10">
        {categories.map((c) => (
          <div key={c.key}>
            <L href={`/shop/${c.key}`} onClick={onClose} className="eyebrow text-accent-deep hover:underline">
              {t(c.name)}
            </L>
            <ul className="mt-4 space-y-2.5">
              {products
                .filter((p) => p.category === c.key)
                .map((p) => (
                  <li key={p.slug}>
                    <L href={`/products/${p.slug}`} onClick={onClose} className="text-ink-2 hover:text-ink text-[15px]">
                      <span className="text-ink font-serif font-semibold">{p.shortName}</span> <span className="text-ink-3">{t(p.type)}</span>
                    </L>
                  </li>
                ))}
            </ul>
          </div>
        ))}
        <div className="grid grid-cols-2 gap-3">
          {[
            { href: "/sets", img: "/img/collections/semua-16-produk.webp", label: tx("Sets & gifts", "Set & hadiah") },
            { href: "/shade-finder", img: "/img/products/eclipse-cushion.webp", label: tx("Find my shade", "Cari rona saya") },
            { href: "/routine", img: "/img/collections/koleksi-skincare.webp", label: tx("Routine Builder", "Pembina Rutin") },
            { href: "/try-on", img: "/img/products/selene-matte-lipstick.webp", label: tx("Virtual try-on", "Cuba maya") },
          ].map((x) => (
            <L key={x.href} href={x.href} onClick={onClose} className="group relative block aspect-[4/3] overflow-hidden rounded-[14px]">
              <Image src={x.img} alt="" fill sizes="200px" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent p-3 text-[13px] font-medium text-white">{t(x.label)}</span>
            </L>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const t = useT();
  const pathname = usePathname();
  const ui = useUI();
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const wishCount = useWishlist((s) => s.items.length);
  const user = useAccount((s) => s.user);
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 80);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    setMega(false);
    ui.set({ menuOpen: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  const isActive = (href: string) => {
    const p = pathname.replace(/^\/(en|ms)/, "") || "/";
    return href === "/shop" ? p === "/shop" : p.startsWith(href);
  };

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-[background,box-shadow,border-color] duration-300 ${scrolled ? "border-line bg-bg/90 shadow-[var(--shadow-e1)] backdrop-blur-md" : "border-line/60 bg-bg"}`}
    >
      <div className="container-lux relative flex h-[68px] items-center gap-4 lg:h-[76px]">
        <button type="button" className="-ml-2 grid h-10 w-10 place-items-center rounded-full lg:hidden" aria-label={t(tx("Open menu", "Buka menu"))} onClick={() => ui.set({ menuOpen: true })}>
          <Menu className="h-6 w-6" strokeWidth={1.5} />
        </button>
        <L href="/" className="shrink-0" aria-label="LUNAE — home">
          <Logo />
        </L>
        <nav aria-label={t(tx("Main", "Utama"))} className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-5 xl:gap-7">
            {NAV.map((n) => (
              <li key={n.href} onMouseEnter={() => setMega(!!n.mega)}>
                <L
                  href={n.href}
                  aria-current={isActive(n.href) ? "page" : undefined}
                  className={`text-ink hover:text-accent-deep relative py-2 text-[14.5px] transition ${isActive(n.href) ? "after:bg-ink after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px" : ""}`}
                >
                  {t(n.label)}
                </L>
              </li>
            ))}
          </ul>
        </nav>
        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <div className="hidden sm:block">
            <ThemeSwitch />
          </div>
          <div className="mx-1 hidden md:block">
            <LangSwitch />
          </div>
          <button type="button" className="hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full" aria-label={t(tx("Search", "Cari"))} onClick={() => ui.set({ searchOpen: true })}>
            <Search className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <L href={user ? "/account" : "/account/login"} className="hover:bg-surface-2 hidden h-10 w-10 place-items-center rounded-full sm:grid" aria-label={t(tx("Account", "Akaun"))}>
            <User className="h-5 w-5" strokeWidth={1.5} />
          </L>
          <L href="/account/wishlist" className="hover:bg-surface-2 relative hidden h-10 w-10 place-items-center rounded-full sm:grid" aria-label={t(tx("Wishlist", "Senarai hajat"))}>
            <Heart className="h-5 w-5" strokeWidth={1.5} />
            {wishCount > 0 && <span className="bg-accent absolute top-1.5 right-1.5 h-2 w-2 rounded-full" />}
          </L>
          <button
            type="button"
            className="hover:bg-surface-2 relative flex h-10 items-center gap-1 rounded-full px-2"
            aria-label={`${t(tx("Bag", "Troli"))} (${count})`}
            onClick={() => ui.set({ cartOpen: true })}
          >
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
            <span className="min-w-3 text-[13px] font-semibold" suppressHydrationWarning>
              {count}
            </span>
          </button>
        </div>
      </div>
      {mega && <MegaMenu onClose={() => setMega(false)} />}
      <MobileMenu />
    </header>
  );
}

function MobileMenu() {
  const t = useT();
  const ui = useUI();
  if (!ui.menuOpen) return null;
  return (
    <div className="fixed inset-0 z-[70] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
      <button className="absolute inset-0 bg-black/40" aria-label={t(tx("Close menu", "Tutup menu"))} onClick={() => ui.set({ menuOpen: false })} />
      <div className="animate-fade-up bg-bg absolute inset-y-0 left-0 flex w-[88%] max-w-sm flex-col overflow-y-auto p-5">
        <div className="flex items-center justify-between">
          <Logo />
          <button className="hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full" aria-label={t(tx("Close", "Tutup"))} onClick={() => ui.set({ menuOpen: false })}>
            <X className="h-6 w-6" strokeWidth={1.5} />
          </button>
        </div>
        <nav className="mt-8" aria-label={t(tx("Main", "Utama"))}>
          <ul className="space-y-1">
            {NAV.map((n) => (
              <li key={n.href}>
                <L href={n.href} className="border-line font-display block border-b py-3.5 text-[26px] leading-tight" onClick={() => ui.set({ menuOpen: false })}>
                  {t(n.label)}
                </L>
              </li>
            ))}
            {[
              { href: "/try-on", l: tx("Virtual try-on", "Cuba maya") },
              { href: "/routine", l: tx("Routine Builder", "Pembina Rutin") },
              { href: "/glow-forecast", l: tx("Weather Glow", "Weather Glow") },
              { href: "/sets", l: tx("Sets & gifts", "Set & hadiah") },
              { href: "/track", l: tx("Track order", "Jejak pesanan") },
              { href: "/account", l: tx("My account", "Akaun saya") },
            ].map((n) => (
              <li key={n.href}>
                <L href={n.href} className="text-ink-2 block py-2.5 text-[15px]" onClick={() => ui.set({ menuOpen: false })}>
                  {t(n.l)}
                </L>
              </li>
            ))}
          </ul>
        </nav>
        <div className="mt-auto flex items-center justify-between gap-3 pt-8">
          <ThemeSwitch />
          <LangSwitch />
        </div>
      </div>
    </div>
  );
}
