import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { articleBySlug, articles } from "@/data/journal";
import { productBySlug } from "@/data/catalogue";
import { Breadcrumbs, JsonLd } from "@/components/page-bits";
import { ProductCard } from "@/components/product-card";
import { dateFmt } from "@/lib/format";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/journal/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const a = articleBySlug(slug);
  if (!a) return {};
  return { title: pick(lang as Locale, a.title), description: pick(lang as Locale, a.dek), openGraph: { images: [a.image], type: "article" } };
}

export default async function ArticlePage({ params }: PageProps<"/[lang]/journal/[slug]">) {
  const { lang: l, slug } = await params;
  const lang = l as Locale;
  const a = articleBySlug(slug);
  if (!a) notFound();
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  return (
    <article>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: T(a.title),
          image: `${SITE_URL}${a.image}`,
          author: { "@type": "Organization", name: a.author },
          dateModified: a.reviewed,
          publisher: { "@type": "Organization", name: "LUNAE" },
        }}
      />
      <div className="container-lux max-w-3xl py-10">
        <Breadcrumbs lang={lang} items={[{ href: "/journal", label: T(tx("Journal", "Jurnal")) }, { label: T(a.title) }]} />
        <p className="eyebrow text-accent-deep mt-8">
          {T(a.kind)} · {a.minutes} min
        </p>
        <h1 className="display-l mt-4">{T(a.title)}</h1>
        <p className="text-ink-2 mt-4 text-[19px]">{T(a.dek)}</p>
        <p className="text-ink-3 mt-6 text-[13px]">
          {a.author} · {T(tx("Reviewed", "Disemak"))} {dateFmt(a.reviewed, lang)}
        </p>
      </div>
      <div className="container-lux">
        <div className="relative mx-auto aspect-[16/8] max-w-5xl overflow-hidden rounded-[24px]">
          <Image src={a.image} alt="" fill priority sizes="(min-width:1024px) 1000px, 100vw" className="object-cover" />
        </div>
      </div>
      <div className="container-lux max-w-3xl py-12">
        {a.body.map((b, i) => (
          <section key={i} className="mt-8 first:mt-0">
            {b.h && <h2 className="font-serif text-[24px] font-semibold">{T(b.h)}</h2>}
            <p className="text-ink-2 mt-3 text-[17px] leading-[1.75]">{T(b.p)}</p>
          </section>
        ))}
      </div>
      <section className="border-line bg-surface border-t">
        <div className="container-lux py-14">
          <h2 className="heading">{T(tx("Shop the story", "Beli dari cerita ini"))}</h2>
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
            {a.products.map((s) => {
              const p = productBySlug(s);
              return p ? <ProductCard key={s} p={p} /> : null;
            })}
          </div>
        </div>
      </section>
    </article>
  );
}
