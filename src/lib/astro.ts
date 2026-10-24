import * as SunCalc from "suncalc";

/** Default coarse location: Kuala Lumpur. We never store precise location. */
export const KL = { lat: 3.139, lon: 101.6869, city: "Kuala Lumpur" };

export function sunTimes(date = new Date(), lat = KL.lat, lon = KL.lon) {
  const t = SunCalc.getTimes(date, lat, lon);
  const d = new Date(date);
  const fallback = (h: number, m: number) => {
    const x = new Date(d);
    x.setHours(h, m, 0, 0);
    return x;
  };
  const ok = (v: Date | null | undefined): v is Date => !!v && !isNaN(v.getTime());
  return { sunrise: ok(t.sunrise) ? t.sunrise : fallback(7, 5), sunset: ok(t.sunset) ? t.sunset : fallback(19, 15) };
}

export function isAfterSunset(date = new Date(), lat = KL.lat, lon = KL.lon) {
  const { sunrise, sunset } = sunTimes(date, lat, lon);
  return date < sunrise || date >= sunset;
}

export function moonInfo(date = new Date()) {
  const m = SunCalc.getMoonIllumination(date);
  // phase: 0 new, 0.25 first quarter, 0.5 full, 0.75 last quarter
  const waxing = m.phase < 0.5;
  let name: { en: string; ms: string };
  const p = m.phase;
  if (p < 0.03 || p > 0.97) name = { en: "New moon", ms: "Anak bulan" };
  else if (p < 0.22) name = { en: "Waxing crescent", ms: "Sabit muda" };
  else if (p < 0.28) name = { en: "First quarter", ms: "Separa awal" };
  else if (p < 0.47) name = { en: "Waxing gibbous", ms: "Bulan mengembang" };
  else if (p < 0.53) name = { en: "Full moon", ms: "Bulan purnama" };
  else if (p < 0.72) name = { en: "Waning gibbous", ms: "Bulan menyusut" };
  else if (p < 0.78) name = { en: "Last quarter", ms: "Separa akhir" };
  else name = { en: "Waning crescent", ms: "Sabit tua" };
  return { fraction: m.fraction, phase: m.phase, waxing, name };
}

/** Next full moon after `from` (hour resolution, refined to ~10 min). */
export function nextFullMoon(from = new Date()) {
  let t = new Date(from.getTime());
  let prev = SunCalc.getMoonIllumination(t).phase;
  for (let i = 0; i < 24 * 31; i++) {
    const n = new Date(t.getTime() + 3600_000);
    const ph = SunCalc.getMoonIllumination(n).phase;
    if (prev < 0.5 && ph >= 0.5) {
      // refine within the hour
      let a = t.getTime();
      let b = n.getTime();
      for (let k = 0; k < 8; k++) {
        const mid = (a + b) / 2;
        if (SunCalc.getMoonIllumination(new Date(mid)).phase < 0.5) a = mid;
        else b = mid;
      }
      return new Date(b);
    }
    prev = ph;
    t = n;
  }
  return new Date(from.getTime() + 29.53 * 86400_000);
}

/** Full Moon Drop opens at 8:00 pm (MYT) on the evening nearest the full moon. */
export function nextDropAt(from = new Date()) {
  let fm = nextFullMoon(from);
  const make = (d: Date) => {
    // Date in MYT
    const myt = new Date(d.getTime() + 8 * 3600_000);
    const y = myt.getUTCFullYear();
    const m = myt.getUTCMonth();
    const day = myt.getUTCDate();
    return new Date(Date.UTC(y, m, day, 12, 0, 0)); // 20:00 MYT == 12:00 UTC
  };
  let drop = make(fm);
  if (drop.getTime() < from.getTime()) {
    fm = nextFullMoon(new Date(fm.getTime() + 2 * 86400_000));
    drop = make(fm);
  }
  return drop;
}

export function countdown(to: Date, now = new Date()) {
  const ms = Math.max(0, to.getTime() - now.getTime());
  const d = Math.floor(ms / 86400_000);
  const h = Math.floor((ms % 86400_000) / 3600_000);
  const m = Math.floor((ms % 3600_000) / 60_000);
  const s = Math.floor((ms % 60_000) / 1000);
  return { d, h, m, s, ms };
}
