"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Play, SlidersHorizontal, X, Grid2x2, Grid3x3 } from "lucide-react";
import { ProductCard } from "../product-card";
import { useT } from "../providers";
import { L, Toggle } from "../ui";
import { tx } from "@/lib/i18n";
import { concerns, products } from "@/data/catalogue";
import { useProfile } from "@/lib/store";
import { bestShadeFor, isMyShade } from "@/lib/match";
import { deltaE2000, hexToLab } from "@/lib/color";
import type { CategoryKey, Product } from "@/lib/types";
import { dateFmt } from "@/lib/format";
import { useLang } from "../providers";

const SUBS: Record<string, { en: string; ms: string }> = {
  base: tx("Base & cushion", "Alas & kusyen"),
  concealer: tx("Concealer", "Concealer"),
  powder: tx("Powder", "Bedak"),
  setting: tx("Setting", "Penetap"),
  lips: tx("Lips", "Bibir"),
  cheeks: tx("Cheeks", "Pipi"),
  highlight: tx("Highlight", "Penyerlah"),
  brows: tx("Brows", "Kening"),
  liner: tx("Liner", "Pengaris"),
  mascara: tx("Mascara", "Maskara"),
  cleanse: tx("Cleanse", "Cuci"),
  serum: tx("Serum", "Serum"),
  moisturise: tx("Moisturise", "Lembap"),
  spf: tx("Sun care", "Pelindung matahari"),
};
const FINISHES = ["matte", "soft-matte", "satin", "natural", "dewy", "glow"] as const;
const UNDERTONES = ["cool", "neutral", "warm", "olive"] as const;
const UT_L: Record<string, { en: string; ms: string }> = { cool: tx("Cool", "Sejuk"), neutral: tx("Neutral", "Neutral"), warm: tx("Warm", "Hangat"), olive: tx("Olive", "Zaitun") };
const FIN_L: Record<string, { en: string; ms: string }> = {
  matte: tx("Matte", "Matte"),
  "soft-matte": tx("Soft-matte", "Soft-matte"),
  satin: tx("Satin", "Satin"),
  natural: tx("Natural", "Semula jadi"),
  dewy: tx("Dewy", "Berembun"),
  glow: tx("Glow", "Bersinar"),
};
const SORTS = [
  { k: "match", l: tx("Best match for me", "Padanan terbaik untuk saya") },
  { k: "best", l: tx("Bestselling", "Terlaris") },
  { k: "new", l: tx("Newest", "Terbaru") },
  { k: "price-asc", l: tx("Price: low to high", "Harga: rendah ke tinggi") },
  { k: "price-desc", l: tx("Price: high to low", "Harga: tinggi ke rendah") },
];
const BEST_ORDER = [
  "eclipse-cushion",
  "nightbloom-lip-cheek-tint",
  "moonbeam-skin-tint",
  "daybreak-sun-gel",
  "full-moon-glow-serum",
  "tide-setting-mist",
  "selene-matte-lipstick",
  "crescent-concealer",
  "starlash-lift-mascara",
  "arc-brow-gel",
];

