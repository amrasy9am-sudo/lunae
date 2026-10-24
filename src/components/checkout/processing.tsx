"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, Lock, QrCode, ShieldCheck, XCircle } from "lucide-react";
import { useHref, useLang, useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { rm2, dateFmt } from "@/lib/format";
import { useAccount, useCart, type OrderRecord } from "@/lib/store";
import { tierFor } from "@/lib/pricing";
import { etaFromDays } from "@/lib/orders";

interface Pending {
  order: {
    no: string;
    createdAt: string;
    amount: number;
    lines: OrderRecord["lines"];
    subtotal: number;
    discount: number;
    shippingFee: number;
    sst: number;
    pointsUsed: number;
    pointsEarned: number;
    courier: string;
    etaDays: [number, number];
    address: string;
    email: string;
    phone: string;
    payment: string;
    bank?: string;
    gift: boolean;
  };
  session: string;
}

export function Processing() {
  const t = useT();
  const lang = useLang();
  const href = useHref();
  const router = useRouter();
  const [p, setP] = useState<Pending | null>(null);
  const [state, setState] = useState<"gateway" | "verifying" | "failed" | "missing">("gateway");
  const cart = useCart();
  const acc = useAccount();

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("lunae-pending");
      if (!raw) return setState("missing");
      setP(JSON.parse(raw));
    } catch {
      setState("missing");
    }
  }, []);

  const pay = async (result: "success" | "failed") => {
    if (!p) return;
    setState("verifying");
    const res = await fetch("/api/webhooks/payments", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ session: p.session, result, amount: p.order.amount }),
    }).catch(() => null);
    const j = res ? await res.json().catch(() => null) : null;
    if (!j?.paid) return setState("failed");
    const o = p.order;
    const record: OrderRecord = {
      no: o.no,
      at: new Date().toISOString(),
      lines: o.lines,
      total: o.amount,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      sst: o.sst,
      pointsUsed: o.pointsUsed,
      pointsEarned: 0,
      status: "PAID",
      courier: o.courier,
      eta: etaFromDays(new Date().toISOString(), o.etaDays),
      address: o.address,
      email: o.email,
      phone: o.phone,
      payment: o.bank ?? o.payment,
      gift: o.gift,
    };
    if (acc.user) {
      const mult = tierFor(acc.orders.reduce((a, x) => a + x.total, 0)).mult;
      record.pointsEarned = Math.round(o.pointsEarned * mult);
      if (o.pointsUsed) acc.addPoints(-o.pointsUsed, `Redeemed on ${o.no}`);
      acc.addPoints(record.pointsEarned, `Earned on ${o.no}`);
    }
    acc.addOrder(record);
    try {
      localStorage.setItem(`lunae-order-${o.no}`, JSON.stringify(record));
      sessionStorage.removeItem("lunae-pending");
    } catch {}
    cart.clear();
    router.replace(href(`/order/${o.no}/thanks`));
  };

  if (state === "missing")
    return (
      <div className="mx-auto max-w-md py-24 text-center">
        <p className="font-display text-[30px]">{t(tx("No payment in progress.", "Tiada pembayaran sedang berjalan."))}</p>
        <L href="/checkout" className="btn btn-primary mt-6">
          {t(tx("Back to checkout", "Kembali ke checkout"))}
        </L>
      </div>
    );
  if (!p) return <div className="skeleton mx-auto my-24 h-80 max-w-md" />;

  return (
    <div className="mx-auto max-w-lg px-4 py-14">
      {state === "failed" ? (
        <div className="border-line bg-surface rounded-[24px] border p-8 text-center">
          <XCircle className="text-error mx-auto h-12 w-12" strokeWidth={1.5} />
          <p className="font-display mt-4 text-[30px] leading-tight">{t(tx("Payment didn't go through — you haven't been charged.", "Bayaran tidak berjaya — tiada caj dibuat."))}</p>
          <p className="text-ink-2 mt-2">{t(tx("Your bag is kept and your stock is still reserved. Try another method?", "Troli anda disimpan dan stok masih ditempah. Cuba kaedah lain?"))}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button className="btn btn-primary" onClick={() => setState("gateway")}>
              {t(tx("Retry", "Cuba lagi"))}
            </button>
            <L href="/checkout" className="btn btn-secondary">
              {t(tx("Change method", "Tukar kaedah"))}
            </L>
          </div>
        </div>
      ) : (
        <div className="border-line bg-surface overflow-hidden rounded-[24px] border shadow-[var(--shadow-e2)]">
          <div className="flex items-center justify-between bg-[#1d2b4f] px-6 py-4 text-white">
            <span className="flex items-center gap-2 text-[14px] font-semibold">
              <Lock className="h-4 w-4" /> {t(tx("Demo payment gateway", "Gerbang pembayaran demo"))}
            </span>
            <span className="text-[12px] opacity-75">{p.order.bank ?? p.order.payment.toUpperCase()}</span>
          </div>
          <div className="p-6">
            <p className="text-ink-3 text-[13px]">{t(tx("Merchant", "Pedagang"))}</p>
            <p className="font-semibold">LUNAE · {p.order.no}</p>
            <p className="text-ink-3 mt-4 text-[13px]">{t(tx("Amount", "Jumlah"))}</p>
            <p className="font-display text-[48px] leading-none">{rm2(p.order.amount)}</p>
            {p.order.payment === "duitnow" && (
              <div className="border-line mt-5 grid place-items-center rounded-[16px] border border-dashed p-6">
                <QrCode className="h-28 w-28" strokeWidth={1} />
                <p className="text-ink-3 mt-2 text-[12px]">{t(tx("Demo QR — not payable", "QR demo — tidak boleh dibayar"))}</p>
              </div>
            )}
            <p className="bg-tint-blush text-ink-2 mt-5 rounded-[12px] p-3 text-[13px]">
              {t(
                tx(
                  "Preview mode: no money moves. Choose an outcome to see how LUNAE verifies the signed payment webhook before marking your order paid.",
                  "Mod pratonton: tiada wang berpindah. Pilih keputusan untuk lihat bagaimana LUNAE mengesahkan webhook pembayaran bertandatangan sebelum menandakan pesanan dibayar.",
                ),
              )}
            </p>
            <div className="mt-6 grid gap-3">
              <button className="btn btn-primary" disabled={state === "verifying"} onClick={() => pay("success")}>
                {state === "verifying" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> {t(tx("Verifying signed webhook…", "Mengesahkan webhook bertandatangan…"))}
                  </>
                ) : (
                  t(tx("Approve payment", "Luluskan bayaran"))
                )}
              </button>
              <button className="btn btn-ghost" disabled={state === "verifying"} onClick={() => pay("failed")}>
                {t(tx("Simulate a failed payment", "Simulasi bayaran gagal"))}
              </button>
            </div>
            <p className="text-ink-3 mt-5 flex items-center gap-2 text-[12px]">
              <ShieldCheck className="h-4 w-4" /> {t(tx("Order created", "Pesanan dicipta"))} {dateFmt(p.order.createdAt, lang, { hour: "numeric", minute: "2-digit" })} ·{" "}
              {t(tx("unpaid orders cancel after 30 min", "pesanan tidak berbayar dibatalkan selepas 30 min"))}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
