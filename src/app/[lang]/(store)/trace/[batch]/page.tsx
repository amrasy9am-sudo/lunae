import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { QrCode, ShieldCheck, Check, AlertTriangle } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { batchByNo, batches } from "@/data/batches";
import { productBySlug, tintBg } from "@/data/catalogue";
import { formulas } from "@/data/formulas";
import { dateFmt } from "@/lib/format";
import { ReactionReport } from "@/components/reaction-report";
import { TraceLookup } from "@/components/trace-lookup";

export function generateStaticParams() {
  return batches.map((b) => ({ batch: b.no }));
}

export const metadata: Metadata = { title: "Batch trace", robots: { index: false } };

export default async function BatchPage({ params }: PageProps<"/[lang]/trace/[batch]">) {
  const { lang: l, batch } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const b = batchByNo(decodeURIComponent(batch));
  if (!b)
    return (
      <div className="container-lux py-16">
        <div className="border-error/40 bg-surface flex max-w-2xl items-start gap-4 rounded-[20px] border p-6">
          <AlertTriangle className="text-error h-6 w-6 shrink-0" />
          <div>
            <p className="font-semibold">{T(tx("We can't find that batch or serial.", "Kami tidak menjumpai kelompok atau siri itu."))}</p>
            <p className="text-ink-2 mt-1 text-[15px]">
              {T(
                tx(
                  "Check the code on the base of the box. If it still doesn't match, the product may not be genuine — please contact us with a photo of the packaging.",
                  "Semak kod di bawah kotak. Jika masih tidak sepadan, produk mungkin tidak tulen — sila hubungi kami dengan gambar pembungkusan.",
                ),
              )}
            </p>
          </div>
        </div>
        <div className="mt-10">
          <TraceLookup />
        </div>
      </div>
    );
  const p = productBySlug(b.slug)!;
  const f = formulas[b.slug];
  const months = Math.round((new Date(b.expiry).getTime() - new Date(b.manufactured).getTime()) / (30.4 * 86400_000));
  const journey = [
    { h: tx("Formulated", "Diformulasi"), d: b.formulated, p: tx("Formula approved by LUNAE R&D · ODM partner", "Formula diluluskan oleh R&D LUNAE · rakan ODM") },
    {
      h: tx("Manufactured", "Dikilangkan"),
      d: b.manufactured,
      p: tx(`Batch ${b.no} · ${b.units.toLocaleString()} units · GMP-certified facility`, `Kelompok ${b.no} · ${b.units.toLocaleString()} unit · kemudahan bersijil GMP`),
    },
    { h: tx("Quality control", "Kawalan kualiti"), d: b.qc, p: tx(`Micro, stability & heavy-metal tests · COA #${b.coa}`, `Ujian mikro, kestabilan & logam berat · COA #${b.coa}`) },
    { h: tx("Halal verified", "Halal disahkan"), d: b.halal, p: tx("Certificate JAKIM-xxxx-xxxx (issued at launch)", "Sijil JAKIM-xxxx-xxxx (dikeluarkan semasa pelancaran)") },
    { h: tx("Released", "Dilepaskan"), d: b.released, p: tx("NPRA notification NOT27xxxxxxK · released to 3PL", "Notifikasi NPRA NOT27xxxxxxK · dilepaskan ke 3PL") },
  ];
  return (
    <div className="container-lux py-12 lg:py-16">
      <p className="bg-tint-blush text-ink-2 rounded-full px-4 py-2 text-center text-[12.5px]">
        {T(
          tx(
            "Sample batch for the pre-launch preview — real batch data appears here from the first production run.",
            "Kelompok contoh untuk pratonton pra-pelancaran — data kelompok sebenar dipaparkan di sini dari pengeluaran pertama.",
          ),
        )}
      </p>
      <div className="mt-10 grid gap-12 lg:grid-cols-2">
        <div>
          <p className="eyebrow text-sage flex items-center gap-2">
            <QrCode className="h-4 w-4" /> {T(tx("Scanned from your box", "Diimbas dari kotak anda"))}
          </p>
          <h1 className="display-l mt-4">
            {T(tx("Know exactly", "Tahu dengan tepat"))}
            <br />
            <em className="italic">{T(tx("what you're wearing.", "apa yang anda pakai."))}</em>
          </h1>
          <div className="border-line bg-surface mt-8 flex gap-5 rounded-[24px] border p-5">
            <span className={`relative h-36 w-28 shrink-0 overflow-hidden rounded-[14px] ${tintBg[p.tint]}`}>
              <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="112px" className="object-contain p-3" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="product-name text-[22px]">{p.name}</p>
              <p className="text-ink-3 text-[14px]">
                {b.shade ? `${T(tx("Shade", "Rona"))} ${b.shade} · ` : ""}
                {p.size}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-y-1 text-[14px]">
                <dt className="text-ink-3">{T(tx("Batch", "Kelompok"))}</dt>
                <dd className="font-semibold">{b.no}</dd>
                <dt className="text-ink-3">{T(tx("Made", "Dibuat"))}</dt>
                <dd className="font-semibold">{dateFmt(b.manufactured, lang)}</dd>
                <dt className="text-ink-3">{T(tx("Best before", "Terbaik sebelum"))}</dt>
                <dd className="font-semibold">{dateFmt(b.expiry, lang, { month: "short", year: "numeric" })}</dd>
                <dt className="text-ink-3">{T(tx("Opened shelf life", "Jangka hayat selepas dibuka"))}</dt>
                <dd className="font-semibold">{f.pao}</dd>
              </dl>
              <p className="text-ink-3 mt-2 text-[12px]">
                {months} {T(tx("months total shelf life", "bulan jumlah jangka hayat"))}
              </p>
            </div>
          </div>
          <div className={`mt-4 flex items-start gap-3 rounded-[18px] p-5 ${b.recall ? "bg-error/10" : "bg-tint-sage"}`}>
            <ShieldCheck className={`h-6 w-6 shrink-0 ${b.recall ? "text-error" : "text-sage"}`} strokeWidth={1.5} />
            <div>
              <p className="font-semibold">
                {b.recall ? T(tx("This batch is under recall", "Kelompok ini sedang ditarik balik")) : T(tx("Genuine LUNAE product · no recalls", "Produk LUNAE tulen · tiada penarikan balik"))}
              </p>
              <p className="text-ink-2 text-[13.5px]">
                {T(tx("Serial verified", "Siri disahkan"))}
                {b.firstScan ? ` · ${T(tx("first scanned", "imbasan pertama"))} ${dateFmt(b.firstScan.at, lang)} ${T(tx("in", "di"))} ${b.firstScan.state}` : ""}
              </p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <span className="btn btn-secondary btn-sm cursor-not-allowed opacity-60" title={T(tx("Available from first production run", "Tersedia dari pengeluaran pertama"))}>
              {T(tx("Download COA (PDF)", "Muat turun COA (PDF)"))}
            </span>
            <Link href={lhref(lang, "/halal")} className="btn btn-secondary btn-sm">
              {T(tx("Halal certificate", "Sijil halal"))}
            </Link>
            <ReactionReport batch={b.no} product={p.name} />
          </div>
        </div>
        <div>
          <p className="eyebrow text-ink-3">{T(tx("Batch journey", "Perjalanan kelompok"))}</p>
          <ol className="before:bg-line relative mt-6 space-y-7 before:absolute before:top-4 before:bottom-4 before:left-[19px] before:w-px">
            {journey.map((j) => (
              <li key={j.h.en} className="relative flex gap-5">
                <span className="bg-sage z-[1] grid h-10 w-10 shrink-0 place-items-center rounded-full text-white">
                  <Check className="h-5 w-5" />
                </span>
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-[17px] font-semibold">{T(j.h)}</p>
                    <p className="text-ink-3 text-[13px]">{dateFmt(j.d, lang)}</p>
                  </div>
                  <p className="text-ink-2 mt-0.5 text-[14.5px]">{T(j.p)}</p>
                </div>
              </li>
            ))}
          </ol>
          <div className="bg-night text-moon mt-10 rounded-[24px] p-6">
            <p className="eyebrow text-glow">{T(tx("Ingredients in this batch", "Ramuan dalam kelompok ini"))}</p>
            <p className="text-halo mt-3 text-[14.5px] leading-relaxed">{f.ingredients.map((i) => i.inci).join(", ")}.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="badge bg-veil text-glow">Halal</span>
              {f.freeFrom.slice(0, 3).map((x) => (
                <span key={x} className="badge bg-veil text-halo">
                  {x}-free
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
