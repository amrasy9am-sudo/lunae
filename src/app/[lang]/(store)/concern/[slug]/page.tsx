import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { concerns, products, tintBg } from "@/data/catalogue";
import { Breadcrumbs, JsonLd } from "@/components/page-bits";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return concerns.map((c) => ({ slug: c.key }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/concern/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const c = concerns.find((x) => x.key === slug);
  if (!c) return {};
  return { title: pick(lang as Locale, c.name), description: pick(lang as Locale, c.intro) };
}

const ROUTINES: Record<string, string[]> = {
  "sweat-proof-base": ["daybreak-sun-gel", "eclipse-cushion", "crescent-concealer", "tide-setting-mist"],
  "oil-control": ["new-moon-gentle-cleanser", "full-moon-glow-serum", "nocturne-water-gel", "stardust-loose-powder"],
  "transfer-proof-colour": ["nightbloom-lip-cheek-tint", "selene-matte-lipstick", "tide-setting-mist"],
  "smudge-proof-eyes": ["arc-brow-gel", "midnight-waterproof-liner", "starlash-lift-mascara"],
  "barrier-glow": ["new-moon-gentle-cleanser", "full-moon-glow-serum", "nocturne-water-gel", "moonglow-liquid-highlighter"],
  "daily-spf": ["full-moon-glow-serum", "daybreak-sun-gel", "moonbeam-skin-tint"],
};

export default async function ConcernPage({ params }: PageProps<"/[lang]/concern/[slug]">) {
  const { lang: l, slug } = await params;
  const lang = l as Locale;
  const c = concerns.find((x) => x.key === slug);
  if (!c) notFound();
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const ps = products.filter((p) => p.concerns.includes(c.key));
  const steps = ROUTINES[c.key].map((s) => products.find((p) => p.slug === s)!);
  return (
    <>
      <JsonLd
        data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: c.faq.map((f) => ({ "@type": "Question", name: T(f.q), acceptedAnswer: { "@type": "Answer", text: T(f.a) } })) }}
      />
      <section className={`${tintBg[c.tint as keyof typeof tintBg]}`}>
        <div className="container-lux grid items-center gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:py-16">
          <div>
            <Breadcrumbs lang={lang} items={[{ href: "/shop", label: T(tx("Shop", "Kedai")) }, { label: T(c.name) }]} />
            <h1 className="display-xl mt-6 !text-[clamp(3rem,6vw,5rem)]">{T(c.name)}</h1>
            <p className="text-ink-2 mt-5 max-w-xl text-[17px] leading-relaxed">{T(c.intro)}</p>
          </div>
          <div className="bg-surface/60 relative mx-auto aspect-square w-full max-w-[380px] rounded-full">
            <Image src={c.image.replace("/products/", "/cutouts/")} alt="" fill sizes="380px" className="object-contain p-[22%] drop-shadow-[0_24px_24px_rgba(42,26,22,0.2)]" priority />
          </div>
        </div>
      </section>

      <section className="container-lux py-16">
        <p className="eyebrow text-ink-3">{T(tx("Suggested routine", "Rutin dicadangkan"))}</p>
        <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((p, i) => (
            <li key={p.slug} className="border-line bg-surface flex items-center gap-4 rounded-[18px] border p-4">
              <span className="font-display text-accent text-[34px] leading-none">{i + 1}</span>
              <span className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="56px" className="object-contain p-1.5" />
              </span>
              <Link href={lhref(lang, `/products/${p.slug}`)} className="min-w-0">
                <span className="product-name block text-[17px]">{p.shortName}</span>
                <span className="text-ink-3 block truncate text-[13px]">{T(p.type)}</span>
              </Link>
            </li>
          ))}
        </ol>
        <Link href={lhref(lang, "/routine")} className="btn btn-accent btn-sm mt-6">
          {T(tx("Customise in Routine Builder", "Ubah suai dalam Pembina Rutin"))}
        </Link>
      </section>

      <section className="container-lux pb-16">
        <h2 className="heading">{T(tx("Products for this concern", "Produk untuk keperluan ini"))}</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
          {ps.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </section>

      <section className="border-line bg-surface border-t">
        <div className="container-lux max-w-3xl py-16">
          <h2 className="heading">{T(tx("Questions, answered", "Soalan, dijawab"))}</h2>
          <dl className="divide-line mt-6 divide-y">
            {c.faq.map((f, i) => (
              <div key={i} className="py-5">
                <dt className="font-serif text-[19px] font-semibold">{T(f.q)}</dt>
                <dd className="text-ink-2 mt-2 text-[15.5px]">{T(f.a)}</dd>
              </div>
            ))}
          </dl>
          <p className="text-ink-3 mt-6 text-[12.5px]">
            {T(tx("Reviewed by the LUNAE regulatory team · cosmetic guidance only, not medical advice.", "Disemak oleh pasukan regulatori LUNAE · panduan kosmetik sahaja, bukan nasihat perubatan."))}
          </p>
        </div>
      </section>
    </>
  );
}
