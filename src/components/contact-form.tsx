"use client";

import { useState } from "react";
import { z } from "zod";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";
import { WHATSAPP } from "@/lib/site";

const Schema = z.object({
  name: z.string().trim().min(2),
  email: z.string().trim().email(),
  topic: z.string().min(1),
  order: z.string().optional(),
  message: z.string().trim().min(10).max(2000),
});

export function ContactForm() {
  const t = useT();
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const [state, setState] = useState<"idle" | "sending" | "done" | "demo" | "error">("idle");
  return (
    <form
      noValidate
      className="space-y-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
        const r = Schema.safeParse(data);
        if (!r.success) {
          setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), true])));
          return;
        }
        setErrors({});
        setState("sending");
        try {
          const res = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r.data) });
          const j = await res.json();
          setState(j.delivered ? "done" : "demo");
        } catch {
          setState("error");
        }
      }}
    >
      {state === "done" && <p className="bg-tint-sage rounded-[14px] p-4 text-[15px]">{t(tx("Thank you — we'll reply within 24 hours.", "Terima kasih — kami akan balas dalam 24 jam."))}</p>}
      {state === "demo" && (
        <p className="bg-tint-blush rounded-[14px] p-4 text-[15px]">
          {t(
            tx(
              "Your message passed validation, but this preview site doesn't deliver messages yet. Please reach us on ",
              "Mesej anda sah, tetapi laman pratonton ini belum menghantar mesej. Sila hubungi kami di ",
            ),
          )}
          <a href={WHATSAPP} className="link" target="_blank" rel="noreferrer">
            WhatsApp
          </a>
          .
        </p>
      )}
      {state === "error" && <p className="bg-tint-blush rounded-[14px] p-4 text-[15px]">{t(tx("Something went wrong — please try again.", "Ralat berlaku — sila cuba lagi."))}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Name", "Nama"))}</span>
          <input name="name" className="field mt-1.5" aria-invalid={errors.name} autoComplete="name" />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">Email</span>
          <input name="email" type="email" className="field mt-1.5" aria-invalid={errors.email} autoComplete="email" />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Topic", "Topik"))}</span>
          <select name="topic" className="field mt-1.5" defaultValue="order">
            <option value="order">{t(tx("An order", "Pesanan"))}</option>
            <option value="shade">{t(tx("Shade help", "Bantuan rona"))}</option>
            <option value="reaction">{t(tx("Skin reaction", "Reaksi kulit"))}</option>
            <option value="partner">{t(tx("Stockist / ambassador", "Stokis / duta"))}</option>
            <option value="press">{t(tx("Press", "Media"))}</option>
            <option value="other">{t(tx("Something else", "Lain-lain"))}</option>
          </select>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Order no. (optional)", "No. pesanan (pilihan)"))}</span>
          <input name="order" className="field mt-1.5" placeholder="LN-24817" />
        </label>
      </div>
      <label className="block">
        <span className="text-[13px] font-medium">{t(tx("Message", "Mesej"))}</span>
        <textarea name="message" rows={6} className="field mt-1.5" aria-invalid={errors.message} />
        {errors.message && <span className="text-error mt-1 block text-[13px]">{t(tx("Please write at least 10 characters.", "Sila tulis sekurang-kurangnya 10 aksara."))}</span>}
      </label>
      <p className="text-ink-3 text-[12.5px]">{t(tx("We use your details only to reply to this message (PDPA).", "Kami guna butiran anda hanya untuk membalas mesej ini (PDPA)."))}</p>
      <button className="btn btn-primary" disabled={state === "sending"}>
        {state === "sending" ? t(tx("Sending…", "Menghantar…")) : t(tx("Send message", "Hantar mesej"))}
      </button>
    </form>
  );
}
