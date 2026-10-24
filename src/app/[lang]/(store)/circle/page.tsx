import type { Metadata } from "next";
import Link from "next/link";
import { Cake, Gift, Moon, Users, Star, Sparkles } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { PhaseIcon } from "@/components/home/phase-row";
import { DropCountdown } from "@/components/home/moon-widgets";
import { PointsCalculator } from "@/components/circle-calc";

export const metadata: Metadata = { title: "Lunae Circle" };

export default async function CirclePage({ params }: PageProps<"/[lang]/circle">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const tiers = [
    {
      k: "sabit" as const,
      name: "Sabit",
      tag: tx("Crescent · all members", "Sabit · semua ahli"),
      perks: [
        tx("1 point per RM1", "1 mata setiap RM1"),
        tx("200 welcome points", "200 mata alu-aluan"),
        tx("Birthday reward", "Ganjaran hari jadi"),
        tx("Full Moon Drop waitlist", "Senarai menunggu Full Moon Drop"),
      ],
    },
    {
      k: "separa" as const,
      name: "Separa",
      tag: tx("Half moon · RM300/yr", "Separuh bulan · RM300/thn"),
      perks: [
        tx("1.25× points", "1.25× mata"),
        tx("Free express delivery once a quarter", "Penghantaran ekspres percuma sekali setiap suku tahun"),
        tx("Early access to new shades", "Akses awal rona baharu"),
      ],
    },
    {
      k: "purnama" as const,
      name: "Purnama",
      tag: tx("Full moon · RM800/yr", "Bulan purnama · RM800/thn"),
      perks: [
        tx("1.5× points", "1.5× mata"),
        tx("First hour of every Full Moon Drop", "Jam pertama setiap Full Moon Drop"),
        tx("Annual birthday set", "Set hari jadi tahunan"),
        tx("Invitations to launches & pop-ups", "Jemputan ke pelancaran & pop-up"),
      ],
    },
  ];
  const ways = [
    { i: Star, h: tx("Shop", "Beli"), p: tx("1 point per RM1, multiplied by your phase", "1 mata setiap RM1, didarab mengikut fasa") },
    { i: Moon, h: tx("Full Moon nights", "Malam bulan purnama"), p: tx("2× points on drop nights", "2× mata pada malam drop") },
    { i: Users, h: tx("Refer a friend", "Rujuk rakan"), p: tx("500 points each when they buy", "500 mata setiap seorang bila mereka membeli") },
    { i: Cake, h: tx("Birthday", "Hari jadi"), p: tx("A gift in your birthday month", "Hadiah pada bulan hari jadi") },
    { i: Sparkles, h: tx("Review", "Ulasan"), p: tx("50 points for a verified photo review", "50 mata untuk ulasan bergambar disahkan") },
    { i: Gift, h: tx("Redeem", "Tebus"), p: tx("100 points = RM1 at checkout", "100 mata = RM1 di checkout") },
  ];
  return (
    <>
      <section className="starfield bg-night text-moon">
        <div className="container-lux grid items-center gap-12 py-20 lg:grid-cols-[1.2fr_1fr] lg:py-24">
          <div>
            <p className="eyebrow text-glow">Lunae Circle</p>
            <h1 className="display-xl mt-5">
              {T(tx("Rewards that wax", "Ganjaran yang mengembang"))} <em className="italic">{T(tx("with every glow.", "bersama setiap seri."))}</em>
            </h1>
            <p className="text-halo mt-6 max-w-xl text-[17px]">
              {T(tx("Three moon phases. Points on every ringgit. First access to limited Full Moon Drops.", "Tiga fasa bulan. Mata untuk setiap ringgit. Akses awal ke Full Moon Drops terhad."))}
            </p>
            <Link href={lhref(lang, "/account/login?next=/account/circle")} className="btn bg-moon text-cocoa-ink mt-8">
              {T(tx("Join free · 200 pts", "Sertai percuma · 200 mata"))}
            </Link>
          </div>
          <div className="border-mist bg-dusk/70 rounded-[24px] border p-8">
            <DropCountdown />
          </div>
        </div>
      </section>
      <section className="container-lux py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {tiers.map((tr) => (
            <div key={tr.k} className={`rounded-[24px] p-8 ${tr.k === "purnama" ? "bg-night text-moon" : "border-line bg-surface border"}`}>
              <PhaseIcon phase={tr.k} size={56} />
              <p className={`font-display mt-5 text-[40px] leading-none ${tr.k === "purnama" ? "text-glow" : ""}`}>{tr.name}</p>
              <p className={`mt-2 text-[14px] ${tr.k === "purnama" ? "text-halo" : "text-ink-3"}`}>{T(tr.tag)}</p>
              <ul className="mt-6 space-y-2.5 text-[15px]">
                {tr.perks.map((pk) => (
                  <li key={pk.en}>✓ {T(pk)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
      <section className="bg-surface-2">
        <div className="container-lux grid gap-12 py-20 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <h2 className="heading">{T(tx("Ways to earn & redeem", "Cara kumpul & tebus"))}</h2>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {ways.map(({ i: Icon, h, p }) => (
                <li key={h.en} className="bg-surface flex gap-4 rounded-[18px] p-5">
                  <Icon className="text-accent-deep h-6 w-6 shrink-0" strokeWidth={1.5} />
                  <span>
                    <span className="block font-semibold">{T(h)}</span>
                    <span className="text-ink-2 block text-[14px]">{T(p)}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="text-ink-3 mt-6 text-[13px]">
              {T(
                tx(
                  "Points cover up to 30% of an order and expire after 12 months of inactivity (we remind you 30 days before).",
                  "Mata boleh menampung sehingga 30% pesanan dan luput selepas 12 bulan tidak aktif (kami ingatkan 30 hari sebelum).",
                ),
              )}
            </p>
          </div>
          <PointsCalculator />
        </div>
      </section>
    </>
  );
}
