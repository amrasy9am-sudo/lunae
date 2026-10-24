"use client";

import Image from "next/image";
import { Heart } from "lucide-react";
import type { Product } from "@/lib/types";
import { L, Swatch } from "./ui";
import { useT } from "./providers";
import { useCart, useProfile, useUI, useWishlist } from "@/lib/store";
import { rm } from "@/lib/format";
import { tintBg } from "@/data/catalogue";
import { tx } from "@/lib/i18n";
import { bestShadeFor } from "@/lib/match";

const BADGE: Record<string, { label: { en: string; ms: string }; cls: string }> = {
  bestseller: { label: tx("Bestseller", "Terlaris"), cls: "bg-surface text-accent-deep" },
  halal: { label: tx("Halal", "Halal"), cls: "bg-surface text-sage" },
  new: { label: tx("Wave 2 · 2028", "Gelombang 2 · 2028"), cls: "bg-surface text-ink-2" },
  refillable: { label: tx("Refillable", "Boleh isi semula"), cls: "bg-surface text-ink-2" },
  spf: { label: tx("SPF", "SPF"), cls: "bg-surface text-ink-2" },
};

export function ProductCard({ p, label, priority = false }: { p: Product; label?: string; priority?: boolean }) {
  const t = useT();
  const add = useCart((s) => s.add);
  const ui = useUI();
  const wish = useWishlist();
  const profile = useProfile((s) => s.profile);
  const match = profile ? bestShadeFor(p, profile) : null;
  const wished = wish.items.includes(p.slug);
  const badge = label ?? (match ? `${t(tx("Your match", "Padanan anda"))}: ${match.name}` : p.badges[0] === "halal" && p.badges[1] ? t(BADGE[p.badges[1]].label) : t(BADGE[p.badges[0]].label));

  const quickAdd = () => {
    const shade = match?.name ?? p.shades[0]?.name;
    add({ slug: p.slug, shade, qty: 1 });
    ui.notify(`${p.shortName}${shade ? ` · ${shade}` : ""} — ${t(tx("added to bag", "dimasukkan ke troli"))}`);
    ui.set({ cartOpen: true });
  };

  return (
    <article className="group relative flex flex-col">
      <div className={`relative overflow-hidden rounded-[var(--radius-lg)] ${tintBg[p.tint]} aspect-[4/5]`}>
        <L href={`/products/${p.slug}`} className="absolute inset-0 z-[1]" aria-label={p.name} />
        <Image
          src={`/img/cutouts/${p.slug}.webp`}
          alt={p.name}
          fill
          priority={priority}
          sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
          className="object-contain px-[16%] pt-[14%] pb-[22%] drop-shadow-[0_18px_22px_rgba(42,26,22,0.18)] transition-all duration-[1200ms] ease-[var(--ease-lunar)] group-hover:scale-[1.04] md:group-hover:opacity-0"
        />
        <Image
          src={`/img/products/${p.slug}.webp`}
          alt=""
          aria-hidden
          fill
          sizes="(min-width:1280px) 22vw, (min-width:768px) 30vw, 50vw"
          className="hidden object-cover opacity-0 transition-opacity duration-500 md:block md:group-hover:opacity-100"
        />
        <span className="badge bg-surface/90 text-ink-2 absolute top-3 left-3 z-[2] max-w-[calc(100%-4rem)] truncate backdrop-blur">{badge}</span>
        <button
          type="button"
          onClick={() => wish.toggle(p.slug)}
          aria-pressed={wished}
          aria-label={t(tx("Save to wishlist", "Simpan ke senarai hajat"))}
          className="bg-surface/80 hover:bg-surface absolute top-3 right-3 z-[2] grid h-9 w-9 place-items-center rounded-full backdrop-blur transition"
        >
          <Heart className={`h-[18px] w-[18px] ${wished ? "fill-accent stroke-accent" : ""}`} strokeWidth={1.5} />
        </button>
        <div className="absolute inset-x-3 bottom-3 z-[2] translate-y-0 opacity-100 transition-all duration-200 md:translate-y-2 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100">
          <button type="button" onClick={quickAdd} className="btn btn-sm border-ink/80 bg-surface/95 text-ink hover:bg-primary hover:text-primary-ink w-full border backdrop-blur">
            {t(tx("Quick add", "Tambah pantas"))}
          </button>
        </div>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="product-name text-[19px] sm:text-[21px]">
            <L href={`/products/${p.slug}`} className="hover:text-accent-deep">
              {p.shortName}
            </L>
          </h3>
          <p className="text-ink-3 mt-0.5 text-sm">
            {t(p.type)} · {p.size}
          </p>
        </div>
        <p className="shrink-0 text-[15px] font-semibold">{rm(p.price)}</p>
      </div>
      <div className="mt-2.5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {p.shades.slice(0, 5).map((s) => (
            <Swatch key={s.name} hex={s.hex} size={14} title={s.name} selected={match?.name === s.name} />
          ))}
          {p.shades.length > 5 && <span className="text-ink-3 ml-0.5 text-xs">+{p.shades.length - 5}</span>}
        </div>
        <span className="text-sage text-xs font-medium">{t(tx("Halal", "Halal"))}</span>
      </div>
    </article>
  );
}
