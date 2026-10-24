import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { articles } from "@/data/journal";
import { PageHeader } from "@/components/page-bits";

export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage({ params }: PageProps<"/[lang]/journal">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const [lead, ...rest] = articles;
  return (
    <>
      <PageHeader
        eyebrow={T(tx("The Journal", "Jurnal"))}
        title={T(tx("Made for the tropics", "Dicipta untuk tropika"))}
        intro={T(tx("Tutorials, ingredient science and proof — never fear-mongering.", "Tutorial, sains ramuan dan bukti — tanpa menakut-nakutkan."))}
      />
      <section className="container-lux py-14">
        <Link href={lhref(lang, `/journal/${lead.slug}`)} className="group grid items-center gap-8 lg:grid-cols-[1.4fr_1fr]">
          <span className="relative block aspect-[16/10] overflow-hidden rounded-[24px]">
            <Image src={lead.image} alt="" fill sizes="(min-width:1024px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" priority />
          </span>
          <span>
            <span className="eyebrow text-ink-3">
              {T(lead.kind)} · {lead.minutes} min
            </span>
            <span className="heading group-hover:text-accent-deep mt-3 block">{T(lead.title)}</span>
            <span className="text-ink-2 mt-3 block text-[16px]">{T(lead.dek)}</span>
          </span>
        </Link>
        <div className="mt-16 grid gap-10 md:grid-cols-3">
          {rest.map((a) => (
            <Link key={a.slug} href={lhref(lang, `/journal/${a.slug}`)} className="group block">
              <span className="relative block aspect-[16/10] overflow-hidden rounded-[20px]">
                <Image src={a.image} alt="" fill sizes="(min-width:768px) 30vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </span>
              <span className="eyebrow text-ink-3 mt-5 block">
                {T(a.kind)} · {a.minutes} min
              </span>
              <span className="group-hover:text-accent-deep mt-2 block font-serif text-[22px] leading-snug">{T(a.title)}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
