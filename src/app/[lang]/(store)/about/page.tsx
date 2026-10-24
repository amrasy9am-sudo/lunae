import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { LogoMark } from "@/components/logo";

export const metadata: Metadata = { title: "Our story" };

export default async function AboutPage({ params }: PageProps<"/[lang]/about">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const values = [
    { h: tx("Honest", "Jujur"), p: tx("Claims backed by testing; full ingredient list on every product page.", "Dakwaan disokong ujian; senarai ramuan penuh di setiap halaman produk.") },
    { h: tx("Modern tropical", "Tropika moden"), p: tx("Proud of local roots, international in look.", "Bangga dengan akar tempatan, berwajah antarabangsa.") },
    { h: tx("Inclusive", "Inklusif"), p: tx("Shades and communication for every ethnicity and skin type.", "Rona dan komunikasi untuk setiap etnik dan jenis kulit.") },
    { h: tx("Caring", "Prihatin"), p: tx("Lightweight formulas, sensitive-skin friendly, refillable packaging.", "Formula ringan, mesra kulit sensitif, pembungkusan boleh diisi semula.") },
  ];
  return (
    <>
      <section className="starfield bg-night text-moon">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-28">
          <div>
            <p className="eyebrow text-glow">{T(tx("Our story", "Kisah kami"))}</p>
            <h1 className="display-xl mt-5">
              Lunae. <em className="italic">{T(tx("Of the moon.", "Milik bulan."))}</em>
            </h1>
            <p className="text-halo mt-6 max-w-xl text-[18px] leading-relaxed">
              {T(
                tx(
                  "“Lunae” is Latin for “of the moon”. The moon never fades — after a scorching day it keeps glowing all night. That's our promise: a glow that stays from the hot morning into the night. Pronounced LOO-nay.",
                  "“Lunae” bermaksud “milik bulan” dalam bahasa Latin. Bulan tidak pernah pudar — selepas hari yang terik ia terus bercahaya sepanjang malam. Itulah janji kami: seri yang kekal dari pagi yang panas hingga ke malam. Disebut LUU-nei.",
                ),
              )}
            </p>
          </div>
          <div className="border-mist mx-auto grid aspect-square w-full max-w-[360px] place-items-center rounded-full border">
            <LogoMark className="text-moon h-2/3 w-2/3" />
          </div>
        </div>
      </section>
      <section className="container-lux grid gap-12 py-20 lg:grid-cols-2">
        <div>
          <h2 className="heading">{T(tx("Why we exist", "Kenapa kami wujud"))}</h2>
          <p className="text-ink-2 mt-5 text-[17px] leading-relaxed">
            {T(
              tx(
                "Millions of women in Southeast Asia share the same everyday problem: makeup that melts, turns oily and changes colour before midday. Imported formulas are rarely made for our heat and humidity, many shade ranges don't reflect warm, olive and deep-tan undertones, and Muslim consumers want certainty about ingredients without giving up performance or modern design.",
                "Jutaan wanita di Asia Tenggara berkongsi masalah harian yang sama: solekan yang cair, berminyak dan berubah warna sebelum tengah hari. Formula import jarang dibuat untuk panas dan kelembapan kita, banyak julat rona tidak mewakili undertone hangat, zaitun dan sawo matang, dan pengguna Muslim mahukan kepastian ramuan tanpa mengorbankan prestasi atau reka bentuk moden.",
              ),
            )}
          </p>
          <p className="text-ink-2 mt-4 text-[17px] leading-relaxed">
            {T(
              tx(
                "LUNAE was founded in Malaysia by Mohamad Amirul Asyraf to be the first halal makeup brand designed for tropical weather — with local botanicals like pegaga and tamanu, shades matched by AI to our skin, and a world-class digital experience.",
                "LUNAE diasaskan di Malaysia oleh Mohamad Amirul Asyraf untuk menjadi jenama solekan halal pertama yang direka untuk cuaca tropika — dengan botani tempatan seperti pegaga dan tamanu, rona yang dipadankan AI untuk kulit kita, dan pengalaman digital bertaraf dunia.",
              ),
            )}
          </p>
        </div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
          <Image src="/img/collections/semua-16-produk.webp" alt={T(tx("The LUNAE 16-product portfolio", "Portfolio 16 produk LUNAE"))} fill sizes="50vw" className="object-cover" />
        </div>
      </section>
      <section className="bg-surface-2">
        <div className="container-lux grid gap-6 py-20 md:grid-cols-3">
          {[
            {
              h: tx("Mission", "Misi"),
              p: tx(
                "To create halal makeup and skincare that stays beautiful in our weather, with shades for every Southeast Asian skin tone.",
                "Mencipta solekan dan penjagaan kulit halal yang kekal cantik dalam cuaca kita, dengan rona untuk setiap tona kulit Asia Tenggara.",
              ),
            },
            {
              h: tx("Vision 2030", "Visi 2030"),
              p: tx("To be Southeast Asia's leading tropical halal beauty brand, present in 5 countries.", "Menjadi jenama kecantikan halal tropika terkemuka di Asia Tenggara, hadir di 5 negara."),
            },
            {
              h: tx("Brand promise", "Janji jenama"),
              p: tx(
                "Every product is tested in real heat & humidity before launch — if it doesn't pass, it isn't sold.",
                "Setiap produk diuji dalam panas & kelembapan sebenar sebelum dilancar — jika tidak lulus, ia tidak dijual.",
              ),
            },
          ].map((x) => (
            <div key={x.h.en} className="bg-surface rounded-[20px] p-7">
              <p className="eyebrow text-accent-deep">{T(x.h)}</p>
              <p className="mt-4 font-serif text-[20px] leading-snug">{T(x.p)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container-lux py-20">
        <h2 className="heading">{T(tx("What we stand for", "Pegangan kami"))}</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v) => (
            <div key={v.h.en} className="border-ink border-t pt-5">
              <p className="font-serif text-[22px] font-semibold">{T(v.h)}</p>
              <p className="text-ink-2 mt-2">{T(v.p)}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex flex-wrap gap-3">
          <Link href={lhref(lang, "/halal")} className="btn btn-primary">
            {T(tx("Our halal promise", "Janji halal kami"))}
          </Link>
          <Link href={lhref(lang, "/lab")} className="btn btn-secondary">
            Sweat-Test Lab
          </Link>
        </div>
      </section>
    </>
  );
}
