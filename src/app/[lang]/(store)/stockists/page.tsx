import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Store } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { PageHeader } from "@/components/page-bits";

export const metadata: Metadata = { title: "Stockists" };

const STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
  "W.P. Labuan",
  "W.P. Putrajaya",
];

export default async function StockistsPage({ params }: PageProps<"/[lang]/stockists">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  return (
    <>
      <PageHeader
        eyebrow={T(tx("Stockist locator", "Pencari stokis"))}
        title={T(tx("Find LUNAE near you.", "Cari LUNAE berhampiran anda."))}
        intro={T(
          tx(
            "Our stockist network opens after launch, starting outside the Klang Valley. Until then, shop online with free delivery over RM80 — or apply to become one of our first stockists.",
            "Rangkaian stokis kami dibuka selepas pelancaran, bermula di luar Lembah Klang. Sehingga itu, beli dalam talian dengan penghantaran percuma melebihi RM80 — atau mohon menjadi antara stokis pertama kami.",
          ),
        )}
      />
      <div className="container-lux grid gap-10 py-12 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <p className="eyebrow text-ink-3">{T(tx("By state", "Ikut negeri"))}</p>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {STATES.map((s) => (
              <li key={s} className="border-line bg-surface flex items-center justify-between rounded-[12px] border px-4 py-3 text-[14.5px]">
                <span className="flex items-center gap-2">
                  <MapPin className="text-ink-3 h-4 w-4" strokeWidth={1.5} /> {s}
                </span>
                <span className="text-ink-3 text-[12px]">{T(tx("Opening", "Akan dibuka"))}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="starfield bg-night text-moon flex flex-col justify-between rounded-[28px] p-8 lg:p-12">
          <div>
            <Store className="text-glow h-8 w-8" strokeWidth={1.5} />
            <h2 className="heading mt-6">{T(tx("Become a LUNAE stockist", "Jadi stokis LUNAE"))}</h2>
            <ul className="text-halo mt-6 space-y-3 text-[15.5px]">
              <li>
                • {T(tx("Buy at 60% of retail with an enforced minimum retail price — no price wars", "Beli pada 60% harga runcit dengan harga runcit minimum dikuatkuasa — tiada perang harga"))}
              </li>
              <li>• {T(tx("Partner portal with automatic commissions and monthly statements", "Portal rakan dengan komisen automatik dan penyata bulanan"))}</li>
              <li>• {T(tx("Ready-made photo/video bank and approved, claim-safe scripts", "Bank foto/video sedia ada dan skrip yang diluluskan, selamat dakwaan"))}</li>
              <li>• {T(tx("Tier bonuses and quick reorder with consistent stock", "Bonus tahap dan pesanan semula pantas dengan stok konsisten"))}</li>
            </ul>
          </div>
          <Link href={lhref(lang, "/partners/join")} className="btn bg-moon text-cocoa-ink mt-10 w-fit">
            {T(tx("Apply now", "Mohon sekarang"))}
          </Link>
        </div>
      </div>
    </>
  );
}
