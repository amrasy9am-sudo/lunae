import type { Metadata } from "next";
import Image from "next/image";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { DropCountdown } from "@/components/home/moon-widgets";
import { DropWaitlist } from "@/components/drop-waitlist";

export const metadata: Metadata = { title: "Full Moon Drops" };

export default async function DropsPage({ params }: PageProps<"/[lang]/drops">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const rules = [
    tx("Opens at 8:00 pm on full-moon nights — 12 drops a year.", "Dibuka 8:00 malam pada malam bulan purnama — 12 drop setahun."),
    tx("Purnama members get the first hour.", "Ahli Purnama mendapat jam pertama."),
    tx("A fair, random virtual queue — no refresh racing.", "Barisan maya rawak yang adil — tiada perlumbaan muat semula."),
    tx("Limits per customer and device so more people get one.", "Had bagi setiap pelanggan dan peranti supaya lebih ramai dapat."),
    tx("Reserved stock is held for 10 minutes while you pay.", "Stok ditempah selama 10 minit semasa anda membayar."),
    tx("2× Lunae Circle points on drop night.", "2× mata Lunae Circle pada malam drop."),
  ];
  return (
    <>
      <section className="starfield bg-night text-moon relative overflow-hidden">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-[1.1fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow text-glow">Full Moon Drop · {T(tx("Limited edition", "Edisi terhad"))}</p>
            <h1 className="display-xl mt-5">
              Lunar Eclipse <em className="italic">{T(tx("palette", "palet"))}</em>
            </h1>
            <p className="text-halo mt-6 max-w-xl text-[17px]">
              {T(
                tx(
                  "Limited editions launch only on full-moon nights. Details are revealed to the waitlist first — join to get reminders and your place in the queue.",
                  "Edisi terhad dilancarkan hanya pada malam bulan purnama. Butiran didedahkan kepada senarai menunggu dahulu — sertai untuk peringatan dan tempat dalam barisan.",
                ),
              )}
            </p>
            <div className="mt-8 max-w-lg">
              <DropWaitlist drop="lunar-eclipse" />
            </div>
          </div>
          <div className="space-y-6">
            <div className="relative mx-auto aspect-square w-full max-w-[420px]">
              <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(circle_at_40%_40%,#F3EDE4,#D9B77E_60%,#8a6d43)] opacity-90 blur-[1px]" />
              <div className="bg-night/85 absolute inset-[8%] translate-x-[10%] rounded-full" />
              <Image src="/img/cutouts/dusk-cream-blush.webp" alt="" width={911} height={749} className="absolute top-[34%] left-[18%] w-[56%] blur-[6px] brightness-50" />
              <p className="text-halo absolute inset-x-0 bottom-[12%] text-center text-[12px] tracking-[0.3em] uppercase">{T(tx("To be revealed", "Akan didedahkan"))}</p>
            </div>
            <div className="border-mist bg-dusk/70 rounded-[24px] border p-7">
              <DropCountdown big />
            </div>
          </div>
        </div>
      </section>
      <section className="container-lux py-16">
        <h2 className="heading">{T(tx("How drops work", "Cara drop berfungsi"))}</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rules.map((r, i) => (
            <li key={i} className="border-line bg-surface flex gap-4 rounded-[18px] border p-5">
              <span className="font-display text-accent text-[34px] leading-none">{i + 1}</span>
              <span className="text-[15.5px]">{T(r)}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
