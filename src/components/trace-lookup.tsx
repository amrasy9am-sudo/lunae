"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { QrCode, Search } from "lucide-react";
import { useHref, useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { batches } from "@/data/batches";

export function TraceLookup() {
  const t = useT();
  const href = useHref();
  const router = useRouter();
  const [v, setV] = useState("");
  return (
    <div>
      <form
        className="border-line bg-surface flex max-w-xl items-center gap-3 rounded-full border pl-5"
        onSubmit={(e) => {
          e.preventDefault();
          const code = v
            .trim()
            .toUpperCase()
            .replace(/.*\/TRACE\//, "");
          if (code) router.push(href(`/trace/${encodeURIComponent(code)}`));
        }}
      >
        <QrCode className="text-ink-3 h-5 w-5" strokeWidth={1.5} />
        <input
          value={v}
          onChange={(e) => setV(e.target.value)}
          placeholder={t(tx("Batch no. or serial (e.g. B2405)", "No. kelompok atau siri (cth. B2405)"))}
          className="h-14 flex-1 bg-transparent outline-none"
          aria-label={t(tx("Batch number", "Nombor kelompok"))}
        />
        <button className="btn btn-primary btn-sm mr-1.5">
          <Search className="h-4 w-4" /> {t(tx("Check", "Semak"))}
        </button>
      </form>
      <p className="text-ink-3 mt-4 text-[13.5px]">
        {t(tx("Sample batches to try:", "Contoh kelompok untuk dicuba:"))}{" "}
        {batches.map((b, i) => (
          <span key={b.no}>
            {i > 0 && ", "}
            <L href={`/trace/${b.no}`} className="link">
              {b.no}
            </L>
          </span>
        ))}
      </p>
    </div>
  );
}
