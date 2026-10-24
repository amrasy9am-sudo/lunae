"use client";

import { useEffect, useState } from "react";
import { useT } from "../providers";
import { L, Toggle } from "../ui";
import { tx } from "@/lib/i18n";
import { useAccount } from "@/lib/store";

/** PDPA-friendly consent notice: nothing non-essential loads before a choice; "essential only" is as easy as "accept". */
export function CookieNotice() {
  const t = useT();
  const [show, setShow] = useState(false);
  const [custom, setCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [personal, setPersonal] = useState(true);
  const setConsent = useAccount((s) => s.setConsent);
  useEffect(() => {
    try {
      setShow(!localStorage.getItem("lunae-consent"));
    } catch {
      setShow(false);
    }
  }, []);
  if (!show) return null;
  const save = (a: boolean, p: boolean) => {
    try {
      localStorage.setItem("lunae-consent", JSON.stringify({ analytics: a, personalisation: p, at: new Date().toISOString() }));
    } catch {}
    setConsent("analytics", a);
    setConsent("personalisation", p);
    setShow(false);
  };
  return (
    <div role="region" aria-label={t(tx("Cookie consent", "Persetujuan kuki"))} className="fixed inset-x-3 bottom-[76px] z-[60] md:right-auto md:bottom-5 md:left-5 md:max-w-md">
      <div className="card animate-fade-up p-5 shadow-[var(--shadow-e3)]">
        <p className="font-serif text-[17px] font-semibold">{t(tx("A quick word on cookies", "Sedikit tentang kuki"))}</p>
        <p className="text-ink-2 mt-2 text-[13.5px] leading-relaxed">
          {t(
            tx(
              "We use essential cookies to run the bag and checkout. With your OK we also use analytics and personalisation (shade-based picks). No third-party ad pixels load before you choose.",
              "Kami guna kuki penting untuk troli dan checkout. Dengan izin anda, kami juga guna analitik dan pemperibadian (cadangan ikut rona). Tiada piksel iklan pihak ketiga dimuat sebelum anda memilih.",
            ),
          )}{" "}
          <L href="/policies/cookies" className="link">
            {t(tx("Cookie policy", "Polisi kuki"))}
          </L>
        </p>
        {custom && (
          <div className="border-line mt-4 space-y-3 border-t pt-4 text-[14px]">
            <div className="flex items-center justify-between gap-3">
              <span>{t(tx("Essential (always on)", "Penting (sentiasa aktif)"))}</span>
              <Toggle checked onChange={() => {}} label="Essential" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>{t(tx("Personalisation", "Pemperibadian"))}</span>
              <Toggle checked={personal} onChange={setPersonal} label="Personalisation" />
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>{t(tx("Analytics", "Analitik"))}</span>
              <Toggle checked={analytics} onChange={setAnalytics} label="Analytics" />
            </div>
          </div>
        )}
        <div className="mt-4 flex flex-wrap gap-2">
          {custom ? (
            <button className="btn btn-primary btn-sm flex-1" onClick={() => save(analytics, personal)}>
              {t(tx("Save choices", "Simpan pilihan"))}
            </button>
          ) : (
            <>
              <button className="btn btn-primary btn-sm flex-1" onClick={() => save(true, true)}>
                {t(tx("Accept all", "Terima semua"))}
              </button>
              <button className="btn btn-secondary btn-sm flex-1" onClick={() => save(false, false)}>
                {t(tx("Essential only", "Penting sahaja"))}
              </button>
              <button className="btn btn-sm text-ink-2 px-3 underline underline-offset-2" onClick={() => setCustom(true)}>
                {t(tx("Customise", "Ubah suai"))}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
