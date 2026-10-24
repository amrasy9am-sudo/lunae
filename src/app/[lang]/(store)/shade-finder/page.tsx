import type { Metadata } from "next";
import { PageHeader } from "@/components/page-bits";
import { ShadeFinder } from "@/components/shade-finder";

export const metadata: Metadata = { title: "AI Shade Finder" };

export default async function ShadeFinderPage({ params }: PageProps<"/[lang]/shade-finder">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <PageHeader
        eyebrow={ms ? "Pencari Rona AI" : "AI Shade Finder"}
        title={ms ? "Cari rona tepat anda dalam 60 saat." : "Find your exact shade in 60 seconds."}
        intro={
          ms
            ? "12 rona yang dibangunkan untuk kulit Asia Tenggara — hangat, neutral, sejuk dan zaitun. Dipadankan dengan sains warna CIELAB/ΔE2000."
            : "12 shades developed for Southeast Asian skin — warm, neutral, cool and olive. Matched with CIELAB/ΔE2000 colour science."
        }
      />
      <div className="container-lux py-12 lg:py-16">
        <ShadeFinder />
      </div>
    </>
  );
}
