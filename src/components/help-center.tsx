"use client";

import { useMemo, useState } from "react";
import { Search, MessageCircle, Sparkles, Mail } from "lucide-react";
import { useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { useUI } from "@/lib/store";
import { WHATSAPP } from "@/lib/site";
import { concerns } from "@/data/catalogue";

const FAQ = [
  {
    c: tx("Orders", "Pesanan"),
    q: tx("When will LUNAE launch?", "Bila LUNAE dilancarkan?"),
    a: tx(
      "Wave 1 (10 products) launches with Merdeka, August 2027. Wave 2 (6 products) follows in early 2028. Join a Full Moon Drop waitlist for first access.",
      "Gelombang 1 (10 produk) dilancarkan sempena Merdeka, Ogos 2027. Gelombang 2 (6 produk) menyusul awal 2028. Sertai senarai menunggu Full Moon Drop untuk akses awal.",
    ),
  },
  {
    c: tx("Orders", "Pesanan"),
    q: tx("Which payment methods do you accept?", "Kaedah pembayaran apa yang diterima?"),
    a: tx(
      "FPX online banking, Visa/Mastercard (3-D Secure), DuitNow QR, Touch 'n Go, GrabPay, ShopeePay and Atome (pay in 3) — all through a licensed payment gateway.",
      "Perbankan dalam talian FPX, Visa/Mastercard (3-D Secure), DuitNow QR, Touch 'n Go, GrabPay, ShopeePay dan Atome (bayar 3 kali) — semuanya melalui gerbang pembayaran berlesen.",
    ),
  },
  {
    c: tx("Orders", "Pesanan"),
    q: tx("Can I check out as a guest?", "Boleh checkout sebagai tetamu?"),
    a: tx(
      "Yes. You can also sign in with a passkey or a one-time code by SMS/WhatsApp — no password needed.",
      "Boleh. Anda juga boleh log masuk dengan passkey atau kod sekali guna melalui SMS/WhatsApp — tanpa kata laluan.",
    ),
  },
  {
    c: tx("Delivery", "Penghantaran"),
    q: tx("How long does delivery take?", "Berapa lama penghantaran?"),
    a: tx(
      "Peninsular 1–3 working days (free over RM80); Sabah, Sarawak & Labuan 3–7 working days. Paid before 2 pm ships the same day.",
      "Semenanjung 1–3 hari bekerja (percuma melebihi RM80); Sabah, Sarawak & Labuan 3–7 hari bekerja. Dibayar sebelum 2 petang dihantar hari sama.",
    ),
  },
  {
    c: tx("Returns", "Pemulangan"),
    q: tx("What if my shade is wrong?", "Bagaimana jika rona saya salah?"),
    a: tx("Our Shade-Match Guarantee gives you one free swap within 30 days, even if opened.", "Jaminan Padanan Rona memberi satu pertukaran percuma dalam 30 hari, walaupun sudah dibuka."),
  },
  {
    c: tx("Halal", "Halal"),
    q: tx("Are your products halal certified?", "Adakah produk anda bersijil halal?"),
    a: tx(
      "Every formula is developed to MS 2634:2019 in halal-certified factories. JAKIM certification is applied for before launch; each batch page will show its certificate.",
      "Setiap formula dibangunkan mengikut MS 2634:2019 di kilang bersijil halal. Pensijilan JAKIM dimohon sebelum pelancaran; setiap halaman kelompok akan memaparkan sijilnya.",
    ),
  },
  {
    c: tx("Shade Finder", "Pencari Rona"),
    q: tx("Is my selfie stored?", "Adakah swafoto saya disimpan?"),
    a: tx(
      "No. The analysis runs on your device and the image is discarded straight away. Only the colour values are kept, and only if you choose to save your profile.",
      "Tidak. Analisis berjalan dalam peranti anda dan imej dibuang serta-merta. Hanya nilai warna disimpan, dan hanya jika anda memilih untuk menyimpan profil.",
    ),
  },
  {
    c: tx("Lunae Circle", "Lunae Circle"),
    q: tx("How do points work?", "Bagaimana mata berfungsi?"),
    a: tx(
      "1 point per RM1; 100 points = RM1 off. Separa (RM300/yr) earns 1.25×, Purnama (RM800/yr) earns 1.5× plus early access and an annual gift.",
      "1 mata bagi setiap RM1; 100 mata = RM1 potongan. Separa (RM300/thn) dapat 1.25×, Purnama (RM800/thn) dapat 1.5× serta akses awal dan hadiah tahunan.",
    ),
  },
  ...concerns.flatMap((c) => c.faq.map((f) => ({ c: c.name, q: f.q, a: f.a }))),
];

export function HelpCenter() {
  const t = useT();
  const ui = useUI();
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? FAQ.filter((f) => (f.q.en + f.q.ms + f.a.en + f.a.ms).toLowerCase().includes(s)) : FAQ;
  }, [q]);
  return (
    <div className="grid gap-12 lg:grid-cols-[1.6fr_1fr]">
      <div>
        <label className="border-line bg-surface flex items-center gap-3 rounded-full border px-5">
          <Search className="text-ink-3 h-5 w-5" strokeWidth={1.5} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(tx("Search help — e.g. “swap”, “halal”, “Sabah”", "Cari bantuan — cth. “tukar”, “halal”, “Sabah”"))}
            className="h-14 flex-1 bg-transparent outline-none"
            aria-label={t(tx("Search help", "Cari bantuan"))}
          />
        </label>
        <div className="divide-line border-line mt-6 divide-y border-y">
          {list.map((f, i) => (
            <details key={i} className="group py-1">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-4 py-4">
                <span>
                  <span className="eyebrow text-ink-3 block">{t(f.c)}</span>
                  <span className="mt-1.5 block font-serif text-[18px] font-semibold">{t(f.q)}</span>
                </span>
                <span className="text-ink-3 mt-4 text-xl leading-none transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="text-ink-2 pb-5 text-[15.5px]">{t(f.a)}</p>
            </details>
          ))}
          {list.length === 0 && <p className="text-ink-2 py-8">{t(tx("No answers found — ask the Advisor or message us.", "Tiada jawapan — tanya Advisor atau mesej kami."))}</p>}
        </div>
      </div>
      <aside className="space-y-4 self-start">
        <button onClick={() => ui.set({ advisorOpen: true })} className="bg-night text-moon flex w-full items-center gap-4 rounded-[20px] p-5 text-left">
          <Sparkles className="text-glow h-6 w-6" />
          <span>
            <span className="block font-semibold">Lunae Advisor</span>
            <span className="text-halo block text-[13.5px]">{t(tx("24/7 · BM, EN & Manglish", "24/7 · BM, EN & Manglish"))}</span>
          </span>
        </button>
        <a href={WHATSAPP} target="_blank" rel="noreferrer" className="border-line bg-surface flex items-center gap-4 rounded-[20px] border p-5">
          <MessageCircle className="text-sage h-6 w-6" />
          <span>
            <span className="block font-semibold">WhatsApp</span>
            <span className="text-ink-3 block text-[13.5px]">{t(tx("9 am–9 pm daily · first reply ≤ 15 min", "9 pagi–9 malam setiap hari · balasan pertama ≤ 15 min"))}</span>
          </span>
        </a>
        <L href="/contact" className="border-line bg-surface flex items-center gap-4 rounded-[20px] border p-5">
          <Mail className="text-accent-deep h-6 w-6" />
          <span>
            <span className="block font-semibold">{t(tx("Contact form", "Borang hubungi"))}</span>
            <span className="text-ink-3 block text-[13.5px]">{t(tx("Resolution within 24 hours for 90% of cases", "Selesai dalam 24 jam untuk 90% kes"))}</span>
          </span>
        </L>
        <div className="border-line rounded-[20px] border p-5 text-[13.5px]">
          <p className="font-semibold">{t(tx("System status", "Status sistem"))}</p>
          <p className="text-ink-2 mt-1 flex items-center gap-2">
            <span className="bg-success h-2 w-2 rounded-full" /> {t(tx("All systems operational", "Semua sistem beroperasi"))}
          </p>
        </div>
      </aside>
    </div>
  );
}
