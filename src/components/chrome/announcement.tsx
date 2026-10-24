"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { countdown, nextDropAt } from "@/lib/astro";

export function PreviewRibbon() {
  const t = useT();
  const [hidden, setHidden] = useState(true);
  useEffect(() => {
    try {
      setHidden(sessionStorage.getItem("lunae-preview-dismissed") === "1");
    } catch {
      setHidden(false);
    }
  }, []);
  if (hidden) return null;
  return (
    <div className="bg-accent text-accent-ink relative px-10 py-1.5 text-center text-[12px] font-medium">
      {t(
        tx(
          "Preview site — LUNAE launches with Merdeka, August 2027. Checkout runs in demo mode: no payment is taken.",
          "Laman pratonton — LUNAE dilancarkan sempena Merdeka, Ogos 2027. Pembayaran dalam mod demo: tiada caj dibuat.",
        ),
      )}
      <button
        aria-label={t(tx("Dismiss", "Tutup"))}
        className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full hover:bg-black/10"
        onClick={() => {
          setHidden(true);
          try {
            sessionStorage.setItem("lunae-preview-dismissed", "1");
          } catch {}
        }}
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function AnnouncementBar() {
  const t = useT();
  const [now, setNow] = useState<Date | null>(null);
  const [i, setI] = useState(0);
  useEffect(() => {
    setNow(new Date());
    const a = setInterval(() => setNow(new Date()), 30_000);
    const b = setInterval(() => setI((x) => (x + 1) % 3), 6000);
    return () => {
      clearInterval(a);
      clearInterval(b);
    };
  }, []);
  const c = now ? countdown(nextDropAt(now), now) : null;
  const drop = (
    <L href="/drops" className="inline-flex items-center gap-2 hover:underline">
      <span className="bg-glow h-2 w-2 rounded-full" aria-hidden />
      <strong className="font-semibold">Full Moon Drop</strong>
      <span suppressHydrationWarning>{c ? `${t(tx("in", "dalam"))} ${c.d}${t(tx("d", "h"))} ${c.h}${t(tx("h", "j"))} ${c.m}m` : ""}</span>
    </L>
  );
  const msgs = [
    <span key="ship">
      {t(tx("Free delivery over", "Penghantaran percuma melebihi"))} <strong className="font-semibold">RM80</strong>
    </span>,
    drop,
    <L key="g" href="/policies/returns" className="hover:underline">
      {t(tx("Shade-Match Guarantee: free swap in 30 days", "Jaminan Padanan Rona: tukar percuma dalam 30 hari"))}
    </L>,
  ];
  return (
    <div className="bg-band text-band-ink">
      <div className="container-lux flex h-9 items-center justify-center gap-6 text-[12.5px] tracking-wide">
        <div className="hidden items-center gap-6 md:flex">
          {msgs[0]}
          <span aria-hidden className="opacity-40">
            ·
          </span>
          {msgs[1]}
          <span aria-hidden className="opacity-40">
            ·
          </span>
          {msgs[2]}
        </div>
        <div className="md:hidden" aria-live="off">
          {msgs[i]}
        </div>
      </div>
    </div>
  );
}
