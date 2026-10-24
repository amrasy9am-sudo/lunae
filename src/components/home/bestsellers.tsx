"use client";

import { useState } from "react";
import { ProductCard } from "../product-card";
import { useT } from "../providers";
import { tx } from "@/lib/i18n";
import { products, productBySlug } from "@/data/catalogue";
import { useProfile } from "@/lib/store";
import type { Product } from "@/lib/types";

const by = (slugs: string[]) => slugs.map((s) => productBySlug(s)!).filter(Boolean) as Product[];

export function Bestsellers() {
  const t = useT();
  const profile = useProfile((s) => s.profile);
  const tabs = [
    {
      k: "you",
      l: tx("For you", "Untuk anda"),
      items: profile
        ? by(["eclipse-cushion", "moonbeam-skin-tint", "crescent-concealer", "nightbloom-lip-cheek-tint"])
        : by(["eclipse-cushion", "moonbeam-skin-tint", "nightbloom-lip-cheek-tint", "full-moon-glow-serum"]),
    },
    { k: "face", l: tx("Face", "Muka"), items: products.filter((p) => p.category === "face").slice(0, 4) },
    { k: "lips", l: tx("Lips", "Bibir"), items: products.filter((p) => p.category === "lips-cheeks").slice(0, 4) },
    { k: "skin", l: tx("Skincare", "Kulit"), items: products.filter((p) => p.category === "skincare").slice(0, 4) },
  ];
  const [k, setK] = useState("you");
  const cur = tabs.find((x) => x.k === k)!;
  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-ink-3">{t(tx("Most loved", "Paling digemari"))}</p>
          <h2 className="display-l mt-3">{t(tx("Bestsellers, matched to you", "Pilihan utama, dipadankan untuk anda"))}</h2>
        </div>
        <div role="tablist" aria-label={t(tx("Filter products", "Tapis produk"))} className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {tabs.map((x) => (
            <button key={x.k} role="tab" aria-selected={k === x.k} className="chip shrink-0" onClick={() => setK(x.k)}>
              {t(x.l)}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {cur.items.map((p, i) => (
          <ProductCard key={p.slug} p={p} priority={i < 2} />
        ))}
      </div>
    </div>
  );
}

export function NightEdit() {
  const t = useT();
  const tabs = [
    { k: "out", l: tx("Night out", "Keluar malam"), items: by(["moonglow-liquid-highlighter", "selene-matte-lipstick", "starlash-lift-mascara", "tide-setting-mist"]) },
    { k: "wedding", l: tx("Wedding guest", "Tetamu kenduri"), items: by(["eclipse-cushion", "nightbloom-lip-cheek-tint", "midnight-waterproof-liner", "tide-setting-mist"]) },
    { k: "routine", l: tx("Night routine", "Rutin malam"), items: by(["new-moon-gentle-cleanser", "full-moon-glow-serum", "nocturne-water-gel", "moonglow-liquid-highlighter"]) },
  ];
  const [k, setK] = useState("out");
  const cur = tabs.find((x) => x.k === k)!;
  const labels = ["Glow", "Night red", "Smudge-proof", "Lock it in"];
  return (
    <div>
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-glow">{t(tx("Tonight's edit", "Pilihan malam ini"))}</p>
          <h2 className="display-l mt-3">{t(tx("Made for after dark", "Dicipta untuk malam"))}</h2>
        </div>
        <div role="tablist" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
          {tabs.map((x) => (
            <button key={x.k} role="tab" aria-selected={k === x.k} className="chip shrink-0" onClick={() => setK(x.k)}>
              {t(x.l)}
            </button>
          ))}
        </div>
      </div>
      <div role="tabpanel" className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {cur.items.map((p, i) => (
          <ProductCard key={p.slug} p={p} label={k === "out" ? labels[i] : undefined} />
        ))}
      </div>
    </div>
  );
}
