import type { Metadata } from "next";
import { Radio, MessageSquare, BarChart3, Pin } from "lucide-react";
import type { Locale } from "@/lib/types";
import { pick, tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-bits";
import { DropCountdown } from "@/components/home/moon-widgets";

export const metadata: Metadata = { title: "Live & video" };

export default async function LivePage({ params }: PageProps<"/[lang]/live">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const feats = [
    {
      i: Radio,
      h: tx("Livestreams on our own site", "Siaran langsung di laman kami"),
      p: tx("No platform commission — and your data stays with LUNAE.", "Tiada komisen platform — dan data anda kekal bersama LUNAE."),
    },
    {
      i: Pin,
      h: tx("Pinned products, live prices", "Produk dipin, harga langsung"),
      p: tx("Buy without leaving the stream; live prices end with the show.", "Beli tanpa keluar dari siaran; harga langsung tamat bersama rancangan."),
    },
    { i: BarChart3, h: tx("Shade polls", "Undian rona"), p: tx("Vote on the next shade to swatch on real skin.", "Undi rona seterusnya untuk dicalit pada kulit sebenar.") },
    { i: MessageSquare, h: tx("Moderated chat", "Sembang dimoderasi"), p: tx("Automatic + human moderation, BM & EN.", "Moderasi automatik + manusia, BM & EN.") },
  ];
  return (
    <>
      <PageHeader
        dark
        eyebrow="LUNAE Live"
        title={T(tx("Live shopping, coming after launch.", "Beli-belah langsung, selepas pelancaran."))}
        intro={T(
          tx(
            "Night-out glam, sweat tests filmed in real time and ingredient Q&As with our R&D team — streamed here first. Shoppable replays stay on product pages.",
            "Glam malam, ujian peluh dirakam secara langsung dan sesi soal jawab ramuan bersama pasukan R&D — disiarkan di sini dahulu. Ulang tayang yang boleh dibeli kekal di halaman produk.",
          ),
        )}
      >
        <div className="border-mist bg-dusk/70 mt-10 max-w-md rounded-[24px] border p-7">
          <DropCountdown />
          <p className="text-halo mt-4 text-[13px]">{T(tx("Our first livestreams open alongside Full Moon Drops.", "Siaran langsung pertama dibuka bersama Full Moon Drops."))}</p>
        </div>
      </PageHeader>
      <section className="container-lux grid gap-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
        {feats.map(({ i: Icon, h, p }) => (
          <div key={h.en} className="border-line bg-surface rounded-[20px] border p-6">
            <Icon className="text-accent-deep h-6 w-6" strokeWidth={1.5} />
            <p className="mt-4 font-serif text-[19px] font-semibold">{T(h)}</p>
            <p className="text-ink-2 mt-1.5 text-[14.5px]">{T(p)}</p>
          </div>
        ))}
      </section>
    </>
  );
}
