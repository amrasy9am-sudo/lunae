"use client";

import { useState } from "react";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";

export function ReactionReport({ batch, product }: { batch: string; product: string }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<null | boolean>(null);
  if (!open)
    return (
      <button className="btn btn-secondary btn-sm" onClick={() => setOpen(true)}>
        {t(tx("Report a reaction", "Lapor reaksi"))}
      </button>
    );
  return (
    <form
      className="border-line bg-surface w-full space-y-3 rounded-[16px] border p-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        const res = await fetch("/api/trace/report", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...fd, batch, product }) }).catch(() => null);
        const j = res ? await res.json().catch(() => null) : null;
        setDone(Boolean(j?.delivered));
      }}
    >
      <p className="text-ink-2 text-[14px]">
        {t(tx("Please stop using the product. If symptoms are severe, seek medical help immediately.", "Sila berhenti guna produk. Jika simptom teruk, dapatkan rawatan perubatan segera."))}
      </p>
      <textarea name="details" required minLength={10} rows={3} className="field" placeholder={t(tx("What happened, and when?", "Apa yang berlaku, dan bila?"))} />
      <input name="contact" required className="field" placeholder={t(tx("Email or phone so we can follow up", "E-mel atau telefon untuk susulan"))} />
      <button className="btn btn-primary btn-sm">{t(tx("Send report", "Hantar laporan"))}</button>
      {done === true && (
        <p className="text-sage text-[14px]">
          {t(tx("Report logged with this batch. Our Regulatory Executive will contact you.", "Laporan direkod bersama kelompok ini. Eksekutif Regulatori kami akan menghubungi anda."))}
        </p>
      )}
      {done === false && (
        <p className="text-warning text-[14px]">
          {t(tx("Preview site: reports aren't delivered yet — please contact us on WhatsApp.", "Laman pratonton: laporan belum dihantar — sila hubungi kami di WhatsApp."))}
        </p>
      )}
    </form>
  );
}
