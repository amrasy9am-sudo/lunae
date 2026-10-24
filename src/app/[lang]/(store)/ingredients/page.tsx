import type { Metadata } from "next";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { glossary } from "@/data/formulas";
import { PageHeader } from "@/components/page-bits";
import { fnL, halalNote } from "@/lib/ingredients";

export const metadata: Metadata = { title: "Ingredients glossary" };

export default async function IngredientsPage({ params }: PageProps<"/[lang]/ingredients">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const groups = glossary.reduce<Record<string, typeof glossary>>((acc, g) => {
    const k = g.name[0].toUpperCase().replace(/[^A-Z]/, "#");
    (acc[k] ||= []).push(g);
    return acc;
  }, {});
  return (
    <>
      <PageHeader
        eyebrow={T(tx("Ingredients glossary", "Glosari ramuan"))}
        title={T(tx("Know exactly what you're wearing.", "Tahu dengan tepat apa yang anda pakai."))}
        intro={T(
          tx(
            `Every one of the ${glossary.length} ingredients across our 16 formulas — what it does, where it comes from, and its halal status.`,
            `Setiap satu daripada ${glossary.length} ramuan dalam 16 formula kami — fungsinya, sumbernya, dan status halalnya.`,
          ),
        )}
      />
      <div className="container-lux py-12">
        <nav aria-label="A–Z" className="no-scrollbar bg-bg/95 sticky top-[76px] z-10 -mx-4 flex gap-1 overflow-x-auto px-4 py-3 backdrop-blur">
          {Object.keys(groups).map((k) => (
            <a key={k} href={`#g-${k}`} className="hover:bg-surface-2 grid h-9 min-w-9 place-items-center rounded-full text-[14px] font-semibold">
              {k}
            </a>
          ))}
        </nav>
        {Object.entries(groups).map(([k, items]) => (
          <section key={k} id={`g-${k}`} className="border-line border-t py-8">
            <h2 className="font-display text-[40px] leading-none">{k}</h2>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((g) => {
                const h = halalNote(g.key);
                return (
                  <li key={g.key}>
                    <Link href={lhref(lang, `/ingredients/${g.key}`)} className="border-line bg-surface hover:border-ink block h-full rounded-[16px] border p-4 transition">
                      <span className="font-semibold">{g.name}</span>
                      <span className="text-ink-2 mt-1 block text-[13.5px]">{g.fns.map((f) => T(fnL(f))).join(" · ")}</span>
                      <span className={`mt-2 block text-[12px] ${h.tone === "ok" ? "text-sage" : "text-warning"}`}>● {T(h.status)}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
