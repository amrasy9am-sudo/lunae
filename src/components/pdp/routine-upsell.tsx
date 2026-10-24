"use client";

import Image from "next/image";
import { useState } from "react";
import { Check } from "lucide-react";
import type { Product } from "@/lib/types";
import { useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { productBySlug, tintBg } from "@/data/catalogue";
import { rm } from "@/lib/format";
import { useCart, useProfile, useUI } from "@/lib/store";
import { bestShadeFor } from "@/lib/match";

export function CompleteRoutine({ p, slugs }: { p: Product; slugs: string[] }) {
  const t = useT();
  const items = [p, ...slugs.map((s) => productBySlug(s)!).filter(Boolean)];
  const [on, setOn] = useState(items.map(() => true));
  const cart = useCart();
  const ui = useUI();
  const profile = useProfile((s) => s.profile);
  const chosen = items.filter((_, i) => on[i]);
  const total = chosen.reduce((a, x) => a + x.price, 0);
  const disc = chosen.length >= 4 ? 0.12 : chosen.length === 3 ? 0.1 : 0;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">
      <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {items.map((x, i) => (
          <li key={x.slug}>
            <label className="group block cursor-pointer">
              <span className={`relative block aspect-[4/5] overflow-hidden rounded-[18px] ${tintBg[x.tint]} ${on[i] ? "" : "opacity-50"}`}>
                <Image src={`/img/cutouts/${x.slug}.webp`} alt="" fill sizes="25vw" className="object-contain p-[18%]" />
                <input type="checkbox" className="sr-only" checked={on[i]} disabled={i === 0} onChange={() => setOn((o) => o.map((v, j) => (j === i ? !v : v)))} />
                <span className={`absolute top-3 right-3 grid h-7 w-7 place-items-center rounded-full border ${on[i] ? "border-primary bg-primary text-primary-ink" : "border-line bg-surface"}`}>
                  {on[i] && <Check className="h-4 w-4" />}
                </span>
              </span>
              <span className="mt-3 block">
                <L href={`/products/${x.slug}`} className="product-name hover:text-accent-deep text-[17px]">
                  {x.shortName}
                </L>
                <span className="text-ink-3 block text-[13px]">
                  {t(x.type)} · {rm(x.price)}
                </span>
              </span>
            </label>
          </li>
        ))}
      </ul>
      <div className="border-line bg-surface rounded-[20px] border p-6">
        <p className="eyebrow text-ink-3">{t(tx("Routine price", "Harga rutin"))}</p>
        <p className="mt-3 flex items-baseline gap-3">
          {disc > 0 && <s className="text-ink-3">{rm(total)}</s>}
          <span className="font-display text-[40px] leading-none">{rm(Math.round(total * (1 - disc) * 100) / 100)}</span>
        </p>
        <p className="text-sage mt-1 text-[13px]">
          {disc ? `${t(tx("Bundle", "Set"))} −${Math.round(disc * 100)}%` : t(tx("Choose 3+ items to unlock routine savings", "Pilih 3+ item untuk jimat rutin"))}
        </p>
        <button
          className="btn btn-primary mt-5 w-full"
          onClick={() => {
            chosen.forEach((x) => cart.add({ slug: x.slug, shade: (profile && bestShadeFor(x, profile)?.name) || x.shades[0]?.name, qty: 1 }));
            ui.notify(t(tx("Routine added to your bag", "Rutin dimasukkan ke troli")));
            ui.set({ cartOpen: true });
          }}
        >
          {t(tx("Add routine to bag", "Masukkan rutin ke troli"))}
        </button>
        <p className="text-ink-3 mt-2 text-center text-[12px]">{t(tx("Bundle discount applied at checkout", "Diskaun set dikenakan di checkout"))}</p>
      </div>
    </div>
  );
}
