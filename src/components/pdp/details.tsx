"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Formula, Product } from "@/lib/types";
import { useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { fnL, halalNote } from "@/lib/ingredients";

export function IngredientExplorer({ f }: { f: Formula }) {
  const t = useT();
  const shown = f.ingredients.filter((i) => i.key !== "aqua" || f.ingredients.length < 6);
  const star = shown.find((i) => /niacinamide|centella|calophyllum|hyaluronate|ceramide|zinc/.test(i.key)) ?? shown[0];
  const [sel, setSel] = useState(star?.key);
  const cur = f.ingredients.find((i) => i.key === sel);
  const h = cur ? halalNote(cur.key) : null;
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {shown.slice(0, 12).map((i) => (
          <button key={i.inci} className="chip text-[13.5px]" aria-pressed={sel === i.key} onClick={() => setSel(i.key)}>
            {i.inci.split(" (")[0].replace(/ — .*/, "")}
          </button>
        ))}
      </div>
      {cur && h && (
        <div className="border-line bg-surface mt-4 rounded-[14px] border p-4 text-[14.5px] leading-relaxed" aria-live="polite">
          <p>
            <strong>{cur.inci}</strong> — {t(fnL(cur.fn)).toLowerCase()}. <span className={h.tone === "ok" ? "text-sage" : "text-warning"}>● {t(h.status)}</span>
          </p>
          <L href={`/ingredients/${cur.key}`} className="link mt-2 inline-block text-[13px]">
            {t(tx("More in the ingredients glossary", "Lagi dalam glosari ramuan"))}
          </L>
        </div>
      )}
      <p className="text-ink-3 mt-3 text-[12px]">
        {t(
          tx(
            "Ingredient list from the formulation brief; the final INCI list is confirmed after the ODM safety assessment.",
            "Senarai ramuan daripada ringkasan formulasi; senarai INCI akhir disahkan selepas penilaian keselamatan ODM.",
          ),
        )}
      </p>
    </div>
  );
}

export function Accordion({ title, children, defaultOpen = false, id }: { title: string; children: React.ReactNode; defaultOpen?: boolean; id?: string }) {
  return (
    <details id={id} open={defaultOpen} className="group border-line border-b">
      <summary className="flex cursor-pointer list-none items-center justify-between py-5 text-[13px] font-semibold tracking-[0.14em] uppercase">
        {title}
        <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" strokeWidth={1.5} />
      </summary>
      <div className="text-ink-2 pb-6 text-[15px] leading-relaxed">{children}</div>
    </details>
  );
}

export function PdpAccordions({ p, f }: { p: Product; f: Formula }) {
  const t = useT();
  return (
    <div className="border-line mt-8 border-t">
      <Accordion title={t(tx("Ingredient explorer", "Penjelajah ramuan"))} defaultOpen>
        <IngredientExplorer f={f} />
      </Accordion>
      <Accordion title={t(tx("Halal, batch & safety", "Halal, kelompok & keselamatan"))}>
        <ul className="space-y-2">
          <li>
            <strong className="text-ink">{t(tx("Halal standard:", "Piawaian halal:"))}</strong> MS 2634:2019 ·{" "}
            {t(tx("JAKIM certificate applied for before launch", "Sijil JAKIM dimohon sebelum pelancaran"))}
          </li>
          <li>
            <strong className="text-ink">{t(tx("NPRA notification:", "Notifikasi NPRA:"))}</strong>{" "}
            {t(tx("submitted before first sale; number shown here and on every batch page", "dihantar sebelum jualan pertama; nombor dipaparkan di sini dan di setiap halaman kelompok"))}
          </li>
          {f.halalPoints.map((h) => (
            <li key={h}>• {h}</li>
          ))}
          <li>
            <strong className="text-ink">{t(tx("Free from:", "Bebas daripada:"))}</strong> {f.freeFrom.join(" · ")}
          </li>
          <li>
            <strong className="text-ink">PAO:</strong> {f.pao} · <strong className="text-ink">{t(tx("Shelf life:", "Jangka hayat:"))}</strong> {f.shelfLife}
            {f.ph && (
              <>
                {" "}
                · <strong className="text-ink">pH:</strong> {f.ph}
              </>
            )}
            {f.spf && (
              <>
                {" "}
                · <strong className="text-ink">SPF/PA:</strong> {f.spf}
              </>
            )}
          </li>
        </ul>
        <L href="/trace" className="link mt-3 inline-block text-[14px]">
          {t(tx("Check a batch by QR code", "Semak kelompok dengan kod QR"))}
        </L>
      </Accordion>
      <Accordion title={t(tx("How to apply", "Cara guna"))}>
        <p>{t(p.howTo)}</p>
        <p className="text-ink-3 mt-3 text-[13px]">
          {t(tx("Formula:", "Formula:"))} {f.base}. {t(tx("Target:", "Sasaran:"))} {f.performance}
        </p>
      </Accordion>
      <Accordion title={t(tx("Full ingredients (INCI)", "Ramuan penuh (INCI)"))}>
        <p className="text-[14px]">{f.ingredients.map((i) => i.inci).join(", ")}.</p>
      </Accordion>
      <Accordion title={t(tx("Packaging & sustainability", "Pembungkusan & kelestarian"))}>
        <p>{f.packaging}</p>
        <p className="mt-2 text-[13.5px]">
          {t(
            tx(
              "Mono-material tubes, recyclable glass and FSC-certified cartons printed with soy inks. Serial-numbered hologram + QR authenticity check on every box.",
              "Tiub mono-bahan, kaca boleh dikitar semula dan kotak bersijil FSC dicetak dengan dakwat soya. Hologram bernombor siri + semakan QR ketulenan pada setiap kotak.",
            ),
          )}
        </p>
      </Accordion>
      <Accordion title={t(tx("Delivery & Shade-Match Guarantee", "Penghantaran & Jaminan Padanan Rona"))}>
        <p>
          {t(
            tx(
              "Paid before 2 pm on working days ships the same day. Peninsular 1–3 working days (free over RM80), Sabah/Sarawak 3–7. Wrong shade? One free swap within 30 days, even if opened — 3 taps from your account.",
              "Dibayar sebelum 2 petang hari bekerja dihantar hari sama. Semenanjung 1–3 hari bekerja (percuma melebihi RM80), Sabah/Sarawak 3–7. Rona tak sesuai? Satu pertukaran percuma dalam 30 hari, walaupun dibuka — 3 ketikan dari akaun anda.",
            ),
          )}
        </p>
        <L href="/policies/returns" className="link mt-2 inline-block text-[14px]">
          {t(tx("Returns & swaps policy", "Polisi pemulangan & tukar"))}
        </L>
      </Accordion>
    </div>
  );
}
