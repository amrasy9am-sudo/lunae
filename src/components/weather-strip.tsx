"use client";

import { useEffect, useState } from "react";
import { Droplet, Sun, Thermometer } from "lucide-react";
import { useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { fetchWeather, routineFor, SAMPLE, sweatRisk, type WeatherNow } from "@/lib/weather";
import { productBySlug } from "@/data/catalogue";
import { useCart, useUI } from "@/lib/store";

export const RISK = {
  low: tx("Low", "Rendah"),
  moderate: tx("Moderate", "Sederhana"),
  high: tx("High", "Tinggi"),
  "very-high": tx("Very high", "Sangat tinggi"),
};

export function useWeather() {
  const [w, setW] = useState<WeatherNow>(SAMPLE);
  useEffect(() => {
    let alive = true;
    const cached = (() => {
      try {
        const c = JSON.parse(sessionStorage.getItem("lunae-weather") ?? "null");
        if (c && Date.now() - c.at < 30 * 60_000) return c.w as WeatherNow;
      } catch {}
      return null;
    })();
    if (cached) {
      setW(cached);
      return;
    }
    fetchWeather()
      .then((x) => {
        if (!alive) return;
        setW(x);
        try {
          sessionStorage.setItem("lunae-weather", JSON.stringify({ at: Date.now(), w: x }));
        } catch {}
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return [w, setW] as const;
}

export function WeatherStrip() {
  const t = useT();
  const [w] = useWeather();
  const cart = useCart();
  const ui = useUI();
  const risk = sweatRisk(w);
  const routine = routineFor(risk, w.uvMax);
  const reapply = `${w.uvPeakHour > 12 ? w.uvPeakHour - 12 : w.uvPeakHour}:30 ${w.uvPeakHour >= 12 ? "pm" : "am"}`;
  return (
    <section aria-label="Weather Glow" className="bg-band text-band-ink">
      <div className="container-lux grid items-center gap-5 py-6 lg:grid-cols-[auto_auto_auto_auto_1fr_auto] lg:gap-8">
        <div className="flex items-center gap-3">
          <Sun className="text-glow h-6 w-6" strokeWidth={1.5} />
          <div>
            <p className="eyebrow text-glow">Weather Glow · {t(tx("Today", "Hari ini"))}</p>
            <p className="mt-1 text-[16px] font-medium">
              {w.city}
              {!w.live && <span className="text-halo ml-2 text-[11px] font-normal">({t(tx("typical day", "hari biasa"))})</span>}
            </p>
          </div>
        </div>
        <p className="flex items-center gap-2 text-[15px]">
          <Thermometer className="h-4 w-4" strokeWidth={1.5} /> {w.temp}°C, {t(tx("feels", "terasa"))} {w.feels}°C
        </p>
        <p className="flex items-center gap-2 text-[15px]">
          <Droplet className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Humidity", "Kelembapan"))} {w.humidity}%
        </p>
        <p className="flex items-center gap-2 text-[15px]">
          <Sun className="h-4 w-4" strokeWidth={1.5} /> UV {w.uvMax} · {w.uvMax >= 8 ? t(tx("Very high", "Sangat tinggi")) : w.uvMax >= 6 ? t(tx("High", "Tinggi")) : t(tx("Moderate", "Sederhana"))}
        </p>
        <p className="text-[14.5px] leading-snug">
          {t(tx("Sweat risk", "Risiko peluh"))} <strong className="text-ember">{t(RISK[risk])}</strong> → {t(tx("your routine:", "rutin anda:"))}{" "}
          <strong>{routine.map((s) => productBySlug(s)?.shortName).join(" · ")}</strong>{" "}
          {w.uvMax >= 6 && (
            <span className="text-halo">
              ({t(tx("reapply SPF at", "ulang SPF pada"))} {reapply})
            </span>
          )}
        </p>
        <div className="flex gap-2">
          <button
            className="btn btn-accent btn-sm"
            onClick={() => {
              routine.forEach((s) => cart.add({ slug: s, shade: productBySlug(s)?.shades[0]?.name, qty: 1 }));
              ui.set({ cartOpen: true });
            }}
          >
            {t(tx("Shop today's routine", "Beli rutin hari ini"))}
          </button>
          <L href="/glow-forecast" className="btn btn-sm border-mist text-band-ink hidden border xl:inline-flex">
            {t(tx("Forecast", "Ramalan"))}
          </L>
        </div>
      </div>
    </section>
  );
}
