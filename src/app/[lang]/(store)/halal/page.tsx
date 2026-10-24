import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-bits";

export const metadata: Metadata = { title: "Halal promise" };

export default async function HalalPage({ params }: PageProps<"/[lang]/halal">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const steps = [
    {
      h: tx("Formulate to MS 2634:2019", "Formulasi ikut MS 2634:2019"),
      p: tx(
        "Malaysian Standard for halal cosmetics guides every brief from day one. No prohibited substances; within ASEAN annex limits.",
        "Piawaian Malaysia untuk kosmetik halal membimbing setiap ringkasan sejak hari pertama. Tiada bahan larangan; dalam had lampiran ASEAN.",
      ),
    },
    {
      h: tx("Verify every source", "Sahkan setiap sumber"),
      p: tx(
        "Glycerin, emulsifiers and fatty acids must be plant-derived with supplier halal certificates. Botanical extracts must not use ethanol from alcoholic beverages.",
        "Gliserin, pengemulsi dan asid lemak mesti daripada tumbuhan dengan sijil halal pembekal. Ekstrak botani tidak boleh guna etanol daripada minuman beralkohol.",
      ),
    },
    {
      h: tx("Halal-certified factories", "Kilang bersijil halal"),
      p: tx("We only work with GMP- and halal-certified ODM factories in Malaysia.", "Kami hanya bekerjasama dengan kilang ODM bersijil GMP dan halal di Malaysia."),
    },
    {
      h: tx("JAKIM certification", "Pensijilan JAKIM"),
      p: tx("Applied for in months 7–8 of development, before the first production run is released.", "Dimohon pada bulan 7–8 pembangunan, sebelum keluaran pengeluaran pertama."),
    },
    {
      h: tx("Batch-level transparency", "Ketelusan peringkat kelompok"),
      p: tx(
        "Scan the QR on any box to see the batch's halal certificate, NPRA notification and certificate of analysis.",
        "Imbas QR pada mana-mana kotak untuk lihat sijil halal kelompok, notifikasi NPRA dan sijil analisis.",
      ),
    },
  ];
  const never = ["Carmine", "Beeswax", "Lanolin", "Gelatin", "Animal-derived ingredients", "Ethanol from alcoholic beverages", "Animal hair brushes or puffs"];
  return (
    <>
      <PageHeader
        eyebrow={T(tx("Halal promise", "Janji halal"))}
        title={T(tx("Certainty, without compromise.", "Kepastian, tanpa kompromi."))}
        intro={T(
          tx(
            "Halal at LUNAE isn't a sticker — it's built into every formula, supplier and batch. Here's exactly how.",
            "Halal di LUNAE bukan sekadar pelekat — ia terbina dalam setiap formula, pembekal dan kelompok. Begini caranya.",
          ),
        )}
      />
      <section className="container-lux grid gap-12 py-16 lg:grid-cols-[1.4fr_1fr]">
        <ol className="space-y-6">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-5">
              <span className="bg-tint-sage font-display text-sage grid h-11 w-11 shrink-0 place-items-center rounded-full text-[22px]">{i + 1}</span>
              <div>
                <h2 className="font-serif text-[21px] font-semibold">{T(s.h)}</h2>
                <p className="text-ink-2 mt-1.5 text-[16px]">{T(s.p)}</p>
              </div>
            </li>
          ))}
        </ol>
        <aside className="bg-night text-moon self-start rounded-[24px] p-8">
          <p className="eyebrow text-glow">{T(tx("Never in our formulas", "Tidak pernah dalam formula kami"))}</p>
          <ul className="mt-5 space-y-3">
            {never.map((n) => (
              <li key={n} className="flex items-center gap-3 text-[15px]">
                <CheckCircle2 className="text-glow h-5 w-5" strokeWidth={1.5} /> {n}
              </li>
            ))}
          </ul>
          <p className="text-halo mt-6 text-[13px]">
            {T(
              tx(
                "Not tested on animals. Certification status is shown on each batch page once issued.",
                "Tidak diuji pada haiwan. Status pensijilan dipaparkan di setiap halaman kelompok sebaik dikeluarkan.",
              ),
            )}
          </p>
          <Link href={lhref(lang, "/trace")} className="btn btn-sm bg-moon text-cocoa-ink mt-6">
            {T(tx("Check a batch", "Semak kelompok"))}
          </Link>
        </aside>
      </section>
    </>
  );
}
