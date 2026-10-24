import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { policies } from "@/data/policies";
import { Breadcrumbs } from "@/components/page-bits";
import { dateFmt } from "@/lib/format";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/policies/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = policies.find((x) => x.slug === slug);
  return p ? { title: pick(lang as Locale, p.title) } : {};
}

export default async function PolicyPage({ params }: PageProps<"/[lang]/policies/[slug]">) {
  const { lang: l, slug } = await params;
  const lang = l as Locale;
  const p = policies.find((x) => x.slug === slug);
  if (!p) notFound();
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  return (
    <div className="container-lux grid gap-12 py-10 lg:grid-cols-[240px_1fr] lg:py-14">
      <aside>
        <p className="eyebrow text-ink-3">{T(tx("Policies", "Polisi"))}</p>
        <ul className="mt-4 space-y-1">
          {policies.map((x) => (
            <li key={x.slug}>
              <Link
                href={lhref(lang, `/policies/${x.slug}`)}
                aria-current={x.slug === slug ? "page" : undefined}
                className={`block rounded-[10px] px-3 py-2 text-[15px] ${x.slug === slug ? "bg-surface-2 font-semibold" : "text-ink-2 hover:bg-surface"}`}
              >
                {T(x.title)}
              </Link>
            </li>
          ))}
        </ul>
      </aside>
      <article className="max-w-3xl">
        <Breadcrumbs lang={lang} items={[{ label: T(tx("Policies", "Polisi")) }, { label: T(p.title) }]} />
        <h1 className="display-l mt-6">{T(p.title)}</h1>
        <p className="text-ink-3 mt-3 text-[13px]">
          {T(tx("Last updated", "Kemas kini terakhir"))} {dateFmt(p.updated, lang)}
        </p>
        {p.sections.map((s, i) => (
          <section key={i} className="mt-10">
            <h2 className="font-serif text-[22px] font-semibold">{T(s.h)}</h2>
            {s.p.map((x, j) => (
              <p key={j} className="text-ink-2 mt-3 text-[16.5px] leading-[1.75]">
                {T(x)}
              </p>
            ))}
          </section>
        ))}
      </article>
    </div>
  );
}
