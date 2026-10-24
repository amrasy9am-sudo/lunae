"use client";

import { useState } from "react";
import { z } from "zod";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";

const Schema = z.object({
  type: z.enum(["stockist", "affiliate", "ambassador"]),
  name: z.string().trim().min(2),
  business: z.string().optional(),
  ssm: z.string().optional(),
  email: z.string().email(),
  phone: z.string().min(9),
  state: z.string().min(2),
  channels: z.string().min(2),
  agree: z.literal("on"),
});

const STATES = [
  "Johor",
  "Kedah",
  "Kelantan",
  "Melaka",
  "Negeri Sembilan",
  "Pahang",
  "Perak",
  "Perlis",
  "Pulau Pinang",
  "Sabah",
  "Sarawak",
  "Selangor",
  "Terengganu",
  "W.P. Kuala Lumpur",
  "W.P. Labuan",
  "W.P. Putrajaya",
];

export function PartnerApply() {
  const t = useT();
  const [type, setType] = useState<"stockist" | "affiliate" | "ambassador">("stockist");
  const [errs, setErrs] = useState<Record<string, boolean>>({});
  const [res, setRes] = useState<null | "ok" | "demo">(null);
  if (res)
    return (
      <div className="bg-tint-sage rounded-[24px] p-8">
        <p className="font-display text-[32px]">{t(tx("Application received.", "Permohonan diterima."))}</p>
        <p className="text-ink-2 mt-2">
          {res === "ok"
            ? t(
                tx(
                  "Our partner team reviews applications within 5 working days. Next step: KYC documents and your e-signed agreement.",
                  "Pasukan rakan kami menyemak permohonan dalam 5 hari bekerja. Langkah seterusnya: dokumen KYC dan perjanjian ditandatangani-e.",
                ),
              )
            : t(
                tx(
                  "Preview site: your details validated, but applications aren't delivered yet. Please also WhatsApp us to register interest.",
                  "Laman pratonton: butiran anda sah, tetapi permohonan belum dihantar. Sila WhatsApp kami juga untuk daftar minat.",
                ),
              )}
        </p>
      </div>
    );
  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={async (e) => {
        e.preventDefault();
        const data = { ...Object.fromEntries(new FormData(e.currentTarget)), type };
        const r = Schema.safeParse(data);
        if (!r.success) return setErrs(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), true])));
        if (type === "stockist" && !(data as Record<string, string>).ssm) return setErrs({ ssm: true });
        const j = await fetch("/api/partners/apply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(r.data) })
          .then((x) => x.json())
          .catch(() => ({}));
        setRes(j.delivered ? "ok" : "demo");
      }}
    >
      <div className="grid grid-cols-3 gap-2">
        {(["stockist", "affiliate", "ambassador"] as const).map((k) => (
          <button type="button" key={k} className="chip justify-center" aria-pressed={type === k} onClick={() => setType(k)}>
            {k === "stockist" ? t(tx("Stockist", "Stokis")) : k === "affiliate" ? t(tx("Affiliate", "Afiliasi")) : t(tx("Ambassador", "Duta"))}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Full name (as in IC)", "Nama penuh (seperti dalam IC)"))}</span>
          <input name="name" className="field mt-1.5" aria-invalid={errs.name} />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Business name", "Nama perniagaan"))}</span>
          <input name="business" className="field mt-1.5" />
        </label>
        {type === "stockist" && (
          <label className="block sm:col-span-2">
            <span className="text-[13px] font-medium">{t(tx("SSM registration no.", "No. pendaftaran SSM"))}</span>
            <input name="ssm" className="field mt-1.5" aria-invalid={errs.ssm} placeholder="202601012345 (1234567-A)" />
          </label>
        )}
        <label className="block">
          <span className="text-[13px] font-medium">Email</span>
          <input name="email" type="email" className="field mt-1.5" aria-invalid={errs.email} />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Mobile", "Telefon bimbit"))}</span>
          <input name="phone" type="tel" className="field mt-1.5" aria-invalid={errs.phone} />
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("State", "Negeri"))}</span>
          <select name="state" className="field mt-1.5" defaultValue="">
            <option value="" disabled>
              —
            </option>
            {STATES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[13px] font-medium">{t(tx("Where do you sell / post?", "Di mana anda menjual / berkongsi?"))}</span>
          <input name="channels" className="field mt-1.5" aria-invalid={errs.channels} placeholder="Shopee, TikTok @…, agent network" />
        </label>
      </div>
      <p className="text-ink-3 text-[13px]">
        {t(
          tx(
            "KYC documents (SSM/IC) are uploaded securely after initial approval — please don't email them.",
            "Dokumen KYC (SSM/IC) dimuat naik dengan selamat selepas kelulusan awal — jangan hantar melalui e-mel.",
          ),
        )}
      </p>
      <label className="flex items-start gap-2.5 text-[14px]">
        <input type="checkbox" name="agree" className="mt-0.5 h-4 w-4 accent-[var(--ink)]" />
        <span className={errs.agree ? "text-error" : ""}>
          {t(
            tx(
              "I agree to LUNAE's partner terms, minimum retail price policy and claim-safe marketing rules, and to my data being processed for this application (PDPA).",
              "Saya bersetuju dengan terma rakan LUNAE, polisi harga runcit minimum dan peraturan pemasaran selamat dakwaan, serta pemprosesan data saya untuk permohonan ini (PDPA).",
            ),
          )}
        </span>
      </label>
      <button className="btn btn-primary">{t(tx("Submit application", "Hantar permohonan"))}</button>
    </form>
  );
}
