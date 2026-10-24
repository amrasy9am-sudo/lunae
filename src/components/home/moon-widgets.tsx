"use client";

import { useEffect, useState } from "react";
import { Moon, Radio, Sparkles, Truck } from "lucide-react";
import { useLang, useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { countdown, moonInfo, nextDropAt, sunTimes } from "@/lib/astro";
import { dateFmt, pad, timeFmt } from "@/lib/format";
import { useUI } from "@/lib/store";

export function useNow(interval = 1000) {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(id);
  }, [interval]);
  return now;
}

export function MoonGlyph({ phase, size = 44 }: { phase: number; size?: number }) {
  // phase 0..1 → draw lit part
  const r = size / 2;
  const k = Math.cos(phase * 2 * Math.PI); // 1 new → -1 full
  const waxing = phase < 0.5;
  const rx = Math.abs(k) * r;
  const litSweep = waxing ? 1 : 0;
  const d = `M ${r} 0 A ${r} ${r} 0 0 ${litSweep} ${r} ${size} A ${rx} ${r} 0 0 ${k > 0 ? (waxing ? 0 : 1) : waxing ? 1 : 0} ${r} 0`;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r} fill="#2E2940" />
      <path d={d} fill="#F3EDE4" />
    </svg>
  );
}

export function SunsetLine() {
  const t = useT();
  const lang = useLang();
  const now = useNow(60_000);
  if (!now) return <span>&nbsp;</span>;
  const { sunset } = sunTimes(now);
  return (
    <span suppressHydrationWarning>
      {t(tx("Moonlight edit · after", "Edisi Moonlight · selepas"))} {timeFmt(sunset, lang)} {t(tx("in Kuala Lumpur", "di Kuala Lumpur"))}
    </span>
  );
}

export function MoonStatusCards() {
  const t = useT();
  const lang = useLang();
  const now = useNow(30_000);
  const ui = useUI();
  const m = now ? moonInfo(now) : null;
  const drop = now ? nextDropAt(now) : null;
  const cutoff = now ? (now.getHours() < 23 ? t(tx("Order by 11:59 pm", "Pesan sebelum 11:59 malam")) : t(tx("Order now", "Pesan sekarang"))) : "";
  const cards = [
    {
      icon: <Moon className="h-5 w-5" strokeWidth={1.5} />,
      title: m ? `${t(m.name)} · ${Math.round(m.fraction * 100)}%` : "—",
      sub: drop ? `${t(tx("Full Moon Drop opens", "Full Moon Drop dibuka"))} ${dateFmt(drop as Date, lang, { weekday: "short", day: "numeric", month: "short" })}, 8 pm` : "",
      href: "/drops",
    },
    {
      icon: <Radio className="h-5 w-5" strokeWidth={1.5} />,
      title: t(tx("LUNAE Live · schedule", "LUNAE Live · jadual")),
      sub: t(tx("Night-out glam tutorials after launch", "Tutorial glam malam selepas pelancaran")),
      href: "/live",
    },
    {
      icon: <Sparkles className="h-5 w-5" strokeWidth={1.5} />,
      title: "Lunae Advisor",
      sub: t(tx("Ask: 'what lasts through a wedding?'", "Tanya: 'apa tahan sepanjang kenduri?'")),
      onClick: () => ui.set({ advisorOpen: true }),
    },
    { icon: <Truck className="h-5 w-5" strokeWidth={1.5} />, title: cutoff, sub: t(tx("Klang Valley next-day delivery", "Penghantaran hari berikutnya Lembah Klang")), href: "/policies/shipping" },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4" suppressHydrationWarning>
      {cards.map((c, i) => {
        const inner = (
          <>
            <span className="text-moon/80">{c.icon}</span>
            <span className="min-w-0 text-left">
              <span className="text-moon block truncate text-[14.5px] font-semibold" suppressHydrationWarning>
                {c.title}
              </span>
              <span className="text-halo block truncate text-[13px]" suppressHydrationWarning>
                {c.sub}
              </span>
            </span>
          </>
        );
        const cls = "flex items-center gap-4 rounded-[16px] border border-mist/80 bg-dusk/60 px-5 py-4 backdrop-blur transition hover:border-halo";
        return c.href ? (
          <L key={i} href={c.href} className={cls}>
            {inner}
          </L>
        ) : (
          <button key={i} onClick={c.onClick} className={cls}>
            {inner}
          </button>
        );
      })}
    </div>
  );
}

export function DropCountdown({ big = false }: { big?: boolean }) {
  const t = useT();
  const lang = useLang();
  const now = useNow(1000);
  const drop = now ? nextDropAt(now) : null;
  const c = now && drop ? countdown(drop, now) : null;
  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <p className="eyebrow text-halo">{t(tx("Next Full Moon Drop", "Full Moon Drop seterusnya"))}</p>
        <p className="text-glow text-[13px] font-semibold" suppressHydrationWarning>
          {drop ? `${dateFmt(drop, lang, { weekday: "short", day: "numeric", month: "short" })} · 8:00 pm` : ""}
        </p>
      </div>
      <p className={`font-display text-moon mt-4 font-light tabular-nums ${big ? "text-[64px] sm:text-[88px]" : "text-[52px]"} leading-none`} suppressHydrationWarning>
        {c ? `${pad(c.d)} : ${pad(c.h)} : ${pad(c.m)}${big ? ` : ${pad(c.s)}` : ""}` : "-- : -- : --"}
      </p>
      <p className="text-halo/70 mt-2 text-[12px]">{big ? t(tx("days · hours · minutes · seconds", "hari · jam · minit · saat")) : t(tx("days · hours · minutes", "hari · jam · minit"))}</p>
    </div>
  );
}
