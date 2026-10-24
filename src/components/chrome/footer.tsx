"use client";

import { useState } from "react";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { Logo } from "../logo";
import { L } from "../ui";
import { useT } from "../providers";
import { tx } from "@/lib/i18n";
import { useAccount, useUI } from "@/lib/store";

const COLS = [
  {
    h: tx("Shop", "Kedai"),
    links: [
      ["/shop/face", tx("Face", "Muka")],
      ["/shop/lips-cheeks", tx("Lips & Cheeks", "Bibir & Pipi")],
      ["/shop/eyes", tx("Eyes & Brows", "Mata & Kening")],
      ["/shop/skincare", tx("Skincare", "Penjagaan Kulit")],
      ["/sets", tx("Sets & Gifts", "Set & Hadiah")],
      ["/account/refills", tx("Refills", "Isi Semula")],
    ],
  },
  {
    h: tx("Discover", "Terokai"),
    links: [
      ["/shade-finder", tx("AI Shade Finder", "Pencari Rona AI")],
      ["/try-on", tx("Virtual Try-On", "Cuba Maya")],
      ["/routine", tx("Routine Builder", "Pembina Rutin")],
      ["/lab", tx("Sweat-Test Lab", "Makmal Ujian Peluh")],
      ["/glow-forecast", tx("Weather Glow", "Weather Glow")],
      ["/journal", tx("Journal", "Jurnal")],
      ["/live", tx("Live", "Live")],
    ],
  },
  {
    h: tx("Help", "Bantuan"),
    links: [
      ["/track", tx("Track order", "Jejak pesanan")],
      ["/policies/returns", tx("Returns & swaps", "Pemulangan & tukar")],
      ["/policies/shipping", tx("Delivery", "Penghantaran")],
      ["/trace", tx("Batch & halal check", "Semakan kelompok & halal")],
      ["/contact", tx("Contact us", "Hubungi kami")],
      ["/help", tx("FAQ", "Soalan lazim")],
    ],
  },
  {
    h: tx("LUNAE", "LUNAE"),
    links: [
      ["/about", tx("Our story", "Kisah kami")],
      ["/halal", tx("Halal promise", "Janji halal")],
      ["/ingredients", tx("Ingredients glossary", "Glosari ramuan")],
      ["/stockists", tx("Stockists", "Stokis")],
      ["/partners", tx("Ambassadors & stockists", "Duta & stokis")],
      ["/policies/privacy", tx("Privacy (PDPA)", "Privasi (PDPA)")],
    ],
  },
] as const;

const PAY = ["FPX", "VISA", "Mastercard", "DuitNow QR", "Touch 'n Go", "GrabPay", "ShopeePay", "Atome"];

export function Footer() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const notify = useUI((s) => s.notify);
  const setC = useAccount((s) => s.setConsent);
  return (
    <footer className="bg-night text-moon" data-theme-band>
      <div className="container-lux grid gap-12 py-16 lg:grid-cols-[1.3fr_3fr] lg:py-20">
        <div>
          <Logo className="text-moon" />
          <p className="font-display mt-6 text-[30px] leading-tight italic">{t(tx("Glow from sun-up to moonlight.", "Berseri dari terbit mentari hingga cahaya bulan."))}</p>
          <p className="text-halo mt-3 text-[14px]">
            {t(tx("Join Lunae Circle: 200 welcome points, early access to Full Moon Drops.", "Sertai Lunae Circle: 200 mata alu-aluan, akses awal ke Full Moon Drops."))}
          </p>
          <form
            className="mt-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return notify(t(tx("Please enter a valid email.", "Sila masukkan e-mel yang sah.")), "error");
              if (!consent) return notify(t(tx("Please tick the consent box to receive emails.", "Sila tandakan kotak persetujuan untuk menerima e-mel.")), "warning");
              setC("marketingEmail", true);
              setEmail("");
              notify(t(tx("You're on the list — welcome to Lunae Circle.", "Anda dalam senarai — selamat datang ke Lunae Circle.")));
            }}
          >
            <label className="border-mist flex items-center border-b">
              <span className="sr-only">Email</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder={t(tx("Your email", "E-mel anda"))}
                className="text-moon placeholder:text-halo h-12 flex-1 bg-transparent text-[15px] outline-none"
              />
              <button aria-label={t(tx("Subscribe", "Langgan"))} className="grid h-10 w-10 place-items-center">
                <ArrowRight className="h-5 w-5" />
              </button>
            </label>
            <label className="text-halo mt-3 flex items-start gap-2 text-[12px] leading-snug">
              <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#E08E6D]" />
              {t(tx("I agree to receive LUNAE news by email. Unsubscribe anytime (PDPA).", "Saya bersetuju menerima berita LUNAE melalui e-mel. Boleh berhenti bila-bila masa (PDPA)."))}
            </label>
          </form>
        </div>
        <nav className="grid grid-cols-2 gap-10 sm:grid-cols-4" aria-label={t(tx("Footer", "Kaki"))}>
          {COLS.map((c) => (
            <div key={c.h.en}>
              <p className="eyebrow text-glow">{t(c.h)}</p>
              <ul className="mt-5 space-y-3">
                {c.links.map(([href, l]) => (
                  <li key={href}>
                    <L href={href} className="text-moon/85 hover:text-moon text-[15px]">
                      {t(l)}
                    </L>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="container-lux border-mist/60 flex flex-col gap-5 border-t py-7 pb-28 md:flex-row md:items-center md:justify-between md:pb-7">
        <p className="text-halo flex items-start gap-2 text-[12.5px]">
          <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.5} />
          <span>
            {t(
              tx(
                "Halal certification (MS 2634:2019) & NPRA notification in progress before launch · Not tested on animals · © 2026 LUNAE",
                "Pensijilan halal (MS 2634:2019) & notifikasi NPRA dalam proses sebelum pelancaran · Tidak diuji pada haiwan · © 2026 LUNAE",
              ),
            )}
          </span>
        </p>
        <ul className="flex flex-wrap gap-2" aria-label={t(tx("Payment methods", "Kaedah pembayaran"))}>
          {PAY.map((p) => (
            <li key={p} className="border-mist text-halo rounded-md border px-2.5 py-1 text-[11px] font-medium">
              {p}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
