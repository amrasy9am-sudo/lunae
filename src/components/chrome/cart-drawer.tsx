"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { Minus, Plus, Trash2, X, Truck } from "lucide-react";
import { useT } from "../providers";
import { L, Swatch } from "../ui";
import { useCart, useUI } from "@/lib/store";
import { productBySlug, products, FREE_SHIPPING, tintBg } from "@/data/catalogue";
import { quote } from "@/lib/pricing";
import { rm, rm2 } from "@/lib/format";
import { tx } from "@/lib/i18n";

export function FreeShippingMeter({ gap }: { gap: number }) {
  const t = useT();
  const pct = Math.min(100, ((FREE_SHIPPING - gap) / FREE_SHIPPING) * 100);
  return (
    <div>
      <p className="flex items-center gap-2 text-[13.5px]">
        <Truck className="text-accent-deep h-4 w-4" strokeWidth={1.5} />
        {gap > 0 ? (
          <span>
            {t(tx("You're", "Tinggal"))} <strong>{rm2(gap)}</strong> {t(tx("away from free delivery", "lagi untuk penghantaran percuma"))}
          </span>
        ) : (
          <span className="font-medium">{t(tx("You've unlocked free delivery (Peninsular)", "Penghantaran percuma dibuka (Semenanjung)"))}</span>
        )}
      </p>
      <div className="bg-surface-2 mt-2 h-1.5 overflow-hidden rounded-full">
        <div className="bg-accent h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function CartLines({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const cart = useCart();
  return (
    <ul className="divide-line divide-y">
      {cart.lines.map((l, i) => {
        const p = productBySlug(l.slug);
        if (!p) return null;
        const shade = p.shades.find((s) => s.name === l.shade);
        return (
          <li key={`${l.slug}-${l.shade}-${i}`} className="flex gap-4 py-4">
            <L href={`/products/${p.slug}`} className={`relative h-24 w-20 shrink-0 overflow-hidden rounded-[12px] ${tintBg[p.tint]}`}>
              <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="80px" className="object-contain p-2" />
            </L>
            <div className="flex min-w-0 flex-1 flex-col">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <L href={`/products/${p.slug}`} className="product-name block truncate text-[16px]">
                    {p.name}
                  </L>
                  {p.shades.length > 1 ? (
                    <label className="text-ink-3 mt-1 flex items-center gap-2 text-[13px]">
                      {shade && <Swatch hex={shade.hex} size={12} />}
                      <span className="sr-only">{t(tx("Shade", "Rona"))}</span>
                      <select
                        value={l.shade}
                        onChange={(e) => cart.setShade(i, e.target.value)}
                        className="text-ink-2 max-w-[10rem] truncate bg-transparent py-0.5 pr-1 text-[13px] underline-offset-2 hover:underline"
                      >
                        {p.shades.map((s) => (
                          <option key={s.name} value={s.name}>
                            {s.name}
                            {s.code ? ` · ${s.code}` : ""}
                          </option>
                        ))}
                      </select>
                    </label>
                  ) : (
                    <p className="text-ink-3 mt-1 text-[13px]">{l.shade ?? p.size}</p>
                  )}
                </div>
                <p className="shrink-0 text-[14px] font-semibold">{rm(p.price * l.qty)}</p>
              </div>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="border-line flex h-9 items-center rounded-full border">
                  <button
                    className="grid h-9 w-9 place-items-center"
                    aria-label={t(tx("Decrease quantity", "Kurangkan kuantiti"))}
                    onClick={() => (l.qty <= 1 ? cart.remove(i) : cart.setQty(i, l.qty - 1))}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-sm" aria-live="polite">
                    {l.qty}
                  </span>
                  <button className="grid h-9 w-9 place-items-center" aria-label={t(tx("Increase quantity", "Tambah kuantiti"))} onClick={() => cart.setQty(i, l.qty + 1)}>
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center gap-1">
                  {!compact && (
                    <button className="text-ink-3 hover:text-ink px-2 text-[12.5px] underline-offset-2 hover:underline" onClick={() => cart.saveForLater(i)}>
                      {t(tx("Save for later", "Simpan dulu"))}
                    </button>
                  )}
                  <button className="text-ink-3 hover:bg-surface-2 hover:text-ink grid h-9 w-9 place-items-center rounded-full" aria-label={t(tx("Remove", "Buang"))} onClick={() => cart.remove(i)}>
                    <Trash2 className="h-4 w-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export function CartDrawer() {
  const t = useT();
  const ui = useUI();
  const cart = useCart();
  const q = quote({ lines: cart.lines, voucher: cart.voucher });
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ui.cartOpen) return;
    const prev = document.activeElement as HTMLElement | null;
    panel.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && ui.set({ cartOpen: false });
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      prev?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ui.cartOpen]);

  if (!ui.cartOpen) return null;
  const suggestions = products.filter((p) => !cart.lines.some((l) => l.slug === p.slug) && p.wave === 1).slice(0, 3);

  return (
    <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label={t(tx("Your bag", "Troli anda"))}>
      <button className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" aria-label={t(tx("Close bag", "Tutup troli"))} onClick={() => ui.set({ cartOpen: false })} />
      <div
        ref={panel}
        tabIndex={-1}
        className="animate-fade-up bg-bg absolute inset-x-0 bottom-0 flex max-h-[92dvh] flex-col rounded-t-[24px] outline-none md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[460px] md:rounded-none md:rounded-l-[24px]"
      >
        <div className="border-line flex items-center justify-between border-b px-6 py-5">
          <h2 className="font-display text-[30px] leading-none">
            {t(tx("Your bag", "Troli anda"))} <span className="text-ink-3">({cart.lines.reduce((a, l) => a + l.qty, 0)})</span>
          </h2>
          <button className="hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full" aria-label={t(tx("Close", "Tutup"))} onClick={() => ui.set({ cartOpen: false })}>
            <X className="h-5 w-5" />
          </button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 py-16 text-center">
            <p className="font-display text-[28px] leading-tight">{t(tx("Your bag is empty. Shall we find your shade?", "Troli masih kosong. Jom cari rona anda?"))}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <L href="/shade-finder" className="btn btn-primary" onClick={() => ui.set({ cartOpen: false })}>
                {t(tx("Find my shade", "Cari rona saya"))}
              </L>
              <L href="/shop" className="btn btn-secondary" onClick={() => ui.set({ cartOpen: false })}>
                {t(tx("Shop all", "Lihat semua"))}
              </L>
            </div>
          </div>
        ) : (
          <>
            <div className="border-line border-b px-6 py-4">
              <FreeShippingMeter gap={q.freeShippingGap} />
            </div>
            <div className="flex-1 overflow-y-auto px-6">
              <CartLines compact />
              <div className="border-line border-t py-5">
                <p className="eyebrow text-ink-3">{t(tx("Complete the routine", "Lengkapkan rutin"))}</p>
                <ul className="mt-3 space-y-3">
                  {suggestions.map((p) => (
                    <li key={p.slug} className="flex items-center gap-3">
                      <span className={`relative h-14 w-12 shrink-0 overflow-hidden rounded-[10px] ${tintBg[p.tint]}`}>
                        <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="48px" className="object-contain p-1.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="product-name block truncate text-[15px]">{p.shortName}</span>
                        <span className="text-ink-3 text-[12.5px]">
                          {t(p.type)} · {rm(p.price)}
                        </span>
                      </span>
                      <button className="btn btn-sm btn-ghost" onClick={() => cart.add({ slug: p.slug, shade: p.shades[0]?.name, qty: 1 })}>
                        + {t(tx("Add", "Tambah"))}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="border-line bg-surface border-t px-6 pt-4 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              <dl className="space-y-1.5 text-[14px]">
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
                <div className="flex justify-between text-[16px] font-semibold">
                  <dt>{t(tx("Estimated total", "Anggaran jumlah"))}</dt>
                  <dd>{rm2(q.subtotal - q.bundle.amount)}</dd>
                </div>
              </dl>
              <p className="text-ink-3 mt-1 text-[12px]">{t(tx("Delivery, vouchers & points at checkout. Prices include SST.", "Penghantaran, baucar & mata di checkout. Harga termasuk SST."))}</p>
              <div className="mt-4 grid grid-cols-[1fr_1.4fr] gap-2">
                <L href="/cart" className="btn btn-secondary" onClick={() => ui.set({ cartOpen: false })}>
                  {t(tx("View bag", "Lihat troli"))}
                </L>
                <L href="/checkout" className="btn btn-primary" onClick={() => ui.set({ cartOpen: false })}>
                  {t(tx("Checkout", "Bayar"))}
                </L>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
