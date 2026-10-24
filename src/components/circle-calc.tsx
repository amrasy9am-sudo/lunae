"use client";

import { useState } from "react";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";
import { tierFor, TIERS } from "@/lib/pricing";
import { rm } from "@/lib/format";

export function PointsCalculator() {
  const t = useT();
  const [monthly, setMonthly] = useState(100);
  const year = monthly * 12;
  const tier = tierFor(year);
  const pts = Math.round(year * tier.mult);
  return (
    <div className="border-line bg-surface rounded-[24px] border p-7">
      <p className="eyebrow text-ink-3">{t(tx("Points calculator", "Kalkulator mata"))}</p>
      <label className="mt-5 block">
        <span className="flex items-baseline justify-between">
          <span className="text-[15px]">{t(tx("I spend about", "Saya belanja kira-kira"))}</span>
          <span className="font-display text-[34px] leading-none">
            {rm(monthly)}
            <span className="text-ink-3 font-sans text-[14px]"> / {t(tx("month", "bulan"))}</span>
          </span>
        </span>
        <input type="range" min={20} max={300} step={10} value={monthly} onChange={(e) => setMonthly(+e.target.value)} className="mt-4 w-full accent-[var(--accent)]" />
      </label>
      <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="bg-bg rounded-[14px] p-3">
          <dt className="text-ink-3 text-[12px]">{t(tx("Your phase", "Fasa anda"))}</dt>
          <dd className="mt-1 font-serif text-[20px] font-semibold">{tier.name}</dd>
        </div>
        <div className="bg-bg rounded-[14px] p-3">
          <dt className="text-ink-3 text-[12px]">{t(tx("Points / year", "Mata / tahun"))}</dt>
          <dd className="mt-1 font-serif text-[20px] font-semibold">{pts.toLocaleString()}</dd>
        </div>
        <div className="bg-bg rounded-[14px] p-3">
          <dt className="text-ink-3 text-[12px]">{t(tx("Worth", "Bernilai"))}</dt>
          <dd className="mt-1 font-serif text-[20px] font-semibold">{rm(pts / 100)}</dd>
        </div>
      </dl>
      <p className="text-ink-3 mt-4 text-[12.5px]">
        {t(tx("Plus 200 welcome points, birthday rewards and 2× points on Full Moon Drop nights.", "Serta 200 mata alu-aluan, ganjaran hari jadi dan 2× mata pada malam Full Moon Drop."))}{" "}
        {TIERS.length} {t(tx("phases", "fasa"))}.
      </p>
    </div>
  );
}
