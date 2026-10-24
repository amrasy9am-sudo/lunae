"use client";

import Image from "next/image";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";
import { productBySlug, tintBg } from "@/data/catalogue";
import { rm } from "@/lib/format";
import { useCart, useProfile, useUI } from "@/lib/store";
import { bestShadeFor } from "@/lib/match";
import type { L10n } from "@/lib/types";

export function SetCard({ s }: { s: { slug: string; name: L10n; blurb: L10n; items: string[]; discount: number } }) {
  const t = useT();
  const cart = useCart();
  const ui = useUI();
  const profile = useProfile((x) => x.profile);
  const ps = s.items.map((i) => productBySlug(i)!);
  const total = ps.reduce((a, p) => a + p.price, 0);
  return (
    <article className="border-line bg-surface flex flex-col rounded-[24px] border p-6">
      <div className="grid grid-cols-4 gap-2">
        {ps.map((p) => (
          <span key={p.slug} className={`relative aspect-[3/4] overflow-hidden rounded-[12px] ${tintBg[p.tint]}`}>
            <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="100px" className="object-contain p-2" />
          </span>
        ))}
      </div>
      <h3 className="product-name mt-6 text-[24px]">{t(s.name)}</h3>
      <p className="text-ink-2 mt-1 text-[14.5px]">{t(s.blurb)}</p>
      <p className="text-ink-3 mt-3 text-[13.5px]">{ps.map((p) => p.shortName).join(" + ")}</p>
      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <p>
          <s className="text-ink-3 mr-2">{rm(total)}</s>
          <span className="font-display text-[34px] leading-none">{rm(Math.round(total * (1 - s.discount)))}</span>
          <span className="text-sage ml-2 text-[13px] font-semibold">−{Math.round(s.discount * 100)}%</span>
        </p>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            ps.forEach((p) => cart.add({ slug: p.slug, shade: (profile && bestShadeFor(p, profile)?.name) || p.shades[0]?.name, qty: 1 }));
            ui.notify(`${t(s.name)} — ${t(tx("added to bag", "dimasukkan ke troli"))}`);
            ui.set({ cartOpen: true });
          }}
        >
          {t(tx("Add set", "Tambah set"))}
        </button>
      </div>
    </article>
  );
}
