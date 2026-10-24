"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { Download, KeyRound, MessageCircle, RefreshCw, Trash2, Plus, Laptop, Check } from "lucide-react";
import { useLang, useT } from "../providers";
import { L, Toggle } from "../ui";
import { ProductCard } from "../product-card";
import { PhaseIcon } from "../home/phase-row";
import { DropCountdown } from "../home/moon-widgets";
import { RiderMap, Timeline } from "../order-views";
import { tx } from "@/lib/i18n";
import { dateFmt, rm, rm2 } from "@/lib/format";
import { pointsBalance, useAccount, useCart, useProfile, useUI, useWishlist, type Address } from "@/lib/store";
import { productBySlug, products, tintBg } from "@/data/catalogue";
import { orderStage } from "@/lib/orders";
import { TIERS, tierFor } from "@/lib/pricing";
import { stateFromPostcode } from "@/lib/checkout";
import { WHATSAPP } from "@/lib/site";

/* ---------- Refill Radar model: size × usage rate ---------- */
const USAGE_DAYS: Record<string, number> = {
  base: 60,
  concealer: 120,
  powder: 150,
  setting: 75,
  lips: 90,
  cheeks: 150,
  highlight: 150,
  brows: 120,
  liner: 75,
  mascara: 90,
  cleanse: 60,
  serum: 50,
  moisturise: 60,
  spf: 40,
};
export function useRadar() {
  const orders = useAccount((s) => s.orders);
  const [now] = useState(() => Date.now());
  return useMemo(() => {
    const seen = new Map<string, { slug: string; shade?: string; bought: string; daysLeft: number; total: number }>();
    for (const o of [...orders].reverse()) {
      for (const l of o.lines) {
        const p = productBySlug(l.slug);
        if (!p) continue;
        const total = USAGE_DAYS[p.sub] * l.qty;
        const used = (now - new Date(o.at).getTime()) / 86400_000;
        seen.set(l.slug, { slug: l.slug, shade: l.shade, bought: o.at, total, daysLeft: Math.max(0, Math.round(total - used)) });
      }
    }
    return [...seen.values()].sort((a, b) => a.daysLeft - b.daysLeft);
  }, [orders, now]);
}

