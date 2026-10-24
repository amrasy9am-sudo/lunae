"use client";

import Image from "next/image";
import { useState } from "react";
import { Bell, Check, Crosshair, Droplet, Sun, Thermometer } from "lucide-react";
import { useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { CITIES, fetchWeather, nearestCity, routineFor, sweatRisk } from "@/lib/weather";
import { RISK, useWeather } from "./weather-strip";
import { productBySlug, tintBg } from "@/data/catalogue";
import { useAccount, useCart, useUI } from "@/lib/store";

export function GlowForecast() {
  const t = useT();
  const [w, setW] = useWeather();
  const [busy, setBusy] = useState(false);
  const cart = useCart();
  const ui = useUI();
  const acc = useAccount();
  const risk = sweatRisk(w);
  const routine = routineFor(risk, w.uvMax);
  const maxUv = Math.max(11, ...w.hours.map((h) => h.uv));
  const load = async (lat: number, lon: number, city: string) => {
    setBusy(true);
    try {
      setW(await fetchWeather(lat, lon, city));
    } catch {
      ui.notify(t(tx("Couldn't load live weather — showing a typical day.", "Tak dapat muat cuaca langsung — memaparkan hari biasa.")), "warning");
    } finally {
      setBusy(false);
    }
  };
  const tips: Record<string, { en: string; ms: string }> = {
    low: tx("A light day: tint + flush is plenty. Still wear SPF.", "Hari ringan: tint + rona sudah memadai. Tetap pakai SPF."),
    moderate: tx("Use thin layers and set the T-zone.", "Guna lapisan nipis dan set zon-T."),
    high: tx("Film-forming base, set with mist, blot — don't wipe — at lunch.", "Alas pembentuk filem, set dengan semburan, tekap — jangan lap — waktu makan tengah hari."),
    "very-high": tx(
      "Go minimal and lock everything in: SPF, cushion, powder on the T-zone, mist. Reapply SPF at the UV peak.",
      "Ringkaskan dan kunci semuanya: SPF, kusyen, bedak pada zon-T, semburan. Ulang SPF pada puncak UV.",
    ),
  };
  return (
    <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
      <div className="bg-night text-moon rounded-[28px] p-7 sm:p-9">
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2">
            <span className="sr-only">{t(tx("City", "Bandar"))}</span>
            <select
              value={w.city}
              onChange={(e) => {
                const c = CITIES.find((x) => x.city === e.target.value)!;
                load(c.lat, c.lon, c.city);
              }}
              className="border-mist bg-dusk text-moon h-10 rounded-full border px-4 text-[14px]"
            >
              {CITIES.map((c) => (
                <option key={c.city}>{c.city}</option>
              ))}
            </select>
          </label>
          <button
            className="btn btn-sm border-mist text-moon border"
            disabled={busy}
            onClick={() =>
              navigator.geolocation?.getCurrentPosition(
                (p) => {
                  const c = nearestCity(p.coords.latitude, p.coords.longitude);
                  load(p.coords.latitude, p.coords.longitude, c.city);
                },
                () => ui.notify(t(tx("Location not shared — pick a city instead.", "Lokasi tidak dikongsi — pilih bandar.")), "info"),
                { maximumAge: 3600_000, enableHighAccuracy: false },
              )
            }
          >
            <Crosshair className="h-4 w-4" /> {t(tx("Use my location", "Guna lokasi saya"))}
          </button>
          {!w.live && <span className="text-halo text-[12px]">({t(tx("typical day shown", "hari biasa dipaparkan"))})</span>}
        </div>
        <p className="font-display mt-8 text-[64px] leading-none sm:text-[80px]">
          {w.temp}° · UV {w.uvMax}
        </p>
        <p className="text-halo mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[15px]">
          <span className="flex items-center gap-1.5">
            <Thermometer className="h-4 w-4" /> {t(tx("Feels", "Terasa"))} {w.feels}°C
          </span>
          <span className="flex items-center gap-1.5">
            <Droplet className="h-4 w-4" /> {t(tx("Humidity", "Kelembapan"))} {w.humidity}%
          </span>
          <span>
            {t(tx("Sweat risk", "Risiko peluh"))} <strong className="text-ember">{t(RISK[risk])}</strong>
          </span>
          <span>
            {t(tx("Rain", "Hujan"))} {w.rain}%
          </span>
        </p>
        <div className="border-mist bg-dusk/60 mt-8 rounded-[20px] border p-5">
          <div className="text-halo flex justify-between text-[13px]">
            <span>{t(tx("UV index today", "Indeks UV hari ini"))}</span>
            <span>
              {t(tx("Peak around", "Puncak sekitar"))} {w.uvPeakHour}:00
            </span>
          </div>
          <div className="mt-5 flex h-40 items-end justify-between gap-2" role="img" aria-label={t(tx("Hourly UV chart", "Carta UV setiap jam"))}>
            {w.hours.map((h) => (
              <div key={h.time} className="flex flex-1 flex-col items-center gap-2">
                <span className="text-halo text-[11px]">{h.uv}</span>
                <span
                  className="w-full max-w-[34px] rounded-full"
                  style={{ height: `${Math.max(6, (h.uv / maxUv) * 110)}px`, background: h.uv >= 8 ? "#E08E6D" : h.uv >= 3 ? "#D9B77E" : "#4A4460" }}
                />
                <span className="text-halo text-[11px]">{h.time}</span>
                <span className="text-[12px] font-semibold">{h.temp}°</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="space-y-4">
        <div className="border-line bg-surface rounded-[24px] border p-6">
          <p className="eyebrow text-accent-deep">{t(tx("Today's routine", "Rutin hari ini"))}</p>
          <p className="text-ink-2 mt-3 text-[15px]">{t(tips[risk])}</p>
          <ul className="mt-5 space-y-3">
            {routine.map((s) => {
              const p = productBySlug(s)!;
              return (
                <li key={s} className="flex items-center gap-3">
                  <span className={`relative h-14 w-12 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                    <Image src={`/img/cutouts/${s}.webp`} alt="" fill sizes="48px" className="object-contain p-1.5" />
                  </span>
                  <L href={`/products/${s}`} className="min-w-0 flex-1">
                    <span className="product-name block">{p.name}</span>
                    <span className="text-ink-3 block text-[13px]">{t(p.tagline)}</span>
                  </L>
                  <Check className="text-sage h-5 w-5" />
                </li>
              );
            })}
          </ul>
          <button
            className="btn btn-primary mt-6 w-full"
            onClick={() => {
              routine.forEach((s) => cart.add({ slug: s, shade: productBySlug(s)?.shades[0]?.name, qty: 1 }));
              ui.set({ cartOpen: true });
            }}
          >
            {t(tx("Shop today's routine", "Beli rutin hari ini"))}
          </button>
        </div>
        <div className="bg-glow/90 text-cocoa-ink rounded-[24px] p-6">
          <p className="flex items-center gap-2 font-semibold">
            <Sun className="h-5 w-5" /> {t(tx("SPF reminder at UV peak", "Peringatan SPF pada puncak UV"))}
          </p>
          <p className="mt-1 text-[14px]">{t(tx("One push a day, only with your consent, never 10 pm–8 am.", "Satu notifikasi sehari, hanya dengan persetujuan, tidak 10 malam–8 pagi."))}</p>
          <button
            className="btn btn-sm bg-cocoa-ink text-cream mt-4"
            onClick={async () => {
              if (!("Notification" in window)) return ui.notify(t(tx("Notifications aren't supported on this browser.", "Notifikasi tidak disokong pada pelayar ini.")), "info");
              const perm = await Notification.requestPermission();
              if (perm === "granted") {
                acc.setConsent("push", true);
                new Notification("LUNAE · Weather Glow", {
                  body: t(tx(`UV peaks around ${w.uvPeakHour}:00 today — time to reapply Daybreak.`, `UV memuncak sekitar ${w.uvPeakHour}:00 hari ini — masa untuk sapu semula Daybreak.`)),
                  icon: "/icon.svg",
                });
                ui.notify(t(tx("SPF reminders on", "Peringatan SPF diaktifkan")));
              } else ui.notify(t(tx("Reminders stay off.", "Peringatan kekal mati.")), "info");
            }}
          >
            <Bell className="h-4 w-4" /> {acc.consents.push ? t(tx("Reminders on", "Peringatan aktif")) : t(tx("Remind me", "Ingatkan saya"))}
          </button>
        </div>
      </div>
    </div>
  );
}
