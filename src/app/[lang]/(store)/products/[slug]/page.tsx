import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageCircleQuestion, Star } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { categories, concerns, productBySlug, products } from "@/data/catalogue";
import { formulas } from "@/data/formulas";
import { Breadcrumbs, JsonLd } from "@/components/page-bits";
import { Gallery } from "@/components/pdp/gallery";
import { BuyBox } from "@/components/pdp/buy-box";
import { PdpAccordions } from "@/components/pdp/details";
import { SweatSlider } from "@/components/sweat-slider";
import { CompleteRoutine } from "@/components/pdp/routine-upsell";
import { SITE_URL } from "@/lib/site";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/products/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = productBySlug(slug);
  if (!p) return {};
  return {
    title: p.name,
    description: pick(lang as Locale, p.tagline),
    openGraph: { images: [`/img/products/${p.slug}.webp`] },
    alternates: { languages: { en: `/en/products/${slug}`, ms: `/ms/products/${slug}` } },
  };
}

const ROUTINE: Record<string, string[]> = {
  face: ["daybreak-sun-gel", "crescent-concealer", "tide-setting-mist"],
  "lips-cheeks": ["eclipse-cushion", "moonglow-liquid-highlighter", "tide-setting-mist"],
  eyes: ["arc-brow-gel", "starlash-lift-mascara", "midnight-waterproof-liner"],
  skincare: ["new-moon-gentle-cleanser", "full-moon-glow-serum", "daybreak-sun-gel"],
};

