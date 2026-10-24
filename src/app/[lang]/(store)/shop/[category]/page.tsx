import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { CategoryKey, Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/page-bits";
import { PLP } from "@/components/shop/plp";
import { categories, products } from "@/data/catalogue";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.key }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/shop/[category]">): Promise<Metadata> {
  const { lang, category } = await params;
  const c = categories.find((x) => x.key === category);
  if (!c) return {};
  return { title: pick(lang as Locale, c.name), description: pick(lang as Locale, c.blurb) };
}

export default async function CategoryPage({ params }: PageProps<"/[lang]/shop/[category]">) {
  const { lang: l, category } = await params;
  const lang = l as Locale;
  const c = categories.find((x) => x.key === category);
  if (!c) notFound();
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const ps = products.filter((p) => p.category === c.key);
  const shades = ps.reduce((a, p) => a + Math.max(1, p.shades.length), 0);
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs lang={lang} items={[{ href: "/shop", label: T(tx("Shop", "Kedai")) }, { label: T(c.name) }]} />
      <h1 className="display-xl mt-6 !text-[clamp(3rem,6vw,5rem)]">{T(c.name)}</h1>
      <p className="text-ink-2 mt-3 text-[16px]">
        {T(c.blurb)} {T(tx(`${ps.length} products, ${shades} shades & variants.`, `${ps.length} produk, ${shades} rona & varian.`))}
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="skeleton h-[600px]" />}>
          <PLP category={c.key as CategoryKey} />
        </Suspense>
      </div>
    </div>
  );
}