function RadarList({ limit }: { limit?: number }) {
  const t = useT();
  const lang = useLang();
  const radar = useRadar();
  const cart = useCart();
  const ui = useUI();
  const acc = useAccount();
  if (!radar.length)
    return (
      <p className="text-ink-2 text-[14.5px]">
        {t(tx("Once you've placed an order, we'll predict when each product runs low.", "Selepas anda membuat pesanan, kami akan meramal bila setiap produk hampir habis."))}
      </p>
    );
  return (
    <ul className="divide-line divide-y">
      {radar.slice(0, limit).map((r) => {
        const p = productBySlug(r.slug)!;
        const pct = r.daysLeft / r.total;
        return (
          <li key={r.slug} className="py-4">
            <div className="flex items-center gap-3">
              <span className={`relative h-12 w-11 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="44px" className="object-contain p-1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="product-name block truncate">{p.name}</span>
                <span className="text-ink-3 text-[12.5px]">
                  {r.shade ? `${r.shade} · ` : ""}
                  {t(tx("bought", "dibeli"))} {dateFmt(r.bought, lang, { day: "numeric", month: "short" })}
                </span>
              </span>
              {pct < 0.25 ? (
                <button className="btn btn-accent btn-sm" onClick={() => (cart.add({ slug: r.slug, shade: r.shade, qty: 1 }), ui.set({ cartOpen: true }))}>
                  {t(tx("Reorder now", "Pesan semula"))}
                </button>
              ) : (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => (acc.setConsent("push", true), ui.notify(t(tx("We'll remind you 7 days before it runs out.", "Kami akan ingatkan 7 hari sebelum habis."))))}
                >
                  {t(tx("Remind me", "Ingatkan"))}
                </button>
              )}
            </div>
            <div className="bg-surface-3 mt-3 h-1.5 overflow-hidden rounded-full">
              <div className={`h-full rounded-full ${pct < 0.25 ? "bg-accent" : "bg-sage"}`} style={{ width: `${Math.max(4, pct * 100)}%` }} />
            </div>
            <p className="text-ink-3 mt-1.5 text-[12px]">
              ~{r.daysLeft} {t(tx("days left · predicted from size & your usage", "hari lagi · diramal daripada saiz & penggunaan anda"))}
            </p>
          </li>
        );
      })}
    </ul>
  );
}

function CircleCard() {
  const t = useT();
  const acc = useAccount();
  const bal = pointsBalance(acc.ledger);
  const spend = acc.orders.reduce((a, o) => a + o.total, 0);
  const tier = tierFor(spend);
  const next = TIERS.find((x) => x.min > spend);
  return (
    <div className="starfield bg-night text-moon rounded-[24px] p-6">
      <div className="flex items-start justify-between">
        <p className="eyebrow text-glow">Lunae Circle</p>
        <PhaseIcon phase={tier.key} size={36} />
      </div>
      <p className="font-display mt-3 text-[40px] leading-none">
        {tier.name} · {bal.toLocaleString()} pts
      </p>
      <div className="bg-mist mt-4 h-1.5 overflow-hidden rounded-full">
        <div className="bg-glow h-full rounded-full" style={{ width: `${next ? Math.min(100, (spend / next.min) * 100) : 100}%` }} />
      </div>
      <p className="text-halo mt-2 text-[13.5px]">
        {next
          ? `${rm(Math.ceil(next.min - spend))} ${t(tx("more this year to reach", "lagi tahun ini untuk mencapai"))} ${next.name} (${next.mult}× ${t(tx("points", "mata"))})`
          : t(tx("You've reached Purnama — the full moon.", "Anda telah mencapai Purnama — bulan penuh."))}
      </p>
    </div>
  );
}

function ShadeProfileCard() {
  const t = useT();
  const profile = useProfile((s) => s.profile);
  return (
    <div className="bg-surface-2 flex flex-col gap-5 rounded-[24px] p-6 sm:flex-row sm:items-center">
      {profile ? (
        <>
          <span className="h-16 w-16 shrink-0 rounded-full" style={{ background: profile.hex }} />
          <div className="flex-1">
            <p className="eyebrow text-accent-deep">{t(tx("Skin & shade profile", "Profil kulit & rona"))}</p>
            <p className="mt-1.5 text-[18px] font-semibold">
              {profile.shade} {profile.code} · {profile.undertone}
              {profile.skinType ? ` · ${profile.skinType}` : ""}
              {profile.concerns?.length ? ` · ${profile.concerns.join(", ")}` : ""}
            </p>
            <p className="text-ink-3 text-[13px]">
              {t(tx("Selfie image deleted after analysis · only colour values are kept · delete anytime", "Imej swafoto dipadam selepas analisis · hanya nilai warna disimpan · padam bila-bila masa"))}
            </p>
          </div>
          <div className="flex gap-2">
            <L href="/shade-finder" className="btn btn-secondary btn-sm">
              {t(tx("Rescan", "Imbas semula"))}
            </L>
            <L href="/account/profile" className="btn btn-primary btn-sm">
              {t(tx("Update", "Kemas kini"))}
            </L>
          </div>
        </>
      ) : (
        <>
          <div className="flex-1">
            <p className="eyebrow text-accent-deep">{t(tx("Skin & shade profile", "Profil kulit & rona"))}</p>
            <p className="mt-1.5 text-[16px]">{t(tx("Find your shade once — every page sorts by your match.", "Cari rona sekali — setiap halaman disusun ikut padanan anda."))}</p>
          </div>
          <L href="/shade-finder" className="btn btn-primary btn-sm">
            {t(tx("Find my shade", "Cari rona saya"))}
          </L>
        </>
      )}
    </div>
  );
}

export function Overview() {
  const t = useT();
  const lang = useLang();
  const orders = useAccount((s) => s.orders);
  const active = orders.find((o) => orderStage(o).idx < 3) ?? orders[0];
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <div className="border-line bg-surface rounded-[24px] border p-6">
          {active ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <p className="text-[20px] font-semibold">
                  {t(tx("Order", "Pesanan"))} #{active.no}
                </p>
                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-[13.5px]">
                  <MessageCircle className="h-4 w-4" /> {t(tx("Track on WhatsApp", "Jejak di WhatsApp"))}
                </a>
              </div>
              <div className="mt-6">
                <Timeline o={active} />
              </div>
              <div className="mt-6">
                <RiderMap progress={Math.min(0.9, orderStage(active).idx * 0.3)} />
              </div>
              <ul className="divide-line mt-5 divide-y text-[14px]">
                {orders.slice(0, 3).map((o) => (
                  <li key={o.no} className="flex items-center justify-between gap-3 py-3">
                    <span>
                      <strong>#{o.no}</strong> · {dateFmt(o.at, lang, { day: "numeric", month: "short" })}
                    </span>
                    <span className="text-ink-3">
                      {o.lines.reduce((a, l) => a + l.qty, 0)} {t(tx("items", "item"))}
                    </span>
                    <span className="badge bg-surface-2 text-accent-deep">{orderStage(o).stage.replace("_", " ")}</span>
                    <strong>{rm2(o.total)}</strong>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="py-10 text-center">
              <p className="font-display text-[28px]">{t(tx("No orders yet.", "Belum ada pesanan."))}</p>
              <L href="/shop" className="btn btn-primary btn-sm mt-5">
                {t(tx("Start shopping", "Mula membeli"))}
              </L>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <CircleCard />
          <div className="border-line bg-surface rounded-[24px] border p-6">
            <div className="flex items-center justify-between">
              <p className="text-[20px] font-semibold">Refill radar</p>
              <span className="badge bg-surface-2 text-accent-deep">{t(tx("Predictive", "Ramalan"))}</span>
            </div>
            <div className="mt-2">
              <RadarList limit={3} />
            </div>
          </div>
        </div>
      </div>
      <ShadeProfileCard />
    </div>
  );
}

export function Orders() {
  const t = useT();
  const lang = useLang();
  const orders = useAccount((s) => s.orders);
  const ui = useUI();
  const [swap, setSwap] = useState<{ no: string; slug: string; step: number; shade?: string; reason?: string } | null>(null);
  const [now] = useState(() => Date.now());
  const cart = useCart();
  if (!orders.length) return <p className="text-ink-2">{t(tx("No orders yet.", "Belum ada pesanan."))}</p>;
  return (
    <div className="space-y-5">
      <h1 className="heading">{t(tx("Orders & returns", "Pesanan & pemulangan"))}</h1>
      {orders.map((o) => {
        const st = orderStage(o);
        const within30 = now - new Date(o.at).getTime() < 30 * 86400_000;
        return (
          <div key={o.no} className="border-line bg-surface rounded-[24px] border p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-[18px] font-semibold">
                #{o.no} · <span className="text-ink-3 font-normal">{dateFmt(o.at, lang)}</span>
              </p>
              <span className="badge bg-surface-2 text-accent-deep">{st.stage}</span>
            </div>
            <ul className="divide-line mt-4 divide-y">
              {o.lines.map((l) => {
                const p = productBySlug(l.slug)!;
                const isBase = p.sub === "base" || p.sub === "concealer";
                return (
                  <li key={l.slug + l.shade} className="flex flex-wrap items-center gap-3 py-3">
                    <span className={`relative h-12 w-11 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                      <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="44px" className="object-contain p-1" />
                    </span>
                    <span className="min-w-0 flex-1 text-[14.5px]">
                      {l.qty} × <strong className="font-serif">{p.name}</strong> {l.shade && <span className="text-ink-3">· {l.shade}</span>}
                    </span>
                    <button className="btn btn-ghost btn-sm" onClick={() => (cart.add({ slug: l.slug, shade: l.shade, qty: 1 }), ui.notify(t(tx("Added to bag", "Dimasukkan ke troli"))))}>
                      {t(tx("Buy again", "Beli lagi"))}
                    </button>
                    {isBase && within30 && st.idx >= 2 && (
                      <button className="btn btn-secondary btn-sm" onClick={() => setSwap({ no: o.no, slug: l.slug, step: 1 })}>
                        <RefreshCw className="h-3.5 w-3.5" /> {t(tx("Shade swap", "Tukar rona"))}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-[14px]">
              <span className="text-ink-3">
                {o.courier} · {t(tx("ETA", "Anggaran"))} {dateFmt(o.eta, lang, { day: "numeric", month: "short" })}
              </span>
              <span className="flex items-center gap-3">
                <span className="text-ink-3">{t(tx("e-Invoice after delivery", "e-Invois selepas penghantaran"))}</span>
                <strong>{rm2(o.total)}</strong>
              </span>
            </div>
            {st.idx < 2 && (
              <p className="text-ink-3 mt-2 text-[12.5px]">
                {t(tx("Shade swap opens once your order is out for delivery (30-day window).", "Tukar rona dibuka selepas pesanan dalam penghantaran (tempoh 30 hari)."))}
              </p>
            )}
          </div>
        );
      })}
      {swap && (
        <div className="fixed inset-0 z-[75] grid place-items-end md:place-items-center" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/40" onClick={() => setSwap(null)} aria-label={t(tx("Close", "Tutup"))} />
          <div className="animate-fade-up bg-bg relative w-full max-w-md rounded-t-[24px] p-6 md:rounded-[24px]">
            <p className="eyebrow text-ink-3">
              {t(tx("Shade-Match Guarantee", "Jaminan Padanan Rona"))} · {swap.step}/3
            </p>
            {swap.step === 1 && (
              <>
                <p className="font-display mt-3 text-[28px]">{t(tx("What's not right?", "Apa yang tak kena?"))}</p>
                <div className="mt-4 grid gap-2">
                  {[tx("Too light", "Terlalu cerah"), tx("Too dark", "Terlalu gelap"), tx("Too pink / cool", "Terlalu merah jambu / sejuk"), tx("Too yellow / warm", "Terlalu kuning / hangat")].map(
                    (r) => (
                      <button key={r.en} className="border-line hover:border-ink rounded-[14px] border p-3 text-left" onClick={() => setSwap({ ...swap, reason: r.en, step: 2 })}>
                        {t(r)}
                      </button>
                    ),
                  )}
                </div>
              </>
            )}
            {swap.step === 2 &&
              (() => {
                const p = productBySlug(swap.slug)!;
                return (
                  <>
                    <p className="font-display mt-3 text-[28px]">{t(tx("Pick your new shade", "Pilih rona baharu"))}</p>
                    <div className="mt-4 flex flex-wrap gap-2.5">
                      {p.shades.map((s) => (
                        <button
                          key={s.name}
                          title={s.name}
                          aria-label={s.name}
                          onClick={() => setSwap({ ...swap, shade: s.name, step: 3 })}
                          className="h-11 w-11 rounded-full border border-black/10"
                          style={{ background: s.hex }}
                        />
                      ))}
                    </div>
                  </>
                );
              })()}
            {swap.step === 3 && (
              <>
                <p className="font-display mt-3 text-[28px]">{t(tx("Confirm swap", "Sahkan pertukaran"))}</p>
                <p className="text-ink-2 mt-2">
                  {t(tx("We'll ship", "Kami akan hantar"))} <strong>{swap.shade}</strong>{" "}
                  {t(
                    tx(
                      "free, with a prepaid return label. Your reason helps retrain the AI Shade Finder.",
                      "secara percuma, bersama label pemulangan prabayar. Sebab anda membantu melatih semula Pencari Rona AI.",
                    ),
                  )}
                </p>
                <button
                  className="btn btn-primary mt-5 w-full"
                  onClick={() => {
                    setSwap(null);
                    ui.notify(t(tx("Swap requested — return label sent to your email (demo).", "Pertukaran dimohon — label pemulangan dihantar ke e-mel (demo).")));
                  }}
                >
                  <Check className="h-4 w-4" /> {t(tx("Request free swap", "Mohon tukar percuma"))}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function Refills() {
  const t = useT();
  return (
    <div className="space-y-6">
      <h1 className="heading">{t(tx("Refills & subscriptions", "Isi semula & langganan"))}</h1>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <p className="text-[20px] font-semibold">Refill radar</p>
        <RadarList />
      </div>
      <div className="bg-tint-sage rounded-[24px] p-6">
        <p className="font-semibold">{t(tx("Subscriptions — opening within 6 months of launch", "Langganan — dibuka dalam 6 bulan selepas pelancaran"))}</p>
        <p className="text-ink-2 mt-1 text-[14.5px]">
          {t(
            tx(
              "Eclipse refills and Tide Mist at the frequency you choose, with tokenised recurring payments and self-service skip, pause or cancel. Reminders 3 days before each charge.",
              "Isi semula Eclipse dan Tide Mist pada kekerapan pilihan anda, dengan bayaran berulang bertoken dan langkau, jeda atau batal sendiri. Peringatan 3 hari sebelum setiap caj.",
            ),
          )}
        </p>
      </div>
    </div>
  );
}

export function ProfilePage() {
  const t = useT();
  const { profile, setProfile } = useProfile();
  const ui = useUI();
  return (
    <div className="space-y-6">
      <h1 className="heading">{t(tx("Skin & shade profile", "Profil kulit & rona"))}</h1>
      <ShadeProfileCard />
      {profile && (
        <div className="border-line bg-surface rounded-[24px] border p-6">
          <p className="font-semibold">{t(tx("Skin type", "Jenis kulit"))}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["oily", "combination", "normal", "dry"] as const).map((s) => (
              <button key={s} className="chip" aria-pressed={profile.skinType === s} onClick={() => setProfile({ ...profile, skinType: s })}>
                {s}
              </button>
            ))}
          </div>
          <button
            className="btn btn-ghost btn-sm text-error mt-6"
            onClick={() => {
              setProfile(null);
              ui.notify(t(tx("Shade profile deleted", "Profil rona dipadam")));
            }}
          >
            <Trash2 className="h-4 w-4" /> {t(tx("Delete my shade profile", "Padam profil rona saya"))}
          </button>
        </div>
      )}
    </div>
  );
}

export function CirclePage() {
  const t = useT();
  const lang = useLang();
  const acc = useAccount();
  const ui = useUI();
  const bal = pointsBalance(acc.ledger);
  const rewards = [
    { pts: 1000, l: tx("RM10 voucher", "Baucar RM10") },
    { pts: 1500, l: tx("Mini Tide Mist", "Tide Mist mini") },
    { pts: 2500, l: tx("Free express delivery ×3", "Penghantaran ekspres percuma ×3") },
  ];
  return (
    <div className="space-y-6">
      <h1 className="heading">Lunae Circle</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        <CircleCard />
        <div className="border-mist bg-night text-moon rounded-[24px] border p-6">
          <DropCountdown />
        </div>
      </div>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <p className="text-[20px] font-semibold">{t(tx("Redeem", "Tebus"))}</p>
        <ul className="divide-line mt-4 divide-y">
          {rewards.map((r) => (
            <li key={r.pts} className="flex items-center justify-between gap-3 py-3">
              <span>{t(r.l)}</span>
              <span className="flex items-center gap-3">
                <strong className="text-gold">{r.pts.toLocaleString()} pts</strong>
                <button
                  className="btn btn-sm btn-primary"
                  disabled={bal < r.pts}
                  onClick={() => {
                    acc.addPoints(-r.pts, `Redeemed: ${r.l.en}`);
                    ui.notify(t(tx("Reward added — use it at checkout.", "Ganjaran ditambah — guna di checkout.")));
                  }}
                >
                  {t(tx("Redeem", "Tebus"))}
                </button>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <p className="text-[20px] font-semibold">{t(tx("Points history", "Sejarah mata"))}</p>
        <ul className="divide-line mt-4 divide-y text-[14.5px]">
          {acc.ledger.map((l, i) => (
            <li key={i} className="flex justify-between gap-3 py-2.5">
              <span>
                {l.reason} <span className="text-ink-3">· {dateFmt(l.at, lang)}</span>
              </span>
              <strong className={l.points < 0 ? "text-error" : "text-sage"}>
                {l.points > 0 ? "+" : ""}
                {l.points}
              </strong>
            </li>
          ))}
        </ul>
        <p className="text-ink-3 mt-3 text-[12.5px]">
          {t(tx("Balance is computed from this ledger — never stored as an editable number.", "Baki dikira daripada lejar ini — tidak disimpan sebagai nombor yang boleh diubah."))}
        </p>
      </div>
    </div>
  );
}

export function WishlistPage() {
  const t = useT();
  const items = useWishlist((s) => s.items);
  const ps = products.filter((p) => items.includes(p.slug));
  return (
    <div>
      <h1 className="heading">{t(tx("Wishlist", "Senarai hajat"))}</h1>
      {ps.length === 0 ? (
        <p className="text-ink-2 mt-6">
          {t(
            tx(
              "Tap the heart on any product to save it here. We'll let you know about back-in-stock and price changes.",
              "Ketik ikon hati pada mana-mana produk untuk simpan di sini. Kami akan maklumkan bila stok kembali dan harga berubah.",
            ),
          )}
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 xl:grid-cols-3">
          {ps.map((p) => (
            <ProductCard key={p.slug} p={p} />
          ))}
        </div>
      )}
    </div>
  );
}

export function AddressesPage() {
  const t = useT();
  const acc = useAccount();
  const ui = useUI();
  const [form, setForm] = useState<Address | null>(null);
  return (
    <div className="space-y-6">
      <h1 className="heading">{t(tx("Addresses & payment", "Alamat & pembayaran"))}</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {acc.addresses.map((a) => (
          <div key={a.id} className="border-line bg-surface rounded-[20px] border p-5">
            <p className="font-semibold">
              {a.label} {a.isDefault && <span className="badge bg-tint-sage text-sage ml-2">{t(tx("Default", "Lalai"))}</span>}
            </p>
            <p className="text-ink-2 mt-2 text-[14.5px]">
              {a.line1}, {a.postcode} {a.city}, {a.state}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="btn btn-ghost btn-sm" onClick={() => setForm(a)}>
                {t(tx("Edit", "Sunting"))}
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => acc.removeAddress(a.id)}>
                {t(tx("Remove", "Buang"))}
              </button>
            </div>
          </div>
        ))}
        <button
          className="border-line hover:border-ink grid min-h-[140px] place-items-center rounded-[20px] border border-dashed text-[14.5px]"
          onClick={() => setForm({ id: crypto.randomUUID(), label: "Home", line1: "", postcode: "", city: "", state: "", isDefault: acc.addresses.length === 0 })}
        >
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4" /> {t(tx("Add address", "Tambah alamat"))}
          </span>
        </button>
      </div>
      {form && (
        <form
          className="border-line bg-surface grid gap-4 rounded-[20px] border p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const st = stateFromPostcode(form.postcode);
            if (!st || form.line1.length < 5 || form.city.length < 2)
              return ui.notify(t(tx("Please complete the address with a valid postcode.", "Sila lengkapkan alamat dengan poskod sah.")), "error");
            acc.saveAddress({ ...form, state: st });
            setForm(null);
          }}
        >
          <input className="field" placeholder={t(tx("Label (Home, Office)", "Label (Rumah, Pejabat)"))} value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
          <input className="field" placeholder={t(tx("Address", "Alamat"))} value={form.line1} onChange={(e) => setForm({ ...form, line1: e.target.value })} />
          <input
            className="field"
            inputMode="numeric"
            maxLength={5}
            placeholder={t(tx("Postcode", "Poskod"))}
            value={form.postcode}
            onChange={(e) => setForm({ ...form, postcode: e.target.value.replace(/\D/g, "") })}
          />
          <input className="field" placeholder={t(tx("City", "Bandar"))} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          <label className="flex items-center gap-2 text-[14px]">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} /> {t(tx("Default address", "Alamat lalai"))}
          </label>
          <div className="flex gap-2 sm:justify-end">
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setForm(null)}>
              {t(tx("Cancel", "Batal"))}
            </button>
            <button className="btn btn-primary btn-sm">{t(tx("Save", "Simpan"))}</button>
          </div>
        </form>
      )}
      <div className="bg-tint-blush rounded-[20px] p-5 text-[14.5px]">
        <p className="font-semibold">{t(tx("Saved payment methods", "Kaedah pembayaran tersimpan"))}</p>
        <p className="text-ink-2 mt-1">
          {t(
            tx(
              "Cards are saved as gateway tokens only — LUNAE never stores card numbers. Tokens appear here after your first card payment at launch.",
              "Kad disimpan sebagai token gerbang sahaja — LUNAE tidak menyimpan nombor kad. Token dipaparkan di sini selepas bayaran kad pertama semasa pelancaran.",
            ),
          )}
        </p>
      </div>
    </div>
  );
}

export function SecurityPage() {
  const t = useT();
  const lang = useLang();
  const acc = useAccount();
  const ui = useUI();
  return (
    <div className="space-y-6">
      <h1 className="heading">{t(tx("Passkeys & security", "Passkey & keselamatan"))}</h1>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <div className="flex items-center justify-between">
          <p className="text-[20px] font-semibold">Passkeys</p>
          <L href="/account/login" className="btn btn-sm btn-ghost">
            <KeyRound className="h-4 w-4" /> {t(tx("Add passkey", "Tambah passkey"))}
          </L>
        </div>
        {acc.passkeys.length === 0 ? (
          <p className="text-ink-2 mt-3 text-[14.5px]">
            {t(
              tx(
                "No passkeys yet. Passkeys are safer than passwords — there's nothing to steal or phish.",
                "Belum ada passkey. Passkey lebih selamat daripada kata laluan — tiada apa untuk dicuri atau dipancing.",
              ),
            )}
          </p>
        ) : (
          <ul className="divide-line mt-4 divide-y">
            {acc.passkeys.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-3 text-[14.5px]">
                <span className="flex items-center gap-3">
                  <Laptop className="text-ink-3 h-5 w-5" /> {p.device} <span className="text-ink-3">· {dateFmt(p.at, lang)}</span>
                </span>
                <button className="btn btn-ghost btn-sm" onClick={() => acc.removePasskey(p.id)}>
                  {t(tx("Remove", "Buang"))}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <p className="text-[20px] font-semibold">{t(tx("Active devices", "Peranti aktif"))}</p>
        <p className="text-ink-2 mt-2 text-[14.5px]">{t(tx("This device · now", "Peranti ini · sekarang"))}</p>
        <button
          className="btn btn-secondary btn-sm mt-4"
          onClick={() => {
            acc.signOut();
            ui.notify(t(tx("Signed out everywhere", "Log keluar di semua peranti")));
          }}
        >
          {t(tx("Sign out everywhere", "Log keluar di semua peranti"))}
        </button>
      </div>
    </div>
  );
}

export function PrivacyPage() {
  const t = useT();
  const acc = useAccount();
  const profile = useProfile();
  const ui = useUI();
  const consents: [keyof typeof acc.consents, { en: string; ms: string }][] = [
    ["marketingEmail", tx("Marketing emails", "E-mel pemasaran")],
    ["marketingWhatsApp", tx("WhatsApp offers & drop reminders", "Tawaran WhatsApp & peringatan drop")],
    ["push", tx("Push notifications (SPF, refills)", "Notifikasi (SPF, isi semula)")],
    ["personalisation", tx("Personalised recommendations", "Cadangan diperibadikan")],
    ["analytics", tx("Analytics", "Analitik")],
  ];
  return (
    <div className="space-y-6">
      <h1 className="heading">{t(tx("Privacy centre (PDPA)", "Pusat privasi (PDPA)"))}</h1>
      <div className="border-line bg-surface rounded-[24px] border p-6">
        <p className="text-[20px] font-semibold">{t(tx("Your consents", "Persetujuan anda"))}</p>
        <ul className="divide-line mt-4 divide-y">
          {consents.map(([k, l]) => (
            <li key={k} className="flex items-center justify-between gap-4 py-3.5 text-[15px]">
              {t(l)}
              <Toggle checked={acc.consents[k]} onChange={(v) => acc.setConsent(k, v)} label={t(l)} />
            </li>
          ))}
        </ul>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <button
          className="border-line bg-surface hover:border-ink flex items-start gap-4 rounded-[20px] border p-5 text-left"
          onClick={() => {
            const data = {
              exportedAt: new Date().toISOString(),
              account: acc.user,
              orders: acc.orders,
              pointsLedger: acc.ledger,
              addresses: acc.addresses,
              consents: acc.consents,
              shadeProfile: profile.profile,
            };
            const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }));
            const a = document.createElement("a");
            a.href = url;
            a.download = "lunae-my-data.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download className="text-accent-deep h-6 w-6" />
          <span>
            <span className="block font-semibold">{t(tx("Download my data", "Muat turun data saya"))}</span>
            <span className="text-ink-2 block text-[13.5px]">{t(tx("Everything we hold about you, as a JSON file.", "Semua data kami tentang anda, sebagai fail JSON."))}</span>
          </span>
        </button>
        <button
          className="border-error/40 bg-surface hover:border-error flex items-start gap-4 rounded-[20px] border p-5 text-left"
          onClick={() => {
            if (!window.confirm(t(tx("Delete your account and all data on this device? This can't be undone.", "Padam akaun dan semua data pada peranti ini? Tindakan ini tidak boleh diundur."))))
              return;
            acc.deleteAll();
            profile.setProfile(null);
            ui.notify(t(tx("Account deleted", "Akaun dipadam")));
          }}
        >
          <Trash2 className="text-error h-6 w-6" />
          <span>
            <span className="block font-semibold">{t(tx("Delete my account", "Padam akaun saya"))}</span>
            <span className="text-ink-2 block text-[13.5px]">
              {t(tx("Financial records are kept for the legally required period; everything else is erased.", "Rekod kewangan disimpan mengikut tempoh undang-undang; selebihnya dipadam."))}
            </span>
          </span>
        </button>
      </div>
      <p className="text-ink-3 text-[13px]">
        {t(
          tx(
            "To correct data or ask a question, contact our Data Protection Officer at dpo@lunae.my.",
            "Untuk membetulkan data atau bertanya, hubungi Pegawai Perlindungan Data kami di dpo@lunae.my.",
          ),
        )}
      </p>
    </div>
  );
}