export default async function ProductPage({ params }: PageProps<"/[lang]/products/[slug]">) {
  const { lang: l, slug } = await params;
  const lang = l as Locale;
  const p = productBySlug(slug);
  if (!p) notFound();
  const f = formulas[p.slug];
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const cat = categories.find((c) => c.key === p.category)!;
  const routine = ROUTINE[p.category].filter((s) => s !== p.slug).slice(0, 3);
  const related = products.filter((x) => x.slug !== p.slug && x.concerns.some((c) => p.concerns.includes(c))).slice(0, 4);
  const qa = concerns
    .filter((c) => p.concerns.includes(c.key))
    .flatMap((c) => c.faq)
    .slice(0, 3);

  const ld = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    image: [`${SITE_URL}/img/products/${p.slug}.webp`],
    description: pick(lang, p.description),
    brand: { "@type": "Brand", name: "LUNAE" },
    sku: `LN-${p.slug.toUpperCase().slice(0, 10)}`,
    category: pick(lang, cat.name),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: "MYR",
      lowPrice: p.price,
      highPrice: p.price,
      offerCount: Math.max(1, p.shades.length),
      availability: "https://schema.org/PreOrder",
      url: `${SITE_URL}${lhref(lang, `/products/${p.slug}`)}`,
    },
  };

  return (
    <>
      <JsonLd data={ld} />
      <div className="container-lux py-8 lg:py-10">
        <Breadcrumbs lang={lang} items={[{ href: `/shop/${p.category}`, label: T(cat.name) }, { label: p.name }]} />
        <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Gallery p={p} />
          </div>
          <div>
            <BuyBox p={p} />
            <div className="bg-surface text-ink-2 mt-8 rounded-[16px] p-5 text-[15px] leading-relaxed">{T(p.description)}</div>
            <PdpAccordions p={p} f={f} />
          </div>
        </div>
      </div>

      {/* Sweat-Test Lab */}
      <section className="starfield bg-night text-moon mt-16">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="eyebrow text-glow">Sweat-Test Lab</p>
            <h2 className="display-l mt-4">
              {T(tx("Hour 0 vs hour 8.", "Jam 0 lawan jam 8."))}
              <br />
              <em className="italic">{T(tx("Drag to compare.", "Seret untuk banding."))}</em>
            </h2>
            <p className="text-halo mt-5 max-w-md text-[16px]">
              {T(
                tx(
                  "Climate chamber 33°C · 80% RH · 20 panellists · independent lab report published before launch.",
                  "Kebuk iklim 33°C · 80% RH · 20 panel · laporan makmal bebas diterbitkan sebelum pelancaran.",
                ),
              )}
            </p>
            <dl className="mt-8 grid max-w-md grid-cols-3 gap-4">
              {[
                ["≥90%", tx("coverage retained", "liputan kekal")],
                ["0", tx("transfer to tudung", "pindah ke tudung")],
                ["−40%", tx("shine vs hour 0", "kilat vs jam 0")],
              ].map(([n, d]) => (
                <div key={n as string}>
                  <dt className="font-display text-glow text-[40px] leading-none">{n as string}</dt>
                  <dd className="text-halo mt-1 text-[12.5px]">{T(d as { en: string; ms: string })}</dd>
                </div>
              ))}
            </dl>
            <p className="text-halo/70 mt-3 text-[12px]">
              {T(
                tx(
                  "Pass thresholds the formula must meet — final results replace these once testing is complete.",
                  "Ambang lulus yang mesti dicapai formula — keputusan sebenar akan menggantikan ini selepas ujian.",
                ),
              )}
            </p>
            <Link href={lhref(lang, "/lab")} className="btn btn-sm border-mist text-moon hover:border-moon mt-6 border">
              {T(tx("Inside the lab", "Di dalam makmal"))}
            </Link>
          </div>
          <SweatSlider />
        </div>
      </section>

      {/* Complete the routine */}
      <section className="container-lux py-20">
        <p className="eyebrow text-ink-3">{T(tx("Complete the routine", "Lengkapkan rutin"))}</p>
        <h2 className="heading mt-3">{T(tx("Better together", "Lebih baik bersama"))}</h2>
        <div className="mt-8">
          <CompleteRoutine p={p} slugs={routine} />
        </div>
      </section>

      {/* Reviews & Q&A */}
      <section className="border-line bg-surface border-t">
        <div className="container-lux grid gap-12 py-20 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-ink-3">{T(tx("Reviews", "Ulasan"))}</p>
            <h2 className="heading mt-3">{T(tx("Real reviews, from verified buyers", "Ulasan sebenar, daripada pembeli disahkan"))}</h2>
            <div className="border-line mt-6 rounded-[20px] border border-dashed p-8 text-center">
              <div className="text-line flex justify-center gap-1" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="h-6 w-6" strokeWidth={1.2} />
                ))}
              </div>
              <p className="mt-4 font-serif text-[18px]">{T(tx("No reviews yet", "Belum ada ulasan"))}</p>
              <p className="text-ink-2 mx-auto mt-2 max-w-sm text-[14px]">
                {T(
                  tx(
                    "Reviews open at launch and only verified buyers can post — filterable by skin type, undertone and climate. We never pay for or write reviews.",
                    "Ulasan dibuka semasa pelancaran dan hanya pembeli disahkan boleh menulis — boleh ditapis ikut jenis kulit, undertone dan iklim. Kami tidak membayar atau menulis ulasan.",
                  ),
                )}
              </p>
            </div>
          </div>
          <div>
            <p className="eyebrow text-ink-3">Q&amp;A</p>
            <h2 className="heading mt-3">{T(tx("Answered by the LUNAE team", "Dijawab oleh pasukan LUNAE"))}</h2>
            <ul className="mt-6 space-y-4">
              {qa.map((x, i) => (
                <li key={i} className="border-line bg-bg rounded-[16px] border p-5">
                  <p className="flex items-start gap-2 font-semibold">
                    <MessageCircleQuestion className="text-accent-deep mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} /> {T(x.q)}
                  </p>
                  <p className="text-ink-2 mt-2 pl-7 text-[15px]">{T(x.a)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="container-lux py-20">
          <h2 className="heading">{T(tx("You may also like", "Anda mungkin suka"))}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {related.map((x) => (
              <ProductCard key={x.slug} p={x} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
