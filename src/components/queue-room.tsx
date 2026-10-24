"use client";

import { useEffect, useState } from "react";
import { useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { MoonGlyph } from "./home/moon-widgets";

/** Fair virtual queue: random position assigned at 8 pm, advances in batches. Demo simulation. */
export function QueueRoom() {
  const t = useT();
  const [pos, setPos] = useState<number | null>(null);
  const [start, setStart] = useState(0);
  useEffect(() => {
    const p = 120 + Math.floor(Math.random() * 600);
    setPos(p);
    setStart(p);
    const id = setInterval(() => setPos((x) => (x === null ? x : Math.max(0, x - (8 + Math.floor(Math.random() * 30))))), 1500);
    return () => clearInterval(id);
  }, []);
  const pct = pos === null || !start ? 0 : 1 - pos / start;
  return (
    <section className="starfield bg-night text-moon grid min-h-[80vh] place-items-center px-4 py-20 text-center">
      <div className="max-w-lg">
        <div className="mx-auto w-fit">
          <MoonGlyph phase={0.05 + pct * 0.45} size={120} />
        </div>
        <p className="eyebrow text-glow mt-8">{t(tx("Full Moon Drop · waiting room", "Full Moon Drop · bilik menunggu"))}</p>
        <h1 className="display-l mt-4">{pos === 0 ? t(tx("You're in.", "Giliran anda.")) : t(tx("The moon is rising…", "Bulan sedang terbit…"))}</h1>
        <p className="text-halo mt-4 text-[16px]" aria-live="polite">
          {pos === null
            ? "…"
            : pos > 0
              ? `${t(tx("Your place in line:", "Kedudukan anda:"))} ${pos.toLocaleString()} · ${t(tx("keep this tab open", "biarkan tab ini terbuka"))}`
              : t(tx("Your stock is reserved for 10 minutes. 2× points tonight.", "Stok anda ditempah selama 10 minit. 2× mata malam ini."))}
        </p>
        <div className="bg-mist mx-auto mt-8 h-1.5 max-w-sm overflow-hidden rounded-full">
          <div className="bg-glow h-full rounded-full transition-[width] duration-700" style={{ width: `${pct * 100}%` }} />
        </div>
        <p className="text-halo/80 mt-6 text-[13px]">
          {t(
            tx(
              "Places are assigned at random at 8:00 pm — refreshing won't move you forward. Limits apply per customer and device.",
              "Kedudukan ditentukan secara rawak pada 8:00 malam — muat semula tidak akan memajukan anda. Had dikenakan bagi setiap pelanggan dan peranti.",
            ),
          )}
        </p>
        {pos === 0 && (
          <L href="/drops" className="btn bg-moon text-cocoa-ink mt-8">
            {t(tx("Shop the drop", "Beli sekarang"))}
          </L>
        )}
        <p className="text-halo/60 mt-10 text-[11px] tracking-[0.2em] uppercase">{t(tx("Preview simulation", "Simulasi pratonton"))}</p>
      </div>
    </section>
  );
}
