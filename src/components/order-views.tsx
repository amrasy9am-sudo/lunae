"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, MessageCircle, Share2, KeyRound, PartyPopper } from "lucide-react";
import { useLang, useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { dateFmt, rm2, timeFmt } from "@/lib/format";
import { useAccount, useUI, type OrderRecord } from "@/lib/store";
import { orderStage } from "@/lib/orders";
import { WHATSAPP } from "@/lib/site";

const STAGE_L = [tx("Paid", "Dibayar"), tx("Packed (batch-checked)", "Dibungkus (kelompok disemak)"), tx("Out for delivery", "Dalam penghantaran"), tx("Delivered", "Dihantar")];

export function useOrder(no: string) {
  const orders = useAccount((s) => s.orders);
  const [o, setO] = useState<OrderRecord | null | undefined>(undefined);
  useEffect(() => {
    const found = orders.find((x) => x.no === no);
    if (found) return setO(found);
    try {
      const raw = localStorage.getItem(`lunae-order-${no}`);
      setO(raw ? JSON.parse(raw) : null);
    } catch {
      setO(null);
    }
  }, [orders, no]);
  return o;
}

export function RiderMap({ progress = 0.6 }: { progress?: number }) {
  const t = useT();
  const pts = "M20,170 C80,120 120,150 170,110 S260,60 300,80 S360,40 390,20";
  return (
    <div className="border-line bg-surface relative overflow-hidden rounded-[16px] border bg-[linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] bg-[size:28px_28px]">
      <svg viewBox="0 0 410 190" className="h-44 w-full" aria-label={t(tx("Delivery route", "Laluan penghantaran"))}>
        <path d={pts} fill="none" stroke="var(--accent)" strokeWidth="3" strokeDasharray="6 7" />
        <circle cx="390" cy="20" r="9" fill="var(--accent)" opacity=".35" />
        <circle cx="390" cy="20" r="5" fill="var(--accent)" />
        <circle cx={20 + 370 * progress} cy={170 - 150 * progress} r="9" fill="var(--ink)" />
      </svg>
      <span className="bg-surface absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[12.5px] shadow-[var(--shadow-e1)]">
        {t(tx("Rider location shown where the courier supports it", "Lokasi penghantar dipapar jika kurier menyokong"))}
      </span>
    </div>
  );
}

export function Timeline({ o }: { o: OrderRecord }) {
  const t = useT();
  const lang = useLang();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const st = orderStage(o, now);
  return (
    <ol className="grid grid-cols-4 gap-2">
      {STAGE_L.map((l, i) => (
        <li key={i} className="text-center">
          <span className={`mx-auto grid h-9 w-9 place-items-center rounded-full ${i <= st.idx ? "bg-primary text-primary-ink" : "bg-surface-3"}`}>{i <= st.idx && <Check className="h-4 w-4" />}</span>
          <span className="mt-2 block text-[13px] font-medium">{t(l)}</span>
          <span className="text-ink-3 block text-[11.5px]" suppressHydrationWarning>
            {st.times[i]
              ? `${dateFmt(st.times[i]!, lang, { day: "numeric", month: "short" })} ${timeFmt(st.times[i]!, lang)}`
              : i === 3
                ? `ETA ${dateFmt(o.eta, lang, { day: "numeric", month: "short" })}`
                : ""}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function ThankYou({ no }: { no: string }) {
  const t = useT();
  const lang = useLang();
  const o = useOrder(no);
  const acc = useAccount();
  const ui = useUI();
  if (o === undefined) return <div className="skeleton mx-auto my-20 h-96 max-w-3xl" />;
  if (o === null)
    return (
      <div className="py-20 text-center">
        <p className="font-display text-[30px]">{t(tx("We can't find that order on this device.", "Kami tidak menjumpai pesanan itu pada peranti ini."))}</p>
        <L href="/track" className="btn btn-primary mt-6">
          {t(tx("Track an order", "Jejak pesanan"))}
        </L>
      </div>
    );
  const code = `LUNAE-${(acc.user?.name ?? "FRIEND").split(" ")[0].toUpperCase().slice(0, 8)}`;
  return (
    <div className="mx-auto max-w-3xl">
      <div className="text-center">
        <PartyPopper className="text-accent mx-auto h-10 w-10" strokeWidth={1.5} />
        <p className="eyebrow text-sage mt-5">{t(tx("Order confirmed · payment verified", "Pesanan disahkan · bayaran disahkan"))}</p>
        <h1 className="display-l mt-3">{t(tx("Thank you — your glow is on its way.", "Terima kasih — seri anda dalam perjalanan."))}</h1>
        <p className="text-ink-2 mt-3">
          {t(tx("Order", "Pesanan"))} <strong>{o.no}</strong> · {t(tx("arrives by", "tiba sebelum"))} <strong>{dateFmt(o.eta, lang, { weekday: "long", day: "numeric", month: "short" })}</strong> ·{" "}
          {o.courier}
        </p>
        <p className="text-ink-3 mt-1 text-[13px]">{t(tx("Demo order — nothing was charged or shipped.", "Pesanan demo — tiada caj atau penghantaran."))}</p>
      </div>
      <div className="border-line bg-surface mt-10 rounded-[24px] border p-6">
        <Timeline o={o} />
      </div>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="border-line bg-surface rounded-[24px] border p-6">
          <p className="eyebrow text-ink-3">{t(tx("Summary", "Ringkasan"))}</p>
          <ul className="mt-4 space-y-2 text-[14.5px]">
            {o.lines.map((l) => (
              <li key={l.slug + l.shade} className="flex justify-between gap-3">
                <span>
                  {l.qty} × {l.name}
                  {l.shade ? ` · ${l.shade}` : ""}
                </span>
                <span>{o.gift ? "—" : rm2(l.unit * l.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="border-line mt-4 space-y-1 border-t pt-4 text-[14px]">
            {o.discount > 0 && (
              <p className="text-sage flex justify-between">
                <span>{t(tx("Savings", "Penjimatan"))}</span>
                <span>−{rm2(o.discount)}</span>
              </p>
            )}
            <p className="flex justify-between">
              <span>{t(tx("Delivery", "Penghantaran"))}</span>
              <span>{o.shippingFee ? rm2(o.shippingFee) : t(tx("FREE", "PERCUMA"))}</span>
            </p>
            <p className="flex justify-between text-[16px] font-semibold">
              <span>{t(tx("Total paid", "Jumlah dibayar"))}</span>
              <span>{rm2(o.total)}</span>
            </p>
            <p className="text-ink-3 text-[12.5px]">
              {t(tx("incl. SST", "termasuk SST"))} {rm2(o.sst)} · {o.payment} · {t(tx("e-Invoice (MyInvois) emailed after delivery", "e-Invois (MyInvois) dihantar selepas penghantaran"))}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          {acc.user ? (
            <div className="bg-night text-moon rounded-[24px] p-6">
              <p className="eyebrow text-glow">Lunae Circle</p>
              <p className="font-display mt-2 text-[36px] leading-none">+{o.pointsEarned} pts</p>
              <p className="text-halo mt-2 text-[14px]">{t(tx("added to your balance", "ditambah ke baki anda"))}</p>
            </div>
          ) : (
            <div className="bg-night text-moon rounded-[24px] p-6">
              <p className="eyebrow text-glow">{t(tx("Save your details", "Simpan butiran anda"))}</p>
              <p className="text-halo mt-2 text-[15px]">
                {t(
                  tx(
                    "Create an account with a passkey — track this order, earn points and check out in one tap next time.",
                    "Cipta akaun dengan passkey — jejak pesanan ini, kumpul mata dan checkout satu ketik lain kali.",
                  ),
                )}
              </p>
              <L href="/account/login" className="btn btn-sm bg-moon text-cocoa-ink mt-4">
                <KeyRound className="h-4 w-4" /> {t(tx("Create account", "Cipta akaun"))}
              </L>
            </div>
          )}
          <div className="border-line bg-surface rounded-[24px] border p-6">
            <p className="font-semibold">{t(tx("Share the glow", "Kongsi seri"))}</p>
            <p className="text-ink-2 mt-1 text-[14px]">
              {t(tx("Friends get RM10 off their first order; you both get 500 points.", "Rakan dapat RM10 potongan pesanan pertama; kedua-dua dapat 500 mata."))}
            </p>
            <button
              className="btn btn-sm btn-ghost mt-4"
              onClick={() => {
                const text = `${t(tx("Try LUNAE with my code", "Cuba LUNAE dengan kod saya"))} ${code}`;
                if (navigator.share) navigator.share({ text, url: window.location.origin }).catch(() => {});
                else navigator.clipboard?.writeText(code).then(() => ui.notify(t(tx("Code copied", "Kod disalin"))));
              }}
            >
              <Share2 className="h-4 w-4" /> {code}
            </button>
          </div>
          <a href={WHATSAPP} target="_blank" rel="noreferrer" className="border-line bg-surface flex items-center gap-3 rounded-[24px] border p-5 text-[14.5px]">
            <MessageCircle className="text-sage h-5 w-5" /> {t(tx("Get updates on WhatsApp", "Dapatkan makluman di WhatsApp"))}
          </a>
        </div>
      </div>
      <div className="mt-10 flex justify-center gap-3">
        <L href="/shop" className="btn btn-secondary">
          {t(tx("Continue shopping", "Terus membeli-belah"))}
        </L>
        <L href={`/track?no=${o.no}`} className="btn btn-primary">
          {t(tx("Track order", "Jejak pesanan"))}
        </L>
      </div>
    </div>
  );
}

export function TrackOrder() {
  const t = useT();
  const lang = useLang();
  const sp = useSearchParams();
  const orders = useAccount((s) => s.orders);
  const [no, setNo] = useState(sp.get("no") ?? "");
  const [contact, setContact] = useState("");
  const [query, setQuery] = useState<string | null>(sp.get("no"));
  const [err, setErr] = useState(false);
  const found = query ? orders.find((o) => o.no.toLowerCase() === query.toLowerCase()) : undefined;
  const st = found ? orderStage(found) : null;
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.3fr]">
      <form
        className="border-line bg-surface space-y-4 self-start rounded-[24px] border p-6"
        onSubmit={(e) => {
          e.preventDefault();
          const o = orders.find((x) => x.no.toLowerCase() === no.trim().toLowerCase());
          const ok = o && (!contact || o.email.toLowerCase() === contact.trim().toLowerCase() || o.phone.replace(/\D/g, "").endsWith(contact.replace(/\D/g, "").slice(-7)));
          setErr(!ok);
          setQuery(ok ? no.trim() : null);
        }}
      >
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Order number", "Nombor pesanan"))}</span>
          <input className="field mt-1.5" value={no} onChange={(e) => setNo(e.target.value)} placeholder="LN-24817" />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Email or phone", "E-mel atau telefon"))}</span>
          <input className="field mt-1.5" value={contact} onChange={(e) => setContact(e.target.value)} />
        </label>
        <button className="btn btn-primary w-full">{t(tx("Track", "Jejak"))}</button>
        {err && (
          <p className="text-error text-[13.5px]">
            {t(
              tx(
                "No matching order. In this preview, orders are stored on the device that placed them.",
                "Tiada pesanan sepadan. Dalam pratonton ini, pesanan disimpan pada peranti yang membuat pesanan.",
              ),
            )}
          </p>
        )}
        {orders.length > 0 && !found && (
          <p className="text-ink-3 text-[13px]">
            {t(tx("Recent on this device:", "Terkini pada peranti ini:"))}{" "}
            {orders.slice(0, 3).map((o) => (
              <button key={o.no} type="button" className="mr-2 underline" onClick={() => (setNo(o.no), setQuery(o.no))}>
                {o.no}
              </button>
            ))}
          </p>
        )}
      </form>
      <div>
        {found && st ? (
          <div className="space-y-5">
            <div className="border-line bg-surface rounded-[24px] border p-6">
              <p className="eyebrow text-ink-3">
                {t(tx("Order", "Pesanan"))} {found.no}
              </p>
              <p className="font-display mt-2 text-[38px] leading-tight">
                {st.idx >= 3 ? t(tx("Delivered", "Dihantar")) : `${t(tx("Arriving", "Tiba"))} ${dateFmt(found.eta, lang, { weekday: "short", day: "numeric", month: "short" })}`}
              </p>
              <div className="mt-6">
                <Timeline o={found} />
              </div>
            </div>
            {st.idx === 2 && <RiderMap />}
            <div className="flex flex-wrap gap-3">
              <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-secondary btn-sm">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </a>
              <span className="btn btn-ghost btn-sm">{t(tx("Delivery note: leave at door", "Nota: tinggal di pintu"))}</span>
            </div>
            <p className="text-ink-3 text-[12.5px]">
              {t(
                tx(
                  "Status in this preview advances on a demo timeline; live status comes from courier webhooks.",
                  "Status dalam pratonton ini bergerak mengikut garis masa demo; status langsung datang daripada webhook kurier.",
                ),
              )}
            </p>
          </div>
        ) : (
          <div className="border-line text-ink-2 grid h-full min-h-[260px] place-items-center rounded-[24px] border border-dashed p-10 text-center">
            {t(tx("Enter your order number to see the live timeline — no sign-in needed.", "Masukkan nombor pesanan untuk lihat garis masa — tanpa log masuk."))}
          </div>
        )}
      </div>
    </div>
  );
}
