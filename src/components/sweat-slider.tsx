"use client";

import { useRef, useState } from "react";
import { ChevronsLeftRight } from "lucide-react";
import { useT } from "./providers";
import { tx } from "@/lib/i18n";

/** Before/after thermal-style comparison. Visual is illustrative until lab footage is filmed. */
export function SweatSlider() {
  const t = useT();
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);
  const setFrom = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setPos(Math.max(4, Math.min(96, ((clientX - r.left) / r.width) * 100)));
  };
  return (
    <div
      ref={ref}
      className="relative aspect-[16/11] touch-none overflow-hidden rounded-[24px] select-none"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        setFrom(e.clientX);
      }}
      onPointerMove={(e) => e.buttons && setFrom(e.clientX)}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#f5c84b_0%,#f08a3a_22%,#c43b6e_45%,#5b2a8e_70%,#26246b_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_42%,#c94d7d_0%,#7a35a0_28%,#3d3a9e_55%,#1f2a7a_100%)]" style={{ clipPath: `inset(0 0 0 ${pos}%)` }} />
      <svg viewBox="0 0 400 275" className="absolute inset-0 h-full w-full opacity-35" aria-hidden>
        <ellipse cx="200" cy="120" rx="78" ry="98" fill="none" stroke="#fff" strokeWidth="1.5" />
        <path d="M168 105q12-8 24 0M208 105q12-8 24 0M182 160q18 10 36 0" stroke="#fff" strokeWidth="1.5" fill="none" />
      </svg>
      <span className="badge bg-night/80 text-moon absolute top-4 left-4">{t(tx("Hour 0", "Jam 0"))}</span>
      <span className="badge bg-night/80 text-moon absolute top-4 right-4">{t(tx("Hour 8 · thermal", "Jam 8 · terma"))}</span>
      <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: `${pos}%` }}>
        <button
          className="text-cocoa-ink absolute top-1/2 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg"
          aria-label={t(tx("Drag to compare hour 0 and hour 8", "Seret untuk banding jam 0 dan jam 8"))}
          role="slider"
          aria-valuenow={Math.round(pos)}
          aria-valuemin={0}
          aria-valuemax={100}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setPos((p) => Math.max(4, p - 5));
            if (e.key === "ArrowRight") setPos((p) => Math.min(96, p + 5));
          }}
        >
          <ChevronsLeftRight className="h-5 w-5" />
        </button>
      </div>
      <p className="absolute inset-x-0 bottom-3 text-center text-[11px] text-white/80">
        {t(tx("Illustrative visual — lab footage published once testing is complete", "Visual ilustrasi — rakaman makmal diterbitkan selepas ujian selesai"))}
      </p>
    </div>
  );
}
