"use client";

import Image from "next/image";
import { useState } from "react";
import { useT } from "./providers";
import { L } from "./ui";
import { CartLines, FreeShippingMeter } from "./chrome/cart-drawer";
import { tx } from "@/lib/i18n";
import { useCart } from "@/lib/store";
import { quote, VOUCHERS } from "@/lib/pricing";
import { rm2 } from "@/lib/format";
import { productBySlug, tintBg } from "@/data/catalogue";

export function CartPage() {
  const t = useT();
  const cart = useCart();
  const [v, setV] = useState(cart.voucher);
  const q = quote({ lines: cart.lines, voucher: cart.voucher });
  return (
    <div>
      <h1 className="display-l">{t(tx("Your bag", "Troli anda"))}</h1>
      {cart.lines.length === 0 ? (
        <div className="border-line mt-10 rounded-[24px] border border-dashed p-14 text-center">
          <p className="font-display text-[32px]">{t(tx("Your bag is empty. Shall we find your shade?", "Troli masih kosong. Jom cari rona anda?"))}</p>
          <div className="mt-6 flex justify-center gap-3">
            <L href="/shade-finder" className="btn btn-primary">
              {t(tx("Find my shade", "Cari rona saya"))}
            </L>
            <L href="/shop" className="btn btn-secondary">
              {t(tx("Shop all", "Lihat semua"))}
            </L>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-10 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <div className="border-line bg-surface rounded-[20px] border p-5">
              <FreeShippingMeter gap={q.freeShippingGap} />
            </div>
            <div className="mt-4">
              <CartLines />
            </div>
            <div className="bg-tint-sage mt-4 rounded-[16px] p-4 text-[14px]">
              {t(tx("Free samples: we add two sachets in your matched shade to every order.", "Sampel percuma: kami tambah dua sachet dalam rona padanan anda untuk setiap pesanan."))}
            </div>
          </div>
          <aside className="border-line bg-surface self-start rounded-[24px] border p-6 lg:sticky lg:top-28">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                cart.setVoucher(v.trim().toUpperCase());
              }}
            >
              <input className="field flex-1" placeholder={t(tx("Voucher code", "Kod baucar"))} value={v} onChange={(e) => setV(e.target.value)} aria-invalid={!!q.voucherError} />
              <button className="btn btn-primary">{t(tx("Apply", "Guna"))}</button>
            </form>
            {q.voucherError ? (
              <p className="text-error mt-2 text-[13px]">
                {q.voucherError === "min" ? t(tx("Minimum spend not reached.", "Belanja minimum belum dicapai.")) : t(tx("Invalid code.", "Kod tidak sah."))}
              </p>
            ) : (
              <p className="text-ink-3 mt-2 text-[12.5px]">
                {t(tx("Preview codes:", "Kod pratonton:"))} {Object.keys(VOUCHERS).join(" · ")}
              </p>
            )}
            <dl className="mt-6 space-y-2 text-[15px]">
              <div className="flex justify-between">
                <dt>{t(tx("Subtotal", "Jumlah kecil"))}</dt>
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
                  <dt>{cart.voucher}</dt>
                  <dd>−{rm2(q.voucherDiscount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt>{t(tx("Delivery (Peninsular)", "Penghantaran (Semenanjung)"))}</dt>
                <dd>{q.shippingFee ? rm2(q.shippingFee) : t(tx("FREE", "PERCUMA"))}</dd>
              </div>
            </dl>
            <div className="border-line mt-5 flex items-baseline justify-between border-t pt-5">
              <span className="font-semibold">{t(tx("Total", "Jumlah"))}</span>
              <span className="font-display text-[40px] leading-none">{rm2(q.total)}</span>
            </div>
            <L href="/checkout" className="btn btn-primary mt-6 w-full">
              {t(tx("Checkout", "Bayar"))}
            </L>
            <p className="text-ink-3 mt-3 text-center text-[12.5px]">{t(tx("FPX · cards · DuitNow · e-wallets · Atome", "FPX · kad · DuitNow · e-dompet · Atome"))}</p>
          </aside>
          {cart.saved.length > 0 && (
            <div className="lg:col-span-2">
              <p className="eyebrow text-ink-3">{t(tx("Saved for later", "Disimpan untuk kemudian"))}</p>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {cart.saved.map((l, i) => {
                  const p = productBySlug(l.slug)!;
                  return (
                    <li key={i} className="border-line bg-surface flex items-center gap-3 rounded-[16px] border p-3">
                      <span className={`relative h-16 w-14 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                        <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="56px" className="object-contain p-1.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="product-name block truncate">{p.shortName}</span>
                        <span className="text-ink-3 text-[12.5px]">{l.shade}</span>
                      </span>
                      <button className="btn btn-sm btn-ghost" onClick={() => cart.moveToBag(i)}>
                        {t(tx("Move to bag", "Ke troli"))}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
