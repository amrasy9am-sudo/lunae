"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, KeyRound, Minus, Plus, QrCode, RefreshCw, Sparkles, Truck } from "lucide-react";
import type { Product } from "@/lib/types";
import { useHref, useLang, useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { rm, rm2, dateFmt, pad } from "@/lib/format";
import { useCart, useProfile, useUI, useWishlist } from "@/lib/store";
import { bestShadeFor } from "@/lib/match";
import { mix } from "@/lib/color";

const UT: Record<string, { en: string; ms: string }> = { cool: tx("cool", "sejuk"), neutral: tx("neutral", "neutral"), warm: tx("warm", "hangat"), olive: tx("olive", "zaitun") };
const DEPTH = [
  tx("fair", "cerah"),
  tx("fair", "cerah"),
  tx("light", "terang"),
  tx("light", "terang"),
  tx("light-medium", "terang-sederhana"),
  tx("light-medium", "terang-sederhana"),
  tx("medium", "sederhana"),
  tx("medium", "sederhana"),
  tx("tan", "sawo"),
  tx("tan", "sawo"),
  tx("deep", "gelap"),
  tx("deep", "gelap"),
];
const SKIN_TONES = [
  { l: tx("Fair", "Cerah"), hex: "#F1D3BD" },
  { l: tx("Light", "Terang"), hex: "#E5BE9C" },
  { l: tx("Light-med", "Terang-sdn"), hex: "#D3A27A" },
  { l: tx("Medium", "Sederhana"), hex: "#BB8660" },
  { l: tx("Tan", "Sawo"), hex: "#956446" },
  { l: tx("Deep", "Gelap"), hex: "#5F3E2B" },
];

function useDelivery() {
  const [now, setNow] = useState<Date | null>(null);
  const [postcode, setPostcode] = useState("");
  useEffect(() => {
    setNow(new Date());
    try {
      setPostcode(localStorage.getItem("lunae-postcode") ?? "");
    } catch {}
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  const east = /^(8[89]|9[0-8])/.test(postcode);
  const res = useMemo(() => {
    if (!now) return null;
    const myt = new Date(now.getTime() + (8 * 60 + now.getTimezoneOffset()) * 60_000);
    const cutoff = new Date(myt);
    cutoff.setHours(14, 0, 0, 0);
    const working = (d: Date) => d.getDay() !== 0 && d.getDay() !== 6;
    let ship = new Date(myt);
    if (!working(ship) || myt >= cutoff) {
      do ship = new Date(ship.getTime() + 86400_000);
      while (!working(ship));
    }
    let eta = new Date(ship);
    let add = east ? 3 : 1;
    while (add > 0) {
      eta = new Date(eta.getTime() + 86400_000);
      if (working(eta)) add--;
    }
    const left = cutoff.getTime() - myt.getTime();
    return { eta, left: left > 0 && working(myt) ? left : 0 };
  }, [now, east]);
  return { res, postcode, setPostcode, east };
}

export function BuyBox({ p }: { p: Product }) {
  const t = useT();
  const lang = useLang();
  const href = useHref();
  const router = useRouter();
  const profile = useProfile((s) => s.profile);
  const cart = useCart();
  const ui = useUI();
  const wish = useWishlist();
  const match = profile ? bestShadeFor(p, profile) : null;
  const [shade, setShade] = useState(p.shades[0]?.name);
  const [qty, setQty] = useState(1);
  const [pcEdit, setPcEdit] = useState(false);
  const { res, postcode, setPostcode, east } = useDelivery();

  useEffect(() => {
    if (match) setShade(match.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [match?.name]);
  const s = p.shades.find((x) => x.name === shade);
  const isBase = p.sub === "base" || p.sub === "concealer";

  const addToBag = (go?: "checkout") => {
    cart.add({ slug: p.slug, shade, qty });
    if (go) router.push(href("/checkout"));
    else {
      ui.notify(`${p.shortName}${shade ? ` · ${shade}` : ""} — ${t(tx("added to bag", "dimasukkan ke troli"))}`);
      ui.set({ cartOpen: true });
    }
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {p.badges.includes("bestseller") && <span className="badge bg-surface-2 text-accent-deep">{t(tx("Bestseller", "Terlaris"))}</span>}
        <span className="badge bg-tint-sage text-sage">Halal</span>
        {p.refillable && <span className="badge bg-surface-3 text-ink-2">{t(tx("Refillable", "Boleh isi semula"))}</span>}
        <span className="badge bg-surface-3 text-ink-2">{p.wave === 1 ? t(tx("Wave 1 · Aug 2027", "Gelombang 1 · Ogos 2027")) : t(tx("Wave 2 · early 2028", "Gelombang 2 · awal 2028"))}</span>
      </div>
      <h1 className="product-name mt-4 text-[clamp(2rem,3.4vw,2.75rem)]">{p.name}</h1>
      <p className="text-ink-2 mt-2 text-[16px]">
        {t(p.tagline)} · {p.size}
      </p>
      <p className="text-ink-3 mt-3 text-[13.5px]">{t(tx("Pre-launch · verified-buyer reviews open after launch", "Pra-pelancaran · ulasan pembeli disahkan dibuka selepas pelancaran"))}</p>

      <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <p className="font-display text-[46px] leading-none font-medium">{rm(p.price)}</p>
        <p className="text-ink-3 text-[13.5px]">
          {t(tx("or 3 ×", "atau 3 ×"))} {rm2(p.price / 3)} {t(tx("with Atome", "dengan Atome"))} · {t(tx("earn", "dapat"))} {p.price} {t(tx("pts", "mata"))}
        </p>
      </div>

      {p.shades.length > 1 && (
        <div className="mt-7">
          <p className="text-[13px] font-semibold tracking-[0.12em] uppercase">
            {t(tx("Shade", "Rona"))} · {s?.name} {s?.code}{" "}
            {s?.undertone && (
              <span className="text-ink-3 font-normal tracking-normal normal-case">
                {t(UT[s.undertone])} · {t(DEPTH[s.depth ?? 0])}
              </span>
            )}
          </p>
          <div role="radiogroup" aria-label={t(tx("Choose shade", "Pilih rona"))} className="mt-3 flex flex-wrap gap-2.5">
            {p.shades.map((x) => (
              <button
                key={x.name}
                role="radio"
                aria-checked={shade === x.name}
                aria-label={`${x.name}${x.code ? ` ${x.code}` : ""}`}
                title={`${x.name}${x.code ? ` · ${x.code}` : ""}`}
                onClick={() => setShade(x.name)}
                className="relative h-10 w-10 rounded-full border border-black/10 transition-transform hover:scale-110"
                style={{ background: x.hex, boxShadow: shade === x.name ? "0 0 0 2.5px var(--bg), 0 0 0 4px var(--ink)" : undefined }}
              >
                {match?.name === x.name && <span className="border-bg bg-sage absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full border-2" aria-hidden />}
              </button>
            ))}
          </div>
        </div>
      )}

      {isBase && (
        <div className="bg-tint-sage mt-5 rounded-[16px] p-4">
          {match ? (
            <div className="flex items-start gap-3">
              <Sparkles className="text-sage mt-0.5 h-5 w-5 shrink-0" strokeWidth={1.5} />
              <div className="flex-1 text-[14px]">
                <p className="font-semibold">
                  {t(tx("Your AI match", "Padanan AI anda"))}: {match.name} {match.code} · {profile!.confidence}% {t(tx("confidence", "keyakinan"))}
                </p>
                <p className="text-ink-2">
                  {t(tx("From your", "Daripada"))} {profile!.method === "selfie" ? t(tx("selfie scan", "imbasan swafoto")) : t(tx("shade quiz", "kuiz rona"))} ·{" "}
                  {dateFmt(profile!.at, lang, { day: "numeric", month: "short" })}
                </p>
              </div>
              <L href="/shade-finder" className="text-[13px] font-semibold underline underline-offset-2">
                {t(tx("Rescan", "Imbas semula"))}
              </L>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 text-[14px]">
              <span className="flex items-center gap-2">
                <Sparkles className="text-sage h-5 w-5" strokeWidth={1.5} /> {t(tx("Not sure? Find your exact shade in 60 seconds.", "Tak pasti? Cari rona tepat dalam 60 saat."))}
              </span>
              <L href="/shade-finder" className="btn btn-sm btn-primary">
                {t(tx("AI Shade Finder", "Pencari Rona AI"))}
              </L>
            </div>
          )}
        </div>
      )}

      {isBase && s && (
        <div className="mt-5">
          <p className="text-ink-3 text-[13px]">
            {t(tx(`How ${s.name} looks on different skin tones (left: skin · right: applied)`, `Rupa ${s.name} pada tona kulit berbeza (kiri: kulit · kanan: disapu)`))}
          </p>
          <div className="mt-2.5 grid grid-cols-6 gap-2">
            {SKIN_TONES.map((k) => (
              <div key={k.hex} className="text-center">
                <div className="flex h-12 overflow-hidden rounded-[10px]">
                  <span className="flex-1" style={{ background: k.hex }} />
                  <span className="flex-1" style={{ background: mix(k.hex, s.hex, p.sub === "base" && p.slug.includes("moonbeam") ? 0.55 : 0.78) }} />
                </div>
                <p className="text-ink-3 mt-1 text-[11px]">{t(k.l)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 flex gap-3">
        <div className="border-line flex h-12 items-center rounded-full border">
          <button className="grid h-12 w-11 place-items-center" aria-label={t(tx("Decrease", "Kurang"))} onClick={() => setQty((q) => Math.max(1, q - 1))}>
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-medium" aria-live="polite">
            {qty}
          </span>
          <button className="grid h-12 w-11 place-items-center" aria-label={t(tx("Increase", "Tambah"))} onClick={() => setQty((q) => Math.min(10, q + 1))}>
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <button className="btn btn-primary flex-1" onClick={() => addToBag()}>
          {t(tx("Add to bag", "Masuk troli"))} · {rm(p.price * qty)}
        </button>
        <button
          className="border-line hover:border-ink grid h-12 w-12 shrink-0 place-items-center rounded-full border"
          aria-pressed={wish.items.includes(p.slug)}
          aria-label={t(tx("Save to wishlist", "Simpan ke senarai hajat"))}
          onClick={() => wish.toggle(p.slug)}
        >
          <Heart className={`h-5 w-5 ${wish.items.includes(p.slug) ? "fill-accent stroke-accent" : ""}`} strokeWidth={1.5} />
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button className="btn btn-secondary btn-sm h-11" onClick={() => addToBag("checkout")}>
          <QrCode className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Pay with DuitNow QR", "Bayar DuitNow QR"))}
        </button>
        <button className="btn btn-secondary btn-sm h-11" onClick={() => addToBag("checkout")}>
          <KeyRound className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Passkey checkout", "Checkout passkey"))}
        </button>
      </div>

      <div className="mt-6 space-y-2.5 text-[14px]">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Truck className="text-ink-3 h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span suppressHydrationWarning>
            {t(tx("Arrives", "Tiba"))} <strong>{res ? dateFmt(res.eta, lang, { weekday: "short", day: "numeric", month: "short" }) : "…"}</strong> {t(tx("to", "ke"))}{" "}
          </span>
          {pcEdit ? (
            <input
              autoFocus
              inputMode="numeric"
              maxLength={5}
              value={postcode}
              onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
              onBlur={() => {
                setPcEdit(false);
                try {
                  localStorage.setItem("lunae-postcode", postcode);
                } catch {}
              }}
              className="border-ink w-20 border-b bg-transparent px-1 outline-none"
              aria-label={t(tx("Postcode", "Poskod"))}
            />
          ) : (
            <button className="underline underline-offset-2" onClick={() => setPcEdit(true)}>
              {postcode || t(tx("your postcode", "poskod anda"))}
            </button>
          )}
          {res && res.left > 0 && (
            <span className="text-ink-3" suppressHydrationWarning>
              · {t(tx("order in", "pesan dalam"))} {Math.floor(res.left / 3600_000)}h {pad((res.left % 3600_000) / 60_000)}m
            </span>
          )}
          {east && <span className="text-ink-3">· Sabah/Sarawak 3–7 {t(tx("days", "hari"))}</span>}
        </p>
        <p className="flex items-center gap-2">
          <RefreshCw className="text-ink-3 h-4 w-4 shrink-0" strokeWidth={1.5} />
          {t(tx("Wrong shade?", "Rona tak sesuai?"))} <strong>{t(tx("Free swap within 30 days.", "Tukar percuma dalam 30 hari."))}</strong>
        </p>
      </div>
    </div>
  );
}
