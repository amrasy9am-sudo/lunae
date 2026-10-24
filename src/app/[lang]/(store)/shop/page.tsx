import { Suspense } from "react";
import type { Metadata } from "next";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/page-bits";
import { PLP } from "@/components/shop/plp";
import { products } from "@/data/catalogue";

export async function generateMetadata({ params }: PageProps<"/[lang]/shop">): Promise<Metadata> {
  const { lang } = await params;
  return {
    title: lang === "ms" ? "Kedai — semua produk" : "Shop all",
    description: lang === "ms" ? "16 produk solekan & penjagaan kulit halal untuk cuaca tropika." : "16 halal makeup & skincare products made for tropical weather.",
  };
}

export default async function ShopPage({ params }: PageProps<"/[lang]/shop">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  return (
    <div className="container-lux py-10 lg:py-14">
      <Breadcrumbs lang={lang} items={[{ label: T(tx("Shop", "Kedai")) }]} />
      <h1 className="display-l mt-6">{T(tx("Shop all", "Semua produk"))}</h1>
      <p className="text-ink-2 mt-3 text-[16px]">
        {T(tx(`Built for our weather — ${products.length} products, 62 shades, all halal.`, `Dicipta untuk cuaca kita — ${products.length} produk, 62 rona, semuanya halal.`))}
      </p>
      <div className="mt-10">
        <Suspense fallback={<div className="skeleton h-[600px]" />}>
          <PLP />
        </Suspense>
      </div>
    </div>
  );
}