export function PLP({ category }: { category?: CategoryKey }) {
  const t = useT();
  const lang = useLang();
  const sp = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { profile, myShadesOnly, setMyShadesOnly } = useProfile();
  const [sheet, setSheet] = useState(false);
  const [shown, setShown] = useState(9);
  const [dense, setDense] = useState(false);

  const list = (k: string) => (sp.get(k) ?? "").split(",").filter(Boolean);
  const subs = list("type");
  const cons = list("concern");
  const uts = list("undertone");
  const fins = list("finish");
  const certs = list("cert");
  const max = Number(sp.get("max") ?? 0) || 0;
  const sort = sp.get("sort") ?? (profile ? "match" : "best");
  const nightEdit = sp.get("edit") === "night";

  const update = (k: string, v: string[] | string | null) => {
    const n = new URLSearchParams(sp.toString());
    const val = Array.isArray(v) ? v.join(",") : v;
    if (!val) n.delete(k);
    else n.set(k, val);
    router.replace(`${pathname}${n.toString() ? `?${n}` : ""}`, { scroll: false });
    setShown(9);
  };
  const toggleIn = (k: string, cur: string[], v: string) => update(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);

  const scope = products.filter((p) => !category || p.category === category);
  const filtered = useMemo(() => {
    let r = scope.filter(
      (p) =>
        (!subs.length || subs.includes(p.sub)) &&
        (!cons.length || cons.some((c) => p.concerns.includes(c as Product["concerns"][number]))) &&
        (!fins.length || fins.includes(p.finish)) &&
        (!uts.length || p.shades.some((s) => s.undertone && uts.includes(s.undertone))) &&
        (!max || p.price <= max) &&
        (!certs.includes("fragrance-free") || p.fragranceFree) &&
        (!certs.includes("refillable") || p.refillable) &&
        (!nightEdit || p.night),
    );
    if (myShadesOnly && profile) r = r.filter((p) => isMyShade(p, profile));
    const score = (p: Product) => {
      if (!profile) return 0;
      const s = bestShadeFor(p, profile);
      if (!s) return 20;
      return deltaE2000(hexToLab(profile.hex), hexToLab(s.hex));
    };
    const sorted = [...r];
    if (sort === "match") sorted.sort((a, b) => score(a) - score(b) || BEST_ORDER.indexOf(a.slug) - BEST_ORDER.indexOf(b.slug));
    if (sort === "best") sorted.sort((a, b) => (BEST_ORDER.indexOf(a.slug) + 1 || 99) - (BEST_ORDER.indexOf(b.slug) + 1 || 99));
    if (sort === "new") sorted.sort((a, b) => b.wave - a.wave);
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    return sorted;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp, profile, myShadesOnly, category]);

  const active = [
    ...subs.map((v) => ({ k: "type", v, l: t(SUBS[v]), cur: subs })),
    ...cons.map((v) => ({ k: "concern", v, l: t(concerns.find((c) => c.key === v)?.name ?? tx(v, v)), cur: cons })),
    ...uts.map((v) => ({ k: "undertone", v, l: t(UT_L[v]), cur: uts })),
    ...fins.map((v) => ({ k: "finish", v, l: t(FIN_L[v]), cur: fins })),
    ...certs.map((v) => ({ k: "cert", v, l: v, cur: certs })),
  ];
  const availableSubs = [...new Set(scope.map((p) => p.sub))];
  const availableConcerns = concerns.filter((c) => scope.some((p) => p.concerns.includes(c.key)));
  const count = (pred: (p: Product) => boolean) => scope.filter(pred).length;

  const Filters = (
    <div className="space-y-1 text-[15px]">
      <Group title={t(tx("Category", "Kategori"))}>
        {availableSubs.map((s) => (
          <Check key={s} checked={subs.includes(s)} onChange={() => toggleIn("type", subs, s)} label={t(SUBS[s])} n={count((p) => p.sub === s)} />
        ))}
      </Group>
      <Group title={t(tx("Concern", "Keperluan"))}>
        {availableConcerns.map((c) => (
          <Check key={c.key} checked={cons.includes(c.key)} onChange={() => toggleIn("concern", cons, c.key)} label={t(c.name)} n={count((p) => p.concerns.includes(c.key))} />
        ))}
      </Group>
      {scope.some((p) => p.shades.some((s) => s.undertone)) && (
        <Group title={t(tx("Undertone", "Undertone"))}>
          <div className="flex flex-wrap gap-2 pt-1">
            {UNDERTONES.map((u) => (
              <button key={u} className="chip" aria-pressed={uts.includes(u)} onClick={() => toggleIn("undertone", uts, u)}>
                {t(UT_L[u])}
              </button>
            ))}
          </div>
        </Group>
      )}
      <Group title={t(tx("Finish", "Kemasan"))}>
        <div className="flex flex-wrap gap-2 pt-1">
          {FINISHES.filter((f) => scope.some((p) => p.finish === f)).map((f) => (
            <button key={f} className="chip" aria-pressed={fins.includes(f)} onClick={() => toggleIn("finish", fins, f)}>
              {t(FIN_L[f])}
            </button>
          ))}
        </div>
      </Group>
      <Group title={t(tx("Price", "Harga"))}>
        <label className="block pt-2">
          <span className="sr-only">{t(tx("Maximum price", "Harga maksimum"))}</span>
          <input type="range" min={39} max={89} step={5} value={max || 89} onChange={(e) => update("max", e.target.value === "89" ? null : e.target.value)} className="w-full accent-[var(--ink)]" />
          <span className="text-ink-3 mt-1 flex justify-between text-[13px]">
            <span>RM39</span>
            <span>
              {t(tx("up to", "hingga"))} RM{max || 89}
            </span>
          </span>
        </label>
      </Group>
      <Group title={t(tx("Certification", "Pensijilan"))}>
        <Check checked disabled label={t(tx("Halal (MS 2634)", "Halal (MS 2634)"))} n={scope.length} onChange={() => {}} />
        <Check
          checked={certs.includes("fragrance-free")}
          onChange={() => toggleIn("cert", certs, "fragrance-free")}
          label={t(tx("Fragrance-free", "Bebas pewangi"))}
          n={count((p) => p.fragranceFree)}
        />
        <Check checked={certs.includes("refillable")} onChange={() => toggleIn("cert", certs, "refillable")} label={t(tx("Refillable", "Boleh isi semula"))} n={count((p) => p.refillable)} />
      </Group>
    </div>
  );

  const editorial = (
    <div key="lab" className="starfield bg-night text-moon relative flex min-h-[380px] flex-col justify-between overflow-hidden rounded-[24px] p-7">
      <p className="eyebrow text-glow">Sweat-Test Lab</p>
      <div>
        <p className="font-display text-[44px] leading-[1.02]">
          8 hours.
          <br />
          33°C.
          <br />
          <em>Zero slide.*</em>
        </p>
        <p className="text-halo mt-4 text-[14px]">{t(tx("See the climate-chamber protocol behind every claim.", "Lihat protokol kebuk iklim di sebalik setiap dakwaan."))}</p>
        <L href="/lab" className="btn btn-sm border-mist text-moon hover:border-moon mt-6 border">
          <Play className="h-3.5 w-3.5" /> {t(tx("Watch the test", "Tonton ujian"))}
        </L>
      </div>
    </div>
  );

  const cards = filtered.slice(0, shown).map((p, i) => <ProductCard key={p.slug} p={p} priority={i < 3} />);
  if (cards.length >= 2 && (!category || category === "face")) cards.splice(2, 0, editorial);

  return (
    <div>
      {/* shade profile card */}
      <div className="border-line bg-surface mb-8 flex flex-col gap-4 rounded-[20px] border p-5 shadow-[var(--shadow-e1)] sm:flex-row sm:items-center sm:justify-between">
        {profile ? (
          <>
            <div className="flex items-center gap-4">
              <span className="h-12 w-12 shrink-0 rounded-full" style={{ background: profile.hex }} />
              <div>
                <p className="eyebrow text-sage">{t(tx("Your shade profile", "Profil rona anda"))}</p>
                <p className="mt-1 font-semibold">
                  {profile.shade} · {profile.code} · {t(UT_L[profile.undertone])} {t(tx("undertone", "undertone"))}
                </p>
                <p className="text-ink-3 text-[13px]">
                  {t(tx("From AI Shade Finder", "Dari Pencari Rona AI"))} · {dateFmt(profile.at, lang, { day: "numeric", month: "short" })}
                </p>
              </div>
            </div>
            <label className="flex items-center gap-3 text-[14px]">
              <Toggle checked={myShadesOnly} onChange={setMyShadesOnly} label={t(tx("Show my shades only", "Tunjuk rona saya sahaja"))} />
              {t(tx("Show my shades only", "Tunjuk rona saya sahaja"))}
            </label>
          </>
        ) : (
          <>
            <div>
              <p className="eyebrow text-sage">{t(tx("No shade profile yet", "Belum ada profil rona"))}</p>
              <p className="mt-1 text-[15px]">
                {t(tx("Find your shade in 60 seconds and we'll sort every product by your match.", "Cari rona anda dalam 60 saat dan kami susun setiap produk ikut padanan anda."))}
              </p>
            </div>
            <L href="/shade-finder" className="btn btn-primary btn-sm shrink-0">
              {t(tx("Find my shade", "Cari rona saya"))}
            </L>
          </>
        )}
      </div>

      {/* filter bar */}
      <div className="border-line flex flex-wrap items-center gap-3 border-y py-4">
        <button className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.12em] uppercase lg:pointer-events-none" onClick={() => setSheet(true)}>
          <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Filters", "Penapis"))}
        </button>
        {nightEdit && (
          <button className="chip" data-active="true" onClick={() => update("edit", null)}>
            {t(tx("Night edit", "Pilihan malam"))} <X className="h-3.5 w-3.5" />
          </button>
        )}
        {active.map((a) => (
          <button key={a.k + a.v} className="chip" data-active="true" onClick={() => toggleIn(a.k, a.cur, a.v)}>
            {a.l} <X className="h-3.5 w-3.5" />
          </button>
        ))}
        {(active.length > 0 || nightEdit || max > 0) && (
          <button className="text-ink-3 hover:text-ink text-[13.5px] underline underline-offset-2" onClick={() => router.replace(pathname, { scroll: false })}>
            {t(tx("Clear all", "Kosongkan"))}
          </button>
        )}
        <div className="ml-auto flex items-center gap-4 text-[14px]">
          <span className="text-ink-3" aria-live="polite">
            {filtered.length} {t(tx("results", "hasil"))}
          </span>
          <label className="flex items-center gap-1.5">
            <span className="text-ink-3">{t(tx("Sort:", "Susun:"))}</span>
            <select value={sort} onChange={(e) => update("sort", e.target.value)} className="bg-transparent font-semibold">
              {SORTS.filter((s) => s.k !== "match" || profile).map((s) => (
                <option key={s.k} value={s.k}>
                  {t(s.l)}
                </option>
              ))}
            </select>
          </label>
          <button
            className="hover:bg-surface-2 hidden h-8 w-8 place-items-center rounded-md lg:grid"
            aria-label={t(tx("Toggle grid density", "Tukar kepadatan grid"))}
            onClick={() => setDense((d) => !d)}
          >
            {dense ? <Grid3x3 className="h-4 w-4" /> : <Grid2x2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block" aria-label={t(tx("Filters", "Penapis"))}>
          {Filters}
        </aside>
        <div>
          {filtered.length === 0 ? (
            <div className="border-line rounded-[24px] border border-dashed p-12 text-center">
              <p className="font-display text-[30px]">{t(tx("Nothing matches those filters.", "Tiada padanan untuk penapis itu."))}</p>
              <p className="text-ink-2 mt-2">{t(tx("Try removing one, or let the Advisor suggest an alternative.", "Cuba buang satu, atau biar Advisor cadangkan alternatif."))}</p>
              <button className="btn btn-secondary btn-sm mt-6" onClick={() => router.replace(pathname, { scroll: false })}>
                {t(tx("Clear filters", "Kosongkan penapis"))}
              </button>
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 ${dense ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>{cards}</div>
          )}
          {filtered.length > shown && (
            <div className="mt-12 text-center">
              <button className="btn btn-secondary" onClick={() => setShown((s) => s + 9)}>
                {t(tx("Load more", "Muat lagi"))} ({filtered.length - shown})
              </button>
            </div>
          )}
        </div>
      </div>

      {sheet && (
        <div className="fixed inset-0 z-[75] lg:hidden" role="dialog" aria-modal="true" aria-label={t(tx("Filters", "Penapis"))}>
          <button className="absolute inset-0 bg-black/40" onClick={() => setSheet(false)} aria-label={t(tx("Close", "Tutup"))} />
          <div className="animate-fade-up bg-bg absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto rounded-t-[24px] p-5 pb-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-display text-[28px]">{t(tx("Filters", "Penapis"))}</p>
              <button className="hover:bg-surface-2 grid h-10 w-10 place-items-center rounded-full" onClick={() => setSheet(false)} aria-label={t(tx("Close", "Tutup"))}>
                <X className="h-5 w-5" />
              </button>
            </div>
            {Filters}
            <button className="btn btn-primary mt-6 w-full" onClick={() => setSheet(false)}>
              {t(tx("Show", "Tunjuk"))} {filtered.length} {t(tx("results", "hasil"))}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details open className="group border-line border-t py-4 first:border-t-0 first:pt-0">
      <summary className="eyebrow text-ink flex cursor-pointer list-none items-center justify-between py-1">
        {title}
        <span className="text-ink-3 text-lg leading-none transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="mt-3 space-y-2.5">{children}</div>
    </details>
  );
}

function Check({ checked, onChange, label, n, disabled }: { checked: boolean; onChange: () => void; label: string; n: number; disabled?: boolean }) {
  return (
    <label className={`flex items-center gap-3 ${disabled ? "opacity-80" : "cursor-pointer"}`}>
      <input type="checkbox" checked={checked} disabled={disabled} onChange={onChange} className="h-[18px] w-[18px] rounded accent-[var(--ink)]" />
      <span className="flex-1">{label}</span>
      <span className="text-ink-3 text-[13px]">{n}</span>
    </label>
  );
}
