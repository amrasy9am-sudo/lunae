"use client";

import { KL } from "./astro";

export interface HourPoint {
  time: string;
  temp: number;
  uv: number;
  humidity: number;
}
export interface WeatherNow {
  city: string;
  temp: number;
  feels: number;
  humidity: number;
  uv: number;
  uvMax: number;
  uvPeakHour: number;
  rain: number;
  hours: HourPoint[];
  live: boolean;
}

export const CITIES = [
  { city: "Kuala Lumpur", lat: 3.139, lon: 101.6869 },
  { city: "Arau", lat: 6.4297, lon: 100.2697 },
  { city: "Seri Manjung", lat: 4.2125, lon: 100.6619 },
  { city: "George Town", lat: 5.4141, lon: 100.3288 },
  { city: "Johor Bahru", lat: 1.4927, lon: 103.7414 },
  { city: "Kota Bharu", lat: 6.1254, lon: 102.2381 },
  { city: "Kuantan", lat: 3.8077, lon: 103.326 },
  { city: "Kota Kinabalu", lat: 5.9804, lon: 116.0735 },
  { city: "Kuching", lat: 1.5533, lon: 110.3592 },
];

/** NOAA heat index (°C in, °C out). */
export function heatIndex(tC: number, rh: number) {
  const T = (tC * 9) / 5 + 32;
  if (T < 80) return tC;
  const HI =
    -42.379 + 2.04901523 * T + 10.14333127 * rh - 0.22475541 * T * rh - 0.00683783 * T * T - 0.05481717 * rh * rh + 0.00122874 * T * T * rh + 0.00085282 * T * rh * rh - 0.00000199 * T * T * rh * rh;
  return Math.round(((HI - 32) * 5) / 9);
}

export function sweatRisk(w: Pick<WeatherNow, "feels" | "humidity" | "uv">): "low" | "moderate" | "high" | "very-high" {
  const score = (w.feels - 28) * 1.2 + (w.humidity - 60) * 0.15 + w.uv * 0.6;
  if (score > 14) return "very-high";
  if (score > 8) return "high";
  if (score > 3) return "moderate";
  return "low";
}

export function routineFor(risk: ReturnType<typeof sweatRisk>, uv: number) {
  const r = ["daybreak-sun-gel"];
  if (risk === "low") r.push("moonbeam-skin-tint", "nightbloom-lip-cheek-tint");
  else r.push("eclipse-cushion", "tide-setting-mist");
  if (risk === "very-high") r.push("stardust-loose-powder");
  if (uv < 3) r.shift();
  return r;
}

export const SAMPLE: WeatherNow = {
  city: KL.city,
  temp: 33,
  feels: 39,
  humidity: 78,
  uv: 10,
  uvMax: 11,
  uvPeakHour: 13,
  rain: 40,
  live: false,
  hours: [9, 11, 13, 15, 17, 19].map((h, i) => ({ time: `${h}:00`, temp: [29, 32, 34, 34, 32, 29][i], uv: [4, 9, 11, 9, 4, 0][i], humidity: [84, 76, 70, 68, 74, 82][i] })),
};

export async function fetchWeather(lat = KL.lat, lon = KL.lon, city = KL.city): Promise<WeatherNow> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(2)}&longitude=${lon.toFixed(2)}&current=temperature_2m,relative_humidity_2m,apparent_temperature,uv_index&hourly=temperature_2m,relative_humidity_2m,uv_index&daily=uv_index_max,precipitation_probability_max&timezone=Asia%2FKuala_Lumpur&forecast_days=1`;
  const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
  if (!res.ok) throw new Error("weather");
  const d = await res.json();
  const hours: HourPoint[] = (d.hourly.time as string[]).map((t: string, i: number) => ({
    time: t.slice(11, 16),
    temp: Math.round(d.hourly.temperature_2m[i]),
    uv: Math.round(d.hourly.uv_index[i] ?? 0),
    humidity: Math.round(d.hourly.relative_humidity_2m[i]),
  }));
  const peak = hours.reduce((a, h, i) => (h.uv > hours[a].uv ? i : a), 0);
  const temp = Math.round(d.current.temperature_2m);
  const humidity = Math.round(d.current.relative_humidity_2m);
  return {
    city,
    temp,
    humidity,
    feels: Math.max(Math.round(d.current.apparent_temperature), heatIndex(temp, humidity)),
    uv: Math.round(d.current.uv_index ?? 0),
    uvMax: Math.round(d.daily.uv_index_max?.[0] ?? hours[peak].uv),
    uvPeakHour: parseInt(hours[peak].time),
    rain: Math.round(d.daily.precipitation_probability_max?.[0] ?? 0),
    hours: hours.filter((_, i) => i >= 7 && i <= 20 && i % 2 === 1),
    live: true,
  };
}

export function nearestCity(lat: number, lon: number) {
  return CITIES.reduce((best, c) => (Math.hypot(c.lat - lat, c.lon - lon) < Math.hypot(best.lat - lat, best.lon - lon) ? c : best), CITIES[0]);
}
