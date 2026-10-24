"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { Camera, Play, RotateCw, Box, ZoomIn } from "lucide-react";
import type { Product } from "@/lib/types";
import { useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { tintBg } from "@/data/catalogue";

type View = "hero" | "studio" | "video" | "360" | "box";

export function Gallery({ p }: { p: Product }) {
  const t = useT();
  const [view, setView] = useState<View>("hero");
  const [angle, setAngle] = useState(0);
  const [zoom, setZoom] = useState(false);
  const drag = useRef<{ x: number; a: number } | null>(null);
  const box = p.category === "skincare" ? "/img/collections/packaging-en.webp" : "/img/collections/packaging-bm.webp";
  const thumbs: { k: View; label: string; node: React.ReactNode }[] = [
    { k: "hero", label: t(tx("Product", "Produk")), node: <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="88px" className="object-contain p-2" /> },
    { k: "studio", label: t(tx("Studio", "Studio")), node: <Image src={`/img/products/${p.slug}.webp`} alt="" fill sizes="88px" className="object-cover" /> },
    {
      k: "video",
      label: t(tx("Video", "Video")),
      node: (
        <span className="bg-night text-moon grid h-full place-items-center">
          <Play className="h-5 w-5" />
        </span>
      ),
    },
    { k: "360", label: "360°", node: <span className="grid h-full place-items-center text-[14px] font-semibold">360°</span> },
    { k: "box", label: t(tx("Packaging", "Pembungkusan")), node: <Image src={box} alt="" fill sizes="88px" className="object-cover" /> },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-[88px_1fr]" id="view-360">
      <div role="tablist" aria-label={t(tx("Product media", "Media produk"))} className="no-scrollbar order-2 flex gap-3 overflow-x-auto md:order-1 md:flex-col">
        {thumbs.map((th) => (
          <button
            key={th.k}
            role="tab"
            aria-selected={view === th.k}
            aria-label={th.label}
            onClick={() => setView(th.k)}
            className={`relative h-[88px] w-[76px] shrink-0 overflow-hidden rounded-[12px] md:w-[88px] ${tintBg[p.tint]} ${view === th.k ? "ring-ink ring-offset-bg ring-[1.5px] ring-offset-2" : "opacity-80 hover:opacity-100"}`}
          >
            {th.node}
          </button>
        ))}
      </div>
      <div className={`relative order-1 aspect-[4/5] overflow-hidden rounded-[24px] md:order-2 ${tintBg[p.tint]}`}>
        {view === "hero" && (
          <button className={`absolute inset-0 ${zoom ? "cursor-zoom-out" : "cursor-zoom-in"}`} onClick={() => setZoom((z) => !z)} aria-label={t(tx("Zoom image", "Zum imej"))}>
            <Image
              src={`/img/cutouts/${p.slug}.webp`}
              alt={p.name}
              fill
              priority
              sizes="(min-width:1024px) 45vw, 100vw"
              className={`object-contain p-[14%] drop-shadow-[0_30px_30px_rgba(42,26,22,0.2)] transition-transform duration-500 ${zoom ? "scale-[1.8]" : ""}`}
            />
          </button>
        )}
        {view === "studio" && <Image src={`/img/products/${p.slug}.webp`} alt={`${p.name} — studio render`} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />}
        {view === "video" && (
          <div className="starfield bg-night text-moon absolute inset-0 grid place-items-center p-8 text-center">
            <div>
              <div className="relative mx-auto h-56 w-40 animate-[moonrise_2.4s_var(--ease-lunar)_infinite_alternate]">
                <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="160px" className="object-contain" />
              </div>
              <p className="font-display mt-6 text-[26px]">{t(tx("60-second tutorial", "Tutorial 60 saat"))}</p>
              <p className="text-halo mt-1 text-[13px]">
                {t(tx("Filmed with real skin under 5,000K light — releasing with launch content.", "Dirakam dengan kulit sebenar di bawah cahaya 5,000K — dikeluarkan bersama kandungan pelancaran."))}
              </p>
            </div>
          </div>
        )}
        {view === "360" && (
          <div
            className="absolute inset-0 cursor-grab touch-none select-none [perspective:1200px] active:cursor-grabbing"
            onPointerDown={(e) => {
              (e.target as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { x: e.clientX, a: angle };
            }}
            onPointerMove={(e) => drag.current && setAngle(drag.current.a + (e.clientX - drag.current.x) * 0.6)}
            onPointerUp={() => (drag.current = null)}
            onKeyDown={(e) => {
              if (e.key === "ArrowLeft") setAngle((a) => a - 15);
              if (e.key === "ArrowRight") setAngle((a) => a + 15);
            }}
            tabIndex={0}
            role="slider"
            aria-label={t(tx("Rotate product", "Putar produk"))}
            aria-valuenow={Math.round(((angle % 360) + 360) % 360)}
            aria-valuemin={0}
            aria-valuemax={360}
          >
            <div className="absolute inset-x-[18%] bottom-[12%] h-[8%] rounded-[50%] bg-black/10 blur-md" />
            <div className="absolute inset-[10%] transition-transform duration-75 [transform-style:preserve-3d]" style={{ transform: `rotateY(${angle}deg)` }}>
              <Image src={`/img/cutouts/${p.slug}.webp`} alt={p.name} fill sizes="45vw" className="object-contain [backface-visibility:hidden]" />
              <Image src={`/img/cutouts/${p.slug}.webp`} alt="" fill sizes="45vw" className="[transform:rotateY(180deg)] object-contain brightness-90 [backface-visibility:hidden]" />
            </div>
            <p className="text-ink-3 absolute inset-x-0 top-5 text-center text-[12px]">
              {t(tx("Interactive preview · full GLB/USDZ 3D model ships with final packaging", "Pratonton interaktif · model 3D GLB/USDZ penuh bersama pembungkusan akhir"))}
            </p>
          </div>
        )}
        {view === "box" && <Image src={box} alt={t(tx("LUNAE packaging", "Pembungkusan LUNAE"))} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover" />}

        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center gap-2 px-4">
          <button className="btn btn-sm border-ink/70 bg-surface/90 text-ink pointer-events-auto border backdrop-blur" onClick={() => setView("360")}>
            <RotateCw className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Drag to rotate · 360°", "Seret untuk putar · 360°"))}
          </button>
          {(p.category === "lips-cheeks" || p.sub === "base") && (
            <L href={`/try-on?product=${p.slug}`} className="btn btn-sm btn-primary pointer-events-auto">
              <Camera className="h-4 w-4" strokeWidth={1.5} /> {t(tx("Try on (AR)", "Cuba (AR)"))}
            </L>
          )}
        </div>
        <span className="bg-glass absolute top-4 right-4 flex items-center gap-1.5 rounded-[10px] px-3 py-2 text-[12.5px] backdrop-blur-[14px]">
          {view === "hero" ? <ZoomIn className="h-3.5 w-3.5" /> : <Box className="h-3.5 w-3.5" />}
          {view === "hero" ? t(tx("Tap to zoom", "Ketik untuk zum")) : t(tx("View in your space (AR) · soon", "Lihat di ruang anda (AR) · akan datang"))}
        </span>
      </div>
    </div>
  );
}
