import Link from "next/link";
import { BadgePercent, FileText, Link2, Package, Wallet, Images } from "lucide-react";
import type { Locale } from "@/lib/types";
import { lhref, pick, tx } from "@/lib/i18n";
import { partners } from "@/data/admin-demo";

export default async function PartnersHome({ params }: PageProps<"/[lang]/partners">) {
  const { lang: l } = await params;
  const lang = l as Locale;
  const T = (v: { en: string; ms: string }) => pick(lang, v);
  const programmes = [
    {
      h: tx("Stockists", "Stokis"),
      p: tx(
        "Buy wholesale at 60% of RRP with an enforced minimum retail price. Tier bonuses, credit terms and quick reorder.",
        "Beli borong pada 60% harga runcit dengan harga runcit minimum dikuatkuasa. Bonus tahap, terma kredit dan pesanan semula pantas.",
      ),
      k: tx("Opening Year 2 · 20–40 partners", "Dibuka Tahun 2 · 20–40 rakan"),
    },
    {
      h: tx("Affiliates", "Afiliasi"),
      p: tx(
        "10% commission through your personal link or code, tracked automatically. Monthly statements, DuitNow payouts.",
        "Komisen 10% melalui pautan atau kod peribadi, dijejak automatik. Penyata bulanan, bayaran DuitNow.",
      ),
      k: tx("Opens at launch", "Dibuka semasa pelancaran"),
    },
    {
      h: tx("Creators & ambassadors", "Pencipta & duta"),
      p: tx(
        "Micro creators earn product + 12–15% commission; customer ambassadors earn Lunae points and early products.",
        "Pencipta mikro dapat produk + komisen 12–15%; duta pelanggan dapat mata Lunae dan produk awal.",
      ),
      k: tx("Seeding 150 creators pre-launch", "Penyemaian 150 pencipta pra-pelancaran"),
    },
  ];
  const tools = [
    { i: BadgePercent, h: tx("Dashboard", "Papan pemuka"), p: tx("Sales, commission, tier & ranking", "Jualan, komisen, tahap & kedudukan") },
    { i: Package, h: tx("B2B ordering", "Pesanan B2B"), p: tx("Tier pricing, MOQ, credit, invoices", "Harga tahap, MOQ, kredit, invois") },
    { i: Link2, h: tx("Links & codes", "Pautan & kod"), p: tx("Affiliate links and discount codes", "Pautan afiliasi dan kod diskaun") },
    { i: Images, h: tx("Asset bank", "Bank aset"), p: tx("Photos, videos & approved claim-safe scripts", "Foto, video & skrip selamat dakwaan") },
    { i: Wallet, h: tx("Payouts", "Bayaran"), p: tx("Monthly statements, return holdback, DuitNow", "Penyata bulanan, tahanan pemulangan, DuitNow") },
    { i: FileText, h: tx("e-Agreement", "Perjanjian-e"), p: tx("KYC with SSM/ID and e-signed terms", "KYC dengan SSM/ID dan terma ditandatangani-e") },
  ];
  return (
    <>
      <section className="starfield bg-night text-moon">
        <div className="container-lux py-20 lg:py-24">
          <p className="eyebrow text-glow">{T(tx("Ambassador & stockist portal", "Portal duta & stokis"))}</p>
          <h1 className="display-xl mt-5 max-w-4xl">{T(tx("Grow with the brand built for our weather.", "Berkembang bersama jenama untuk cuaca kita."))}</h1>
          <p className="text-halo mt-6 max-w-2xl text-[17px]">
            {T(
              tx(
                "Clear margins, consistent stock, ready-made content and commissions that are calculated automatically — never late.",
                "Margin jelas, stok konsisten, kandungan sedia ada dan komisen dikira automatik — tidak pernah lewat.",
              ),
            )}
          </p>
          <Link href={lhref(lang, "/partners/join")} className="btn bg-moon text-cocoa-ink mt-8">
            {T(tx("Apply to partner", "Mohon jadi rakan"))}
          </Link>
        </div>
      </section>
      <section className="container-lux grid gap-6 py-16 md:grid-cols-3">
        {programmes.map((p) => (
          <div key={p.h.en} className="border-line bg-surface rounded-[24px] border p-7">
            <p className="font-display text-[34px] leading-none">{T(p.h)}</p>
            <p className="text-ink-2 mt-4 text-[15.5px]">{T(p.p)}</p>
            <p className="eyebrow text-accent-deep mt-6">{T(p.k)}</p>
          </div>
        ))}
      </section>
      <section className="bg-surface-2">
        <div className="container-lux py-16">
          <h2 className="heading">{T(tx("Inside the portal", "Di dalam portal"))}</h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map(({ i: Icon, h, p }) => (
              <li key={h.en} className="bg-surface flex gap-4 rounded-[18px] p-5">
                <Icon className="text-accent-deep h-6 w-6 shrink-0" strokeWidth={1.5} />
                <span>
                  <span className="block font-semibold">{T(h)}</span>
                  <span className="text-ink-2 block text-[14px]">{T(p)}</span>
                </span>
              </li>
            ))}
          </ul>
          <div className="border-line bg-surface mt-10 overflow-x-auto rounded-[20px] border">
            <p className="border-line text-ink-3 border-b px-5 py-3 text-[13px]">{T(tx("Dashboard preview · sample partners", "Pratonton papan pemuka · rakan contoh"))}</p>
            <table className="w-full min-w-[640px] text-left text-[14px]">
              <thead className="text-ink-3 text-[12px] tracking-[0.12em] uppercase">
                <tr>
                  {["Partner", "Type", "Tier", "Sales (MTD)", "Commission", "Status"].map((h) => (
                    <th key={h} className="px-5 py-3 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-line divide-y">
                {partners.map((p) => (
                  <tr key={p.name}>
                    <td className="px-5 py-3 font-medium">{p.name}</td>
                    <td className="px-5 py-3">{p.type}</td>
                    <td className="px-5 py-3">{p.tier}</td>
                    <td className="px-5 py-3">RM{p.sales.toLocaleString()}</td>
                    <td className="px-5 py-3">RM{p.commission.toLocaleString()}</td>
                    <td className="px-5 py-3">{p.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
