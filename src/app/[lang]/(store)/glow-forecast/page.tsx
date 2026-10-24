import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { GlowForecast } from "@/components/glow-forecast";

export const metadata: Metadata = { title: "Weather Glow" };

export default async function GlowPage({ params }: PageProps<"/[lang]/glow-forecast">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow="Weather Glow"
        title={ms ? "Rutin anda, ikut cuaca hari ini." : "Your routine, tuned to today's weather."}
        intro={
          ms
            ? "Suhu, indeks haba, kelembapan dan UV → skor risiko peluh dan rutin yang dicadangkan. Lokasi kasar sahaja, hanya jika anda benarkan."
            : "Temperature, heat index, humidity and UV → a sweat-risk score and a suggested routine. Coarse location only, and only if you allow it."
        }
      />
      <div className="container-lux py-12">
        <GlowForecast />
        <p className="text-ink-3 mt-6 text-[12px]">{ms ? "Data cuaca: Open-Meteo. Dicache 30 minit." : "Weather data: Open-Meteo. Cached for 30 minutes."}</p>
      </div>
    </>
  );
}
