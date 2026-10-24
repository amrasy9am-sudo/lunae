import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Gift, Video, PenLine } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { sets } from "@/data/catalogue";
import { PageHeader } from "@/components/page-bits";
import { SetCard } from "@/components/set-card";

export const metadata: Metadata = { title: "Sets & gifts" };

export default async function SetsPage({ params }: PageProps<"/[lang]/sets">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  return (
    <>
      <PageHeader
        eyebrow={T(tx("Sets & gifts", "Set & hadiah"))}
        title={T(tx("Routines, ready to gift.", "Rutin, sedia dihadiahkan."))}
        intro={T(
          tx(
            "Each set saves 10–15% automatically. Add gift mode at checkout to hide prices and include a handwritten card.",
            "Setiap set jimat 10–15% secara automatik. Tambah mod hadiah di checkout untuk sembunyi harga dan sertakan kad bertulis tangan.",
          ),
        )}
      />
      <section className="container-lux grid gap-6 py-14 md:grid-cols-2 lg:grid-cols-3">
        {sets.map((s) => (
          <SetCard key={s.slug} s={s} />
        ))}
      </section>
      <section className="container-lux pb-20">
        <div className="bg-tint-blush grid items-center gap-10 overflow-hidden rounded-[28px] lg:grid-cols-2">
          <div className="relative aspect-[4/3] lg:aspect-auto lg:h-full">
            <Image src="/img/collections/semua-16-produk.webp" alt="" fill sizes="50vw" className="object-cover" />
          </div>
          <div className="p-8 lg:p-12">
            <p className="eyebrow text-accent-deep">{T(tx("Gift mode", "Mod hadiah"))}</p>
            <h2 className="heading mt-3">{T(tx("Build a gift box for Raya, Mother's Day or birthdays", "Bina kotak hadiah untuk Raya, Hari Ibu atau hari jadi"))}</h2>
            <ul className="mt-6 space-y-4 text-[15.5px]">
              <li className="flex gap-3">
                <Gift className="text-accent-deep h-5 w-5 shrink-0" strokeWidth={1.5} />{" "}
                {T(tx("Pick any 3+ products — routine savings apply automatically", "Pilih mana-mana 3+ produk — jimat rutin automatik"))}
              </li>
              <li className="flex gap-3">
                <PenLine className="text-accent-deep h-5 w-5 shrink-0" strokeWidth={1.5} /> {T(tx("Prices hidden, handwritten card included", "Harga disembunyikan, kad bertulis tangan disertakan"))}
              </li>
              <li className="flex gap-3">
                <Video className="text-accent-deep h-5 w-5 shrink-0" strokeWidth={1.5} />{" "}
                {T(tx("15-second video message via QR on the card (coming in phase 2)", "Mesej video 15 saat melalui QR pada kad (fasa 2)"))}
              </li>
            </ul>
            <Link href={lhref(lang, "/routine")} className="btn btn-primary mt-8">
              {T(tx("Start a gift box", "Mula kotak hadiah"))}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
