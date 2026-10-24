"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { GripVertical, Moon, Plus, Share2, Sun, X, RefreshCw } from "lucide-react";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";
import { productBySlug, products, tintBg } from "@/data/catalogue";
import { rm } from "@/lib/format";
import { useCart, useProfile, useUI } from "@/lib/store";
import { bestShadeFor } from "@/lib/match";

type Slot = "am" | "pm";
const ORDER = ["cleanse", "serum", "moisturise", "spf", "base", "concealer", "powder", "cheeks", "highlight", "lips", "brows", "liner", "mascara", "setting"];
const pct = (n: number) => (n >= 4 ? 0.12 : n === 3 ? 0.1 : 0);

function Column({
  slot,
  list,
  over,
  setOver,
  add,
  remove,
  setPicker,
}: {
  slot: Slot;
  list: string[];
  over: Slot | null;
  setOver: (s: Slot | null) => void;
  add: (s: Slot, slug: string) => void;
  remove: (s: Slot, slug: string) => void;
  setPicker: (s: Slot) => void;
}) {
  const t = useT();
  const dark = slot === "pm";
  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setOver(slot);
      }}
      onDragLeave={() => setOver(null)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(null);
        const slug = e.dataTransfer.getData("text/plain");
        if (slug) add(slot, slug);
      }}
      className={`rounded-[24px] p-6 transition ${dark ? "bg-night text-moon" : "bg-surface"} ${over === slot ? "ring-accent ring-2" : "shadow-[var(--shadow-e2)]"}`}
    >
      <p className="eyebrow flex items-center gap-2">
        {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} {dark ? t(tx("PM · Moonlight", "Malam · Moonlight")) : t(tx("AM · Sun-up", "Pagi · Terbit"))}
      </p>
      <ol className={`mt-4 min-h-[200px] divide-y ${dark ? "divide-mist" : "divide-line"}`}>
        {list.map((s, i) => {
          const p = productBySlug(s)!;
          return (
            <li key={s} draggable onDragStart={(e) => e.dataTransfer.setData("text/plain", s)} className="flex items-center gap-3 py-3">
              <GripVertical className="h-4 w-4 opacity-40" />
              <span className="w-3 text-[12px] opacity-60">{i + 1}</span>
              <span className={`relative h-12 w-11 shrink-0 overflow-hidden rounded-[8px] ${dark ? "bg-veil" : tintBg[p.tint]}`}>
                <Image src={`/img/cutouts/${s}.webp`} alt="" fill sizes="44px" className="object-contain p-1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="product-name block">{p.shortName}</span>
                <span className="block truncate text-[12.5px] opacity-60">{t(p.type)}</span>
              </span>
              <span className="text-[14px] font-semibold">{rm(p.price)}</span>
              <button aria-label={t(tx("Remove", "Buang"))} className="grid h-8 w-8 place-items-center rounded-full opacity-60 hover:opacity-100" onClick={() => remove(slot, s)}>
                <X className="h-4 w-4" />
              </button>
            </li>
          );
        })}
        {list.length === 0 && <li className="py-10 text-center text-[14px] opacity-60">{t(tx("Drag products here", "Seret produk ke sini"))}</li>}
      </ol>
      <button
        className={`mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-dashed py-3 text-[13px] ${dark ? "border-mist" : "border-line"}`}
        onClick={() => setPicker(slot)}
      >
        <Plus className="h-4 w-4" /> {t(tx("Add a step", "Tambah langkah"))}
      </button>
    </div>
  );
}

