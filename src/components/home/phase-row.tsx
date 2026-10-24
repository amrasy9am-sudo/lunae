import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";

export function PhaseIcon({ phase, size = 48 }: { phase: "sabit" | "separa" | "purnama"; size?: number }) {
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={r} cy={r} r={r - 1} fill="#2E2940" stroke="#4A4460" />
      {phase === "purnama" && <circle cx={r} cy={r} r={r - 1} fill="#F3EDE4" />}
      {phase === "separa" && <path d={`M ${r} 1 A ${r - 1} ${r - 1} 0 0 1 ${r} ${size - 1} Z`} fill="#F3EDE4" />}
      {phase === "sabit" && <path d={`M ${r} 1 A ${r - 1} ${r - 1} 0 0 1 ${r} ${size - 1} A ${(r - 1) * 0.45} ${r - 1} 0 0 0 ${r} 1 Z`} fill="#F3EDE4" />}
    </svg>
  );
}

export function MoonPhaseRow({ lang }: { lang: Locale }) {
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const tiers = [
    { k: "sabit" as const, name: "Sabit", sub: tx("Join · 1× points", "Sertai · 1× mata") },
    { k: "separa" as const, name: "Separa", sub: tx("RM300/yr · 1.25×", "RM300/thn · 1.25×") },
    { k: "purnama" as const, name: "Purnama", sub: tx("RM800/yr · 1.5×", "RM800/thn · 1.5×") },
  ];
  return (
    <ul className="mt-10 grid grid-cols-3 gap-4 text-center">
      {tiers.map((t) => (
        <li key={t.k} className="flex flex-col items-center">
          <PhaseIcon phase={t.k} />
          <p className={`mt-3 text-[14px] font-semibold ${t.k === "purnama" ? "text-glow" : "text-moon"}`}>{t.name}</p>
          <p className="text-halo/80 mt-0.5 text-[12px]">{T(t.sub)}</p>
        </li>
      ))}
    </ul>
  );
}
