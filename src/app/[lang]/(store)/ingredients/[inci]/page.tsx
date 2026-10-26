import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { glossary } from "@/data/formulas";
import { productBySlug } from "@/data/catalogue";
import { Breadcrumbs } from "@/components/page-bits";
import { ProductCard } from "@/components/product-card";
import { fnL, halalNote } from "@/lib/ingredients";

export function generateStaticParams() {
  return glossary.map((g) => ({ inci: g.key }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/ingredients/[inci]">): Promise<Metadata> {
  const { inci } = await params;
  const g = glossary.find((x) => x.key === inci);
  return g ? { title: `${g.name} — ingredient`, description: g.fns.join(", ") } : {};
}

export default async function IngredientPage({ params }: PageProps<"/[lang]/ingredients/[inci]">) {
  const { lang: l, inci } = await params;
  const lang = l as Locale;
  const g = glossary.find((x) => x.key === inci);
  if (!g) notFound();
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const h = halalNote(g.key);
  const uses = g.products.map((s) => ({ p: productBySlug(s)! }));
  return (
    <div className="container-lux py-10">
      <Breadcrumbs lang={lang} items={[{ href: "/ingredients", label: T(tx("Ingredients", "Ramuan")) }, { label: g.name }]} />
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <p className="eyebrow text-accent-deep">INCI</p>
          <h1 className="display-l mt-3">{g.name}</h1>
          <dl className="divide-line border-line mt-8 divide-y border-y">
            <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
              <dt className="text-ink-3">{T(tx("Function", "Fungsi"))}</dt>
              <dd>{g.fns.map((f) => T(fnL(f))).join(" · ")}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
              <dt className="text-ink-3">{T(tx("Halal status", "Status halal"))}</dt>
              <dd className={h.tone === "ok" ? "text-sage" : "text-warning"}>● {T(h.status)}</dd>
            </div>
            <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
              <dt className="text-ink-3">{T(tx("Used in", "Digunakan dalam"))}</dt>
              <dd>
                <ul className="space-y-1">
                  {uses.map(({ p }) => (
                    <li key={p.slug}>{p.name}</li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>
          <p className="text-ink-3 mt-4 text-[12.5px]">
            {T(
              tx(
                "Ingredient lists from LUNAE formulation briefs. Every ingredient is checked against the ASEAN Cosmetic Directive annexes and verified for halal source.",
                "Senarai ramuan daripada ringkasan formulasi LUNAE. Setiap ramuan disemak berdasarkan lampiran Arahan Kosmetik ASEAN dan disahkan sumber halalnya.",
              ),
            )}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 self-start">
          {uses.slice(0, 4).map(({ p }) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