export function RoutineBuilder() {
  const t = useT();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const cart = useCart();
  const ui = useUI();
  const profile = useProfile((s) => s.profile);
  const [am, setAm] = useState<string[]>([]);
  const [pm, setPm] = useState<string[]>([]);
  const [over, setOver] = useState<Slot | null>(null);
  const [picker, setPicker] = useState<Slot | null>(null);

  useEffect(() => {
    const qa = sp.get("am");
    const qp = sp.get("pm");
    if (qa || qp) {
      setAm((qa ?? "").split(",").filter((s) => productBySlug(s)));
      setPm((qp ?? "").split(",").filter((s) => productBySlug(s)));
      return;
    }
    try {
      const saved = JSON.parse(localStorage.getItem("lunae-routine") ?? "null");
      if (saved) {
        setAm(saved.am ?? []);
        setPm(saved.pm ?? []);
        return;
      }
    } catch {}
    setAm(["new-moon-gentle-cleanser", "full-moon-glow-serum", "daybreak-sun-gel", "eclipse-cushion"]);
    setPm(["new-moon-gentle-cleanser", "full-moon-glow-serum", "nocturne-water-gel"]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sortSteps = (l: string[]) => [...l].sort((a, b) => ORDER.indexOf(productBySlug(a)!.sub) - ORDER.indexOf(productBySlug(b)!.sub));
  const add = (slot: Slot, slug: string) => {
    const set = slot === "am" ? setAm : setPm;
    set((l) => (l.includes(slug) ? l : sortSteps([...l, slug])));
  };
  const remove = (slot: Slot, slug: string) => (slot === "am" ? setAm : setPm)((l) => l.filter((x) => x !== slug));

  const unique = [...new Set([...am, ...pm])];
  const total = unique.reduce((a, s) => a + productBySlug(s)!.price, 0);
  const disc = pct(unique.length);

  return (
    <div className="grid gap-10 lg:grid-cols-[300px_1fr]">
      <aside>
        <p className="eyebrow text-ink-3">{t(tx("Drag into a routine", "Seret ke rutin"))}</p>
        <ul className="mt-4 grid max-h-[640px] grid-cols-2 gap-2 overflow-y-auto pr-1 lg:grid-cols-1">
          {products.map((p) => (
            <li
              key={p.slug}
              draggable
              onDragStart={(e) => e.dataTransfer.setData("text/plain", p.slug)}
              className="border-line bg-surface flex cursor-grab items-center gap-3 rounded-[14px] border p-2 active:cursor-grabbing"
            >
              <span className={`relative h-12 w-10 shrink-0 overflow-hidden rounded-[8px] ${tintBg[p.tint]}`}>
                <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="40px" className="object-contain p-1" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="product-name block truncate text-[14.5px]">{p.shortName}</span>
                <span className="text-ink-3 block text-[12px]">{rm(p.price)}</span>
              </span>
              <span className="hidden gap-1 lg:flex">
                <button className="hover:bg-surface-2 grid h-7 w-7 place-items-center rounded-full" aria-label={`${p.shortName} → AM`} onClick={() => add("am", p.slug)}>
                  <Sun className="h-3.5 w-3.5" />
                </button>
                <button className="hover:bg-surface-2 grid h-7 w-7 place-items-center rounded-full" aria-label={`${p.shortName} → PM`} onClick={() => add("pm", p.slug)}>
                  <Moon className="h-3.5 w-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      </aside>
      <div>
        <div className="grid gap-5 md:grid-cols-2">
          <Column slot="am" list={am} over={over} setOver={setOver} add={add} remove={remove} setPicker={setPicker} />
          <Column slot="pm" list={pm} over={over} setOver={setOver} add={add} remove={remove} setPicker={setPicker} />
        </div>
        <div className="border-line bg-surface mt-6 flex flex-col gap-5 rounded-[24px] border p-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-ink-3 text-[14px]">
              {unique.length} {t(tx("products (one of each)", "produk (satu setiap satu)"))} ·{" "}
              {disc ? `${t(tx("Bundle", "Set"))} −${disc * 100}%` : t(tx("3+ products unlock −10%, 4+ unlock −12%", "3+ produk dapat −10%, 4+ dapat −12%"))}
            </p>
            <p className="mt-1">
              {disc > 0 && <s className="text-ink-3 mr-2">{rm(total)}</s>}
              <span className="font-display text-[40px] leading-none">{rm(Math.round(total * (1 - disc) * 100) / 100)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                try {
                  localStorage.setItem("lunae-routine", JSON.stringify({ am, pm }));
                } catch {}
                const q = `?am=${am.join(",")}&pm=${pm.join(",")}`;
                router.replace(pathname + q, { scroll: false });
                const url = window.location.origin + pathname + q;
                if (navigator.share) navigator.share({ title: "My LUNAE routine", url }).catch(() => {});
                else navigator.clipboard?.writeText(url).then(() => ui.notify(t(tx("Link copied", "Pautan disalin"))));
              }}
            >
              <Share2 className="h-4 w-4" /> {t(tx("Save & share", "Simpan & kongsi"))}
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => ui.notify(t(tx("Refill subscriptions open within 6 months of launch.", "Langganan isi semula dibuka dalam 6 bulan selepas pelancaran.")), "info")}
            >
              <RefreshCw className="h-4 w-4" /> {t(tx("Auto-refill", "Isi semula automatik"))}
            </button>
            <button
              className="btn btn-primary btn-sm"
              disabled={!unique.length}
              onClick={() => {
                unique.forEach((s) => {
                  const p = productBySlug(s)!;
                  cart.add({ slug: s, shade: (profile && bestShadeFor(p, profile)?.name) || p.shades[0]?.name, qty: 1 });
                });
                ui.set({ cartOpen: true });
              }}
            >
              {t(tx("Add routine to bag", "Masukkan rutin ke troli"))}
            </button>
          </div>
        </div>
      </div>
      {picker && (
        <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true">
          <button className="absolute inset-0 bg-black/40" onClick={() => setPicker(null)} aria-label={t(tx("Close", "Tutup"))} />
          <div className="animate-fade-up bg-bg absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-[24px] p-5 md:inset-x-auto md:top-1/2 md:bottom-auto md:left-1/2 md:w-[520px] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px]">
            <p className="font-display text-[28px]">{picker === "am" ? t(tx("Add to AM", "Tambah ke pagi")) : t(tx("Add to PM", "Tambah ke malam"))}</p>
            <ul className="mt-4 grid grid-cols-2 gap-2">
              {products.map((p) => (
                <li key={p.slug}>
                  <button className="border-line hover:border-ink flex w-full items-center gap-2 rounded-[12px] border p-2 text-left" onClick={() => (add(picker, p.slug), setPicker(null))}>
                    <span className={`relative h-10 w-9 shrink-0 overflow-hidden rounded-md ${tintBg[p.tint]}`}>
                      <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="36px" className="object-contain p-1" />
                    </span>
                    <span className="product-name truncate text-[14px]">{p.shortName}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
