"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Check, Gift, KeyRound, Lock, QrCode, ShieldCheck, Wallet, CalendarClock } from "lucide-react";
import { useHref, useLang, useT } from "../providers";
import { L, Toggle } from "../ui";
import { tx } from "@/lib/i18n";
import { pointsBalance, useAccount, useCart, useUI } from "@/lib/store";
import { quote, SHIPPING, tierFor } from "@/lib/pricing";
import { productBySlug, tintBg } from "@/data/catalogue";
import { dateFmt, pad, rm2 } from "@/lib/format";
import { BANKS, normaliseMyPhone, stateFromPostcode } from "@/lib/checkout";

type Pay = "fpx" | "card" | "duitnow" | "ewallet" | "bnpl" | "passkey";

function addWorkingDays(d: Date, n: number) {
  const x = new Date(d);
  while (n > 0) {
    x.setDate(x.getDate() + 1);
    if (x.getDay() !== 0 && x.getDay() !== 6) n--;
  }
  return x;
}

export function CheckoutForm() {
  const t = useT();
  const lang = useLang();
  const href = useHref();
  const router = useRouter();
  const cart = useCart();
  const acc = useAccount();
  const ui = useUI();
  const balance = pointsBalance(acc.ledger);
  const yearSpend = acc.orders.reduce((a, o) => a + o.total, 0);
  const tier = tierFor(yearSpend);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [marketing, setMarketing] = useState(false);
  const [name, setName] = useState("");
  const [line1, setLine1] = useState("");
  const [postcode, setPostcode] = useState("");
  const [city, setCity] = useState("");
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [gift, setGift] = useState(false);
  const [giftMsg, setGiftMsg] = useState("");
  const [pay, setPay] = useState<Pay>("fpx");
  const [bank, setBank] = useState(BANKS[0]);
  const [voucherInput, setVoucherInput] = useState(cart.voucher);
  const [points, setPoints] = useState(0);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [busy, setBusy] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [reserveEnd, setReserveEnd] = useState<number | null>(null);

  useEffect(() => {
    if (acc.user) {
      setEmail((e) => e || acc.user!.email);
      setPhone((p) => p || acc.user!.phone);
      setName((n) => n || acc.user!.name);
    }
    const def = acc.addresses.find((a) => a.isDefault) ?? acc.addresses[0];
    if (def) {
      setLine1((l) => l || def.line1);
      setPostcode((p) => p || def.postcode);
      setCity((c) => c || def.city);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acc.user, acc.addresses.length]);
  useEffect(() => {
    setNow(new Date());
    setReserveEnd(Date.now() + 15 * 60_000);
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const state = stateFromPostcode(postcode);
  const q = useMemo(
    () => quote({ lines: cart.lines, voucher: cart.voucher, pointsToUse: Math.min(points, balance), shipping, state: state ?? undefined }),
    [cart.lines, cart.voucher, points, balance, shipping, state],
  );
  const left = reserveEnd && now ? Math.max(0, reserveEnd - now.getTime()) : 15 * 60_000;
  const etaStd = now ? addWorkingDays(now, q.east ? 3 : 2) : null;
  const etaExp = now ? addWorkingDays(now, 1) : null;

  if (cart.lines.length === 0)
    return (
      <div className="py-20 text-center">
        <p className="font-display text-[34px]">{t(tx("Your bag is empty. Shall we find your shade?", "Troli masih kosong. Jom cari rona anda?"))}</p>
        <L href="/shop" className="btn btn-primary mt-6">
          {t(tx("Shop all", "Lihat semua"))}
        </L>
      </div>
    );

  const submit = async () => {
    const e: Record<string, boolean> = {};
    if (!/^\S+@\S+\.\S+$/.test(email)) e.email = true;
    if (!normaliseMyPhone(phone)) e.phone = true;
    if (name.trim().length < 2) e.name = true;
    if (line1.trim().length < 5) e.line1 = true;
    if (!state) e.postcode = true;
    if (city.trim().length < 2) e.city = true;
    setErrors(e);
    if (Object.keys(e).length) {
      ui.notify(t(tx("Please check the highlighted fields.", "Sila semak ruangan yang ditanda.")), "error");
      document.querySelector("[aria-invalid=true]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lines: cart.lines,
          voucher: cart.voucher || undefined,
          pointsToUse: points,
          pointsBalance: balance,
          shipping,
          contact: { email, phone, marketing },
          address: { name, line1, postcode, city, state },
          gift: { on: gift, message: giftMsg },
          payment: pay,
          bank: pay === "fpx" ? bank : undefined,
        }),
      });
      const j = await res.json();
      if (!res.ok) {
        ui.notify(
          j.error === "voucher"
            ? t(tx("That voucher can't be used on this order.", "Baucar itu tidak boleh digunakan untuk pesanan ini."))
            : t(tx("Something needs fixing before payment.", "Ada yang perlu dibetulkan sebelum pembayaran.")),
          "error",
        );
        setBusy(false);
        return;
      }
      sessionStorage.setItem("lunae-pending", JSON.stringify(j));
      if (marketing) acc.setConsent("marketingEmail", true);
      router.push(href("/checkout/processing"));
    } catch {
      ui.notify(t(tx("Connection problem — you haven't been charged. Try again?", "Masalah sambungan — tiada caj dibuat. Cuba lagi?")), "error");
      setBusy(false);
    }
  };

  const payLabel = pay === "fpx" ? bank : pay === "card" ? t(tx("card", "kad")) : pay === "duitnow" ? "DuitNow QR" : pay === "ewallet" ? "e-wallet" : pay === "bnpl" ? "Atome" : "passkey";

  return (
    <div className="grid lg:grid-cols-[1fr_minmax(380px,0.8fr)]">
      <div className="px-4 py-8 sm:px-8 lg:px-14 lg:py-12">
        <p className="eyebrow text-ink-3">{t(tx("Express checkout", "Checkout pantas"))}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { k: "passkey" as Pay, l: tx("Passkey 1-tap", "Passkey 1-ketik"), i: KeyRound },
            { k: "duitnow" as Pay, l: tx("DuitNow QR", "DuitNow QR"), i: QrCode },
            { k: "ewallet" as Pay, l: tx("TNG eWallet", "TNG eWallet"), i: Wallet },
            { k: "bnpl" as Pay, l: tx("Atome · pay in 3", "Atome · bayar 3x"), i: CalendarClock },
          ].map(({ k, l, i: Icon }) => (
            <button key={k} className={`btn btn-sm h-12 ${pay === k ? "btn-primary" : "btn-secondary"}`} onClick={() => setPay(k)}>
              <Icon className="h-4 w-4" /> {t(l)}
            </button>
          ))}
        </div>
        <div className="text-ink-3 my-8 flex items-center gap-4 text-[12px] tracking-[0.14em] uppercase">
          <span className="bg-line h-px flex-1" />
          {t(tx("Or continue below", "Atau teruskan di bawah"))}
          <span className="bg-line h-px flex-1" />
        </div>

        {/* 1 Contact */}
        <section className="border-line bg-surface rounded-[20px] border p-6">
          <h2 className="flex items-center gap-3 text-[20px] font-semibold">
            <span className="bg-primary text-primary-ink grid h-7 w-7 place-items-center rounded-full text-[13px]">1</span> {t(tx("Contact", "Hubungan"))}
          </h2>
          {!acc.user && (
            <p className="text-ink-2 mt-2 text-[14px]">
              {t(tx("Checking out as a guest.", "Checkout sebagai tetamu."))}{" "}
              <L href="/account/login?next=/checkout" className="link">
                {t(tx("Sign in with passkey or OTP", "Log masuk dengan passkey atau OTP"))}
              </L>
            </p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="text-[13px] font-medium">Email</span>
              <input className="field mt-1.5" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!errors.email} />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium">{t(tx("Mobile (MY)", "Telefon bimbit (MY)"))}</span>
              <input
                className="field mt-1.5"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                placeholder="012-345 6789"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                aria-invalid={!!errors.phone}
              />
              {errors.phone && (
                <span className="text-error mt-1 block text-[12.5px]">{t(tx("Use a Malaysian mobile number, e.g. 012-345 6789", "Guna nombor telefon Malaysia, cth. 012-345 6789"))}</span>
              )}
            </label>
          </div>
          <label className="text-ink-2 mt-4 flex items-start gap-2.5 text-[13.5px]">
            <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
            {t(tx("Send me Lunae Circle news & drop reminders by email (optional).", "Hantar berita Lunae Circle & peringatan drop melalui e-mel (pilihan)."))}
          </label>
        </section>

        {/* 2 Delivery */}
        <section className="border-line bg-surface mt-5 rounded-[20px] border p-6">
          <h2 className="flex items-center gap-3 text-[20px] font-semibold">
            <span className="bg-primary text-primary-ink grid h-7 w-7 place-items-center rounded-full text-[13px]">2</span> {t(tx("Delivery", "Penghantaran"))}
          </h2>
          <div className="mt-5 grid gap-4">
            <label className="block">
              <span className="text-[13px] font-medium">{t(tx("Full name", "Nama penuh"))}</span>
              <input className="field mt-1.5" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} aria-invalid={!!errors.name} />
            </label>
            <label className="block">
              <span className="text-[13px] font-medium">{t(tx("Address", "Alamat"))}</span>
              <input
                className="field mt-1.5"
                autoComplete="street-address"
                placeholder={t(tx("No. 12, Jalan Uniciti 3, Taman Uniciti Alam", "No. 12, Jalan Uniciti 3, Taman Uniciti Alam"))}
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                aria-invalid={!!errors.line1}
              />
            </label>
            <div className="grid grid-cols-[1fr_1.4fr] gap-4 sm:grid-cols-3">
              <label className="block">
                <span className="text-[13px] font-medium">{t(tx("Postcode", "Poskod"))}</span>
                <input
                  className="field mt-1.5"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={postcode}
                  onChange={(e) => setPostcode(e.target.value.replace(/\D/g, ""))}
                  aria-invalid={!!errors.postcode}
                />
              </label>
              <label className="block">
                <span className="text-[13px] font-medium">{t(tx("City", "Bandar"))}</span>
                <input className="field mt-1.5" autoComplete="address-level2" value={city} onChange={(e) => setCity(e.target.value)} aria-invalid={!!errors.city} />
              </label>
              <label className="col-span-2 block sm:col-span-1">
                <span className="text-[13px] font-medium">{t(tx("State", "Negeri"))}</span>
                <input className="field bg-surface-2/40 mt-1.5" value={state ?? ""} readOnly placeholder={t(tx("From postcode", "Daripada poskod"))} tabIndex={-1} />
              </label>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => setShipping("standard")}
              className={`flex items-center justify-between rounded-[14px] border p-4 text-left ${shipping === "standard" ? "border-ink" : "border-line"}`}
            >
              <span>
                <span className="block font-semibold">
                  {t(tx("Standard", "Standard"))} · {q.east ? "Pos Laju" : SHIPPING.standard.courier}
                </span>
                <span className="text-ink-3 block text-[13px]" suppressHydrationWarning>
                  {etaStd ? dateFmt(etaStd, lang, { weekday: "short", day: "numeric", month: "short" }) : ""} {q.east ? "· 3–7 " + t(tx("days", "hari")) : ""}
                </span>
              </span>
              <span className="font-semibold">{shipping === "standard" && q.shippingFee === 0 ? t(tx("FREE", "PERCUMA")) : q.east ? "RM12" : "RM6"}</span>
            </button>
            <button
              disabled={q.east}
              onClick={() => setShipping("express")}
              className={`flex items-center justify-between rounded-[14px] border p-4 text-left disabled:opacity-40 ${shipping === "express" ? "border-ink" : "border-line"}`}
            >
              <span>
                <span className="block font-semibold">Express · Ninja Van</span>
                <span className="text-ink-3 block text-[13px]" suppressHydrationWarning>
                  {etaExp ? dateFmt(etaExp, lang, { weekday: "short", day: "numeric", month: "short" }) : ""} · {t(tx("Klang Valley", "Lembah Klang"))}
                </span>
              </span>
              <span className="font-semibold">RM8.00</span>
            </button>
          </div>
          <div className="bg-tint-blush mt-4 rounded-[14px] p-4">
            <div className="flex items-center gap-3">
              <Gift className="h-5 w-5 shrink-0" strokeWidth={1.5} />
              <p className="flex-1 text-[14px]">
                <strong>{t(tx("Gift mode", "Mod hadiah"))}</strong> — {t(tx("hide prices and add a handwritten card", "sembunyi harga dan tambah kad bertulis tangan"))}
              </p>
              <Toggle checked={gift} onChange={setGift} label={t(tx("Gift mode", "Mod hadiah"))} />
            </div>
            {gift && (
              <textarea
                maxLength={200}
                value={giftMsg}
                onChange={(e) => setGiftMsg(e.target.value)}
                rows={2}
                className="field mt-3"
                placeholder={t(tx("Your card message (we'll handwrite it)", "Mesej kad (kami tulis tangan)"))}
              />
            )}
          </div>
        </section>

        {/* 3 Payment */}
        <section className="border-line bg-surface mt-5 rounded-[20px] border p-6">
          <h2 className="flex items-center gap-3 text-[20px] font-semibold">
            <span className="bg-primary text-primary-ink grid h-7 w-7 place-items-center rounded-full text-[13px]">3</span> {t(tx("Payment", "Pembayaran"))}
          </h2>
          <div className="mt-5 flex flex-wrap gap-2">
            {[
              ["fpx", tx("Online banking (FPX)", "Perbankan dalam talian (FPX)")],
              ["card", tx("Card", "Kad")],
              ["duitnow", tx("DuitNow QR", "DuitNow QR")],
              ["ewallet", tx("e-Wallet", "e-Dompet")],
              ["bnpl", tx("Pay later", "Bayar kemudian")],
            ].map(([k, l]) => (
              <button key={k as string} className="chip" aria-pressed={pay === k} onClick={() => setPay(k as Pay)}>
                {t(l as { en: string; ms: string })}
              </button>
            ))}
          </div>
          {pay === "fpx" && (
            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {BANKS.map((b) => (
                <button key={b} onClick={() => setBank(b)} className={`h-12 rounded-[10px] border text-[13.5px] font-medium ${bank === b ? "border-ink bg-bg" : "border-line"}`}>
                  {b}
                </button>
              ))}
            </div>
          )}
          {pay === "card" && (
            <p className="text-ink-2 mt-4 text-[14px]">
              {t(
                tx(
                  "You'll enter card details on the gateway's secure page (3-D Secure 2). LUNAE never sees your card number.",
                  "Anda akan masukkan butiran kad di halaman selamat gerbang (3-D Secure 2). LUNAE tidak pernah melihat nombor kad anda.",
                ),
              )}
            </p>
          )}
          {pay === "duitnow" && (
            <p className="text-ink-2 mt-4 text-[14px]">
              {t(
                tx(
                  "A DuitNow QR code appears on the next screen — scan it with any banking or e-wallet app.",
                  "Kod QR DuitNow dipaparkan di skrin seterusnya — imbas dengan mana-mana aplikasi bank atau e-dompet.",
                ),
              )}
            </p>
          )}
          {pay === "ewallet" && <p className="text-ink-2 mt-4 text-[14px]">Touch &apos;n Go · GrabPay · ShopeePay</p>}
          {pay === "bnpl" && (
            <p className="text-ink-2 mt-4 text-[14px]">
              {t(tx("Atome: 3 interest-free payments of", "Atome: 3 bayaran tanpa faedah sebanyak"))} {rm2(q.total / 3)}
            </p>
          )}
          {pay === "passkey" && (
            <p className="text-ink-2 mt-4 text-[14px]">
              {t(tx("Confirm with Face ID / fingerprint using your saved address and gateway token.", "Sahkan dengan Face ID / cap jari menggunakan alamat tersimpan dan token gerbang."))}
            </p>
          )}
          <p className="text-ink-3 mt-4 flex items-center gap-2 text-[12.5px]">
            <ShieldCheck className="h-4 w-4" />{" "}
            {t(
              tx(
                "You'll be redirected to your bank or the gateway. LUNAE never sees or stores your banking details.",
                "Anda akan dibawa ke bank atau gerbang. LUNAE tidak pernah melihat atau menyimpan butiran perbankan anda.",
              ),
            )}
          </p>
        </section>
      </div>

      {/* Summary */}
      <aside className="bg-surface-2 px-4 py-8 sm:px-8 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:px-12 lg:py-12">
        <p className="eyebrow text-ink-2">
          {t(tx("Order summary", "Ringkasan pesanan"))} · {q.items.reduce((a, i) => a + i.qty, 0)} {t(tx("items", "item"))}
        </p>
        <ul className="mt-5 space-y-4">
          {q.items.map((i) => {
            const p = productBySlug(i.slug)!;
            return (
              <li key={i.slug + i.shade} className="flex items-center gap-4">
                <span className={`relative h-16 w-14 shrink-0 rounded-[10px] ${tintBg[p.tint]}`}>
                  <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="56px" className="object-contain p-1.5" />
                  <span className="bg-primary text-primary-ink absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold">{i.qty}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="product-name block truncate">{p.name}</span>
                  <span className="text-ink-3 text-[13px]">{i.shade ?? p.size}</span>
                </span>
                <span className="font-semibold">{gift ? "—" : rm2(i.total)}</span>
              </li>
            );
          })}
        </ul>
        <form
          className="mt-6 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            cart.setVoucher(voucherInput.trim().toUpperCase());
          }}
        >
          <input
            className="field flex-1"
            placeholder={t(tx("Voucher code", "Kod baucar"))}
            value={voucherInput}
            onChange={(e) => setVoucherInput(e.target.value)}
            aria-label={t(tx("Voucher code", "Kod baucar"))}
            aria-invalid={!!q.voucherError}
          />
          <button className="btn btn-primary">{t(tx("Apply", "Guna"))}</button>
        </form>
        {q.voucherError && (
          <p className="text-error mt-2 text-[13px]">
            {q.voucherError === "min"
              ? t(tx("Minimum spend not reached for this voucher.", "Belanja minimum belum dicapai untuk baucar ini."))
              : t(tx("That code isn't valid. Try BERSERI10 in this preview.", "Kod itu tidak sah. Cuba BERSERI10 dalam pratonton ini."))}{" "}
            <button className="underline" onClick={() => (cart.setVoucher(""), setVoucherInput(""))}>
              {t(tx("Remove", "Buang"))}
            </button>
          </p>
        )}
        {acc.user ? (
          <div className="bg-night text-moon mt-5 rounded-[16px] p-5">
            <div className="flex items-center justify-between text-[14px]">
              <span className="font-semibold">
                {tier.name} · {balance.toLocaleString()} pts
              </span>
              <span className="text-ember">−{rm2(q.pointsDiscount)}</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.min(balance, q.maxPoints)}
              step={100}
              value={Math.min(points, balance, q.maxPoints)}
              onChange={(e) => setPoints(+e.target.value)}
              className="mt-3 w-full accent-[#E08E6D]"
              disabled={balance < 100}
              aria-label={t(tx("Points to use", "Mata untuk digunakan"))}
            />
            <p className="text-halo mt-1 text-[12.5px]">
              {t(tx("Using", "Guna"))} {q.usedPoints.toLocaleString()} pts · {t(tx("you'll earn", "anda dapat"))} {Math.round(q.pointsEarned * tier.mult)} pts{" "}
              {t(tx("on this order", "untuk pesanan ini"))}
            </p>
          </div>
        ) : (
          <p className="bg-surface mt-5 rounded-[14px] p-4 text-[13.5px]">
            <L href="/account/login?next=/checkout" className="link">
              {t(tx("Join Lunae Circle", "Sertai Lunae Circle"))}
            </L>{" "}
            {t(tx(`to earn ${q.pointsEarned} points on this order + 200 welcome points.`, `untuk dapat ${q.pointsEarned} mata bagi pesanan ini + 200 mata alu-aluan.`))}
          </p>
        )}
        <dl className="mt-6 space-y-2 text-[14.5px]">
          <div className="flex justify-between">
            <dt className="text-ink-2">{t(tx("Subtotal", "Jumlah kecil"))}</dt>
            <dd>{rm2(q.subtotal)}</dd>
          </div>
          {q.bundle.amount > 0 && (
            <div className="text-sage flex justify-between">
              <dt>{q.bundle.label}</dt>
              <dd>−{rm2(q.bundle.amount)}</dd>
            </div>
          )}
          {q.voucherDiscount > 0 && (
            <div className="text-sage flex justify-between">
              <dt>
                {t(tx("Voucher", "Baucar"))} {cart.voucher}
              </dt>
              <dd>−{rm2(q.voucherDiscount)}</dd>
            </div>
          )}
          {q.pointsDiscount > 0 && (
            <div className="text-sage flex justify-between">
              <dt>{t(tx("Points", "Mata"))}</dt>
              <dd>−{rm2(q.pointsDiscount)}</dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-ink-2">{t(tx("Delivery", "Penghantaran"))}</dt>
            <dd>{q.shippingFee ? rm2(q.shippingFee) : t(tx("FREE", "PERCUMA"))}</dd>
          </div>
          <div className="text-ink-3 flex justify-between">
            <dt>{t(tx("SST (included)", "SST (termasuk)"))}</dt>
            <dd>{rm2(q.sstIncluded)}</dd>
          </div>
        </dl>
        <div className="border-ink/15 mt-5 flex items-baseline justify-between border-t pt-5">
          <span className="text-[17px] font-semibold">{t(tx("Total", "Jumlah"))}</span>
          <span className="font-display text-[44px] leading-none">{rm2(q.total)}</span>
        </div>
        <button className="btn btn-accent mt-6 h-14 w-full" disabled={busy} onClick={submit}>
          <Lock className="h-4 w-4" /> {busy ? t(tx("Securing your order…", "Menjamin pesanan anda…")) : `${t(tx("Pay", "Bayar"))} ${rm2(q.total)} ${t(tx("with", "dengan"))} ${payLabel}`}
        </button>
        <p className="text-ink-3 mt-3 text-center text-[12.5px]" suppressHydrationWarning>
          {t(tx("Stock reserved for you for", "Stok ditempah untuk anda selama"))} {pad(left / 60_000)}:{pad((left % 60_000) / 1000)} ·{" "}
          {t(tx("free swap if the shade isn't right", "tukar percuma jika rona tak sesuai"))}
        </p>
        <p className="text-ink-3 mt-6 flex items-center justify-center gap-1.5 text-[12px]">
          <Check className="h-3.5 w-3.5" /> {t(tx("Demo mode — no real payment is taken", "Mod demo — tiada bayaran sebenar diambil"))}
        </p>
      </aside>
    </div>
  );
}
