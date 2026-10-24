"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { ProductCard } from "./product-card";
import { useHref, useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { POPULAR, searchProducts } from "@/lib/search";
import { articles } from "@/data/journal";
import { glossary } from "@/data/formulas";

export function SearchResults() {
  const t = useT();
  const href = useHref();
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const [v, setV] = useState(q);
  const res = searchProducts(q);
  const ql = q.toLowerCase();
  const arts = q ? articles.filter((a) => (a.title.en + a.title.ms + a.dek.en).toLowerCase().includes(ql.split(" ")[0] ?? "")) : [];
  const ings = q ? glossary.filter((g) => g.name.toLowerCase().includes(ql)).slice(0, 6) : [];
  return (
    <div>
      <form
        role="search"
        className="border-line bg-surface flex max-w-2xl items-center gap-3 rounded-full border px-5"
        onSubmit={(e) => {
          e.preventDefault();
          router.replace(href(`/search?q=${encodeURIComponent(v)}`));
        }}
      >
        <Search className="text-ink-3 h-5 w-5" strokeWidth={1.5} />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          className="h-14 flex-1 bg-transparent text-[17px] outline-none"
          placeholder={t(tx("Search products, ingredients, concerns…", "Cari produk, ramuan, keperluan…"))}
          aria-label={t(tx("Search", "Cari"))}
        />
        <button className="btn btn-primary btn-sm">{t(tx("Search", "Cari"))}</button>
      </form>
      {q && (
        <p className="text-ink-2 mt-6" aria-live="polite">
          {res.length} {t(tx("results for", "hasil untuk"))} “{q}”
        </p>
      )}
      {q && res.length === 0 && (
        <div className="border-line mt-8 rounded-[20px] border border-dashed p-10">
          <p className="font-display text-[28px]">{t(tx("We couldn't find that — yet.", "Kami tak jumpa — buat masa ini."))}</p>
          <p className="text-ink-2 mt-2">
            {t(tx("Try one of these, or describe the look you want to the Lunae Advisor.", "Cuba salah satu ini, atau terangkan gaya yang anda mahu kepada Lunae Advisor."))}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {POPULAR.map((s) => (
              <L key={s} href={`/search?q=${encodeURIComponent(s)}`} className="chip">
                {s}
              </L>
            ))}
          </div>
        </div>
      )}
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 md:gap-x-6 lg:grid-cols-4">
        {res.map((p) => (
          <ProductCard key={p.slug} p={p} />
        ))}
      </div>
      {(ings.length > 0 || arts.length > 0) && (
        <div className="mt-16 grid gap-10 md:grid-cols-2">
          {ings.length > 0 && (
            <div>
              <p className="eyebrow text-ink-3">{t(tx("Ingredients", "Ramuan"))}</p>
              <ul className="mt-4 space-y-2">
                {ings.map((g) => (
                  <li key={g.key}>
                    <L href={`/ingredients/${g.key}`} className="link">
                      {g.name}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {arts.length > 0 && (
            <div>
              <p className="eyebrow text-ink-3">{t(tx("Journal", "Jurnal"))}</p>
              <ul className="mt-4 space-y-2">
                {arts.map((a) => (
                  <li key={a.slug}>
                    <L href={`/journal/${a.slug}`} className="link">
                      {t(a.title)}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
