"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { useHref, useT } from "../providers";
import { L } from "../ui";
import { useUI } from "@/lib/store";
import { searchProducts, POPULAR } from "@/lib/search";
import { tintBg } from "@/data/catalogue";
import { rm } from "@/lib/format";
import { tx } from "@/lib/i18n";

export function SearchOverlay() {
  const t = useT();
  const ui = useUI();
  const href = useHref();
  const router = useRouter();
  const [q, setQ] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchProducts(q).slice(0, 6), [q]);

  useEffect(() => {
    if (!ui.searchOpen) return;
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui.set({ searchOpen: false });
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.searchOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.set({ searchOpen: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [ui]);

  if (!ui.searchOpen) return null;
  const close = () => ui.set({ searchOpen: false });

  return (
    <div className="fixed inset-0 z-[78]" role="dialog" aria-modal="true" aria-label={t(tx("Search", "Cari"))}>
      <button className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label={t(tx("Close search", "Tutup carian"))} onClick={close} />
      <div className="animate-fade-up bg-bg relative mx-auto mt-0 max-h-dvh w-full overflow-y-auto pb-8 shadow-[var(--shadow-e3)] md:mt-16 md:max-w-3xl md:rounded-[24px]">
        <form
          className="border-line bg-bg sticky top-0 flex items-center gap-3 border-b px-5 py-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!q.trim()) return;
            close();
            router.push(href(`/search?q=${encodeURIComponent(q.trim())}`));
          }}
          role="search"
        >
          <Search className="text-ink-3 h-5 w-5" strokeWidth={1.5} />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(tx("Try “lipstick that won't transfer to tudung”", "Cuba “gincu tak melekat pada tudung”"))}
            className="placeholder:text-ink-3 h-11 flex-1 bg-transparent text-[17px] outline-none"
            aria-label={t(tx("Search products", "Cari produk"))}
          />
          <button type="button" onClick={close} className="hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full" aria-label={t(tx("Close", "Tutup"))}>
            <X className="h-5 w-5" />
          </button>
        </form>
        <div className="px-5 pt-5">
          {!q && (
            <>
              <p className="eyebrow text-ink-3">{t(tx("Popular", "Popular"))}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {POPULAR.map((s) => (
                  <button key={s} className="chip" onClick={() => setQ(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </>
          )}
          {q && results.length === 0 && (
            <p className="text-ink-2 py-6">{t(tx("No exact matches. Try “cushion”, “SPF” or ask the Lunae Advisor.", "Tiada padanan tepat. Cuba “kusyen”, “SPF” atau tanya Lunae Advisor."))}</p>
          )}
          {results.length > 0 && (
            <ul className="grid gap-2 sm:grid-cols-2">
              {results.map((p) => (
                <li key={p.slug}>
                  <L href={`/products/${p.slug}`} onClick={close} className="hover:bg-surface flex items-center gap-3 rounded-[14px] p-2">
                    <span className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                      <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="56px" className="object-contain p-1.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="product-name block truncate text-[16px]">{p.name}</span>
                      <span className="text-ink-3 block truncate text-[13px]">
                        {t(p.tagline)} · {rm(p.price)}
                      </span>
                    </span>
                  </L>
                </li>
              ))}
            </ul>
          )}
          {q && (
            <button
              className="text-accent-deep mt-4 inline-flex items-center gap-2 text-[14px] font-medium hover:underline"
              onClick={() => {
                close();
                router.push(href(`/search?q=${encodeURIComponent(q.trim())}`));
              }}
            >
              {t(tx("See all results", "Lihat semua hasil"))} <ArrowRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
