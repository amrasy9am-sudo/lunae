"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Camera, Download, Grid2x2, ImageUp, ShieldCheck, X } from "lucide-react";
import { useT } from "./providers";
import { L } from "./ui";
import { FaceIllustration } from "./face-illustration";
import { tx } from "@/lib/i18n";
import { productBySlug } from "@/data/catalogue";
import { useCart, useUI } from "@/lib/store";
import { rm } from "@/lib/format";
import { CHEEK_L, CHEEK_R, LIPS_INNER, LIPS_OUTER, loadFaceLandmarker, setMode, type Landmarks } from "@/lib/face";

const AREAS = [
  { k: "lips", l: tx("Lips", "Bibir"), products: ["selene-matte-lipstick", "nightbloom-lip-cheek-tint"] },
  { k: "cheeks", l: tx("Cheeks", "Pipi"), products: ["nightbloom-lip-cheek-tint", "dusk-cream-blush"] },
  { k: "brows", l: tx("Brows", "Kening"), products: [], soon: true },
  { k: "base", l: tx("Base", "Alas"), products: [], soon: true },
] as const;

function drawMakeup(ctx: CanvasRenderingContext2D, lm: Landmarks, w: number, h: number, area: string, hex: string, mirror: boolean) {
  const X = (i: number) => (mirror ? (1 - lm[i].x) * w : lm[i].x * w);
  const Y = (i: number) => lm[i].y * h;
  ctx.save();
  if (area === "lips") {
    ctx.beginPath();
    LIPS_OUTER.forEach((i, k) => (k ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i))));
    ctx.closePath();
    LIPS_INNER.forEach((i, k) => (k ? ctx.lineTo(X(i), Y(i)) : ctx.moveTo(X(i), Y(i))));
    ctx.closePath();
    ctx.filter = `blur(${Math.max(1, w / 500)}px)`;
    ctx.globalCompositeOperation = "multiply";
    ctx.globalAlpha = 0.72;
    ctx.fillStyle = hex;
    ctx.fill("evenodd");
    ctx.globalCompositeOperation = "soft-light";
    ctx.globalAlpha = 0.35;
    ctx.fill("evenodd");
  } else if (area === "cheeks") {
    const faceW = Math.abs(lm[454].x - lm[234].x) * w;
    for (const i of [CHEEK_L, CHEEK_R]) {
      const g = ctx.createRadialGradient(X(i), Y(i), 0, X(i), Y(i), faceW * 0.16);
      g.addColorStop(0, hex + "88");
      g.addColorStop(1, hex + "00");
      ctx.globalCompositeOperation = "multiply";
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(X(i), Y(i), faceW * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

export function TryOn() {
  const t = useT();
  const sp = useSearchParams();
  const initial = productBySlug(sp.get("product") ?? "") ?? productBySlug("selene-matte-lipstick")!;
  const [area, setArea] = useState<string>(initial.category === "lips-cheeks" && initial.sub === "cheeks" ? "cheeks" : "lips");
  const [slug, setSlug] = useState(initial.category === "lips-cheeks" ? initial.slug : "selene-matte-lipstick");
  const p = productBySlug(slug)!;
  const [shade, setShade] = useState(p.shades[0]);
  const [live, setLive] = useState<"off" | "loading" | "on" | "error">("off");
  const [shots, setShots] = useState<{ url: string; label: string }[]>([]);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const state = useRef({ area, hex: shade.hex });
  const photo = useRef<HTMLImageElement | null>(null);
  const photoLm = useRef<Landmarks | null>(null);
  const file = useRef<HTMLInputElement>(null);
  const cart = useCart();
  const ui = useUI();

  useEffect(() => setShade(p.shades[0]), [p]);
  useEffect(() => () => stream.current?.getTracks().forEach((x) => x.stop()), []);

  const renderPhoto = () => {
    const c = canvas.current!;
    const img = photo.current!;
    const ctx = c.getContext("2d")!;
    ctx.drawImage(img, 0, 0, c.width, c.height);
    drawMakeup(ctx, photoLm.current!, c.width, c.height, state.current.area, state.current.hex, false);
  };

  useEffect(() => {
    state.current = { area, hex: shade.hex };
    if (photo.current && photoLm.current) renderPhoto();
  }, [area, shade]);

  const start = async () => {
    setLive("loading");
    photo.current = null;
    try {
      const [fl, s] = await Promise.all([loadFaceLandmarker(), navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 720 }, height: { ideal: 960 } }, audio: false })]);
      stream.current = s;
      const v = video.current!;
      v.srcObject = s;
      await v.play();
      await setMode(fl, "VIDEO");
      setLive("on");
      const c = canvas.current!;
      const ctx = c.getContext("2d")!;
      const loop = () => {
        if (!stream.current) return;
        if (v.videoWidth) {
          if (c.width !== v.videoWidth) {
            c.width = v.videoWidth;
            c.height = v.videoHeight;
          }
          ctx.save();
          ctx.translate(c.width, 0);
          ctx.scale(-1, 1);
          ctx.drawImage(v, 0, 0, c.width, c.height);
          ctx.restore();
          const res = fl.detectForVideo(v, performance.now());
          const lm = res.faceLandmarks?.[0];
          if (lm) drawMakeup(ctx, lm, c.width, c.height, state.current.area, state.current.hex, true);
        }
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    } catch {
      setLive("error");
    }
  };
  const stop = () => {
    stream.current?.getTracks().forEach((x) => x.stop());
    stream.current = null;
    setLive("off");
  };

  const onPhoto = async (f: File) => {
    stop();
    setLive("loading");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(f);
      await img.decode();
      const scale = Math.min(1, 1100 / Math.max(img.width, img.height));
      const c = canvas.current!;
      c.width = Math.round(img.width * scale);
      c.height = Math.round(img.height * scale);
      const fl = await loadFaceLandmarker();
      await setMode(fl, "IMAGE");
      const tmp = document.createElement("canvas");
      tmp.width = c.width;
      tmp.height = c.height;
      tmp.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const res = fl.detect(tmp);
      if (!res.faceLandmarks?.[0]) throw new Error("noface");
      photo.current = img;
      photoLm.current = res.faceLandmarks[0];
      setLive("on");
      renderPhoto();
    } catch {
      setLive("error");
    }
  };

  const capture = () => {
    const c = canvas.current;
    if (!c || live !== "on") return;
    const url = c.toDataURL("image/jpeg", 0.85);
    setShots((s) => [{ url, label: `${p.shortName} · ${shade.name}` }, ...s].slice(0, 4));
  };

  const areaDef = AREAS.find((a) => a.k === area)!;

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <div>
        <div className="bg-tint-clay relative mx-auto aspect-[3/4] max-w-md overflow-hidden rounded-[32px]">
          <video ref={video} playsInline muted className="hidden" />
          <canvas ref={canvas} className={`h-full w-full object-cover ${live === "on" ? "" : "hidden"}`} />
          {live !== "on" && (
            <div className="absolute inset-0">
              <FaceIllustration lip={area === "lips" ? shade.hex : "#C8857A"} cheek={area === "cheeks" ? shade.hex : "#E3878A"} className="h-full w-full" />
            </div>
          )}
          <span className="badge bg-cream text-cocoa-ink absolute top-4 left-4">{live === "on" ? t(tx("Live · on-device", "Langsung · dalam peranti")) : t(tx("Preview", "Pratonton"))}</span>
          <div className="bg-glass absolute top-4 right-4 rounded-[12px] px-3 py-2 text-[12.5px] backdrop-blur-[14px]">
            <strong>
              {p.shortName} · {shade.name}
            </strong>
            <br />
            <span className="text-ink-3">{t(p.type)}</span>
          </div>
          {live === "loading" && (
            <div className="absolute inset-0 grid place-items-center bg-black/30 text-[14px] text-white">{t(tx("Loading on-device face model…", "Memuat model wajah dalam peranti…"))}</div>
          )}
        </div>
        <div className="mx-auto mt-4 flex max-w-md flex-wrap justify-center gap-2">
          {live === "on" ? (
            <>
              <button className="btn btn-sm btn-primary" onClick={capture}>
                <Camera className="h-4 w-4" /> {t(tx("Capture to compare", "Tangkap untuk banding"))}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={stop}>
                <X className="h-4 w-4" /> {t(tx("Stop", "Henti"))}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-sm btn-primary" onClick={start} disabled={live === "loading"}>
                <Camera className="h-4 w-4" /> {t(tx("Start live camera", "Mula kamera langsung"))}
              </button>
              <button className="btn btn-sm btn-ghost" onClick={() => file.current?.click()}>
                <ImageUp className="h-4 w-4" /> {t(tx("Use a photo", "Guna foto"))}
              </button>
            </>
          )}
          <input ref={file} type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onPhoto(e.target.files[0])} />
        </div>
        {live === "error" && (
          <p className="text-warning mx-auto mt-3 max-w-md text-center text-[13.5px]">
            {t(
              tx(
                "We couldn't start the camera or find a face. Check camera permission and lighting, or try a clear front-facing photo.",
                "Kamera tidak dapat dimulakan atau wajah tidak dikesan. Semak kebenaran kamera dan pencahayaan, atau cuba foto hadapan yang jelas.",
              ),
            )}
          </p>
        )}
        <p className="text-ink-3 mx-auto mt-4 flex max-w-md items-start gap-2 text-[12.5px]">
          <ShieldCheck className="text-sage h-4 w-4 shrink-0" />
          {t(
            tx(
              "478-point face mesh runs entirely in your browser. Nothing is uploaded; captures stay on this page until you download them.",
              "Jaringan wajah 478 titik berjalan sepenuhnya dalam pelayar anda. Tiada apa dimuat naik; tangkapan kekal di halaman ini sehingga anda memuat turunnya.",
            ),
          )}
        </p>
      </div>
      <div>
        <div role="tablist" className="flex flex-wrap gap-2">
          {AREAS.map((a) => (
            <button
              key={a.k}
              role="tab"
              aria-selected={area === a.k}
              disabled={"soon" in a && a.soon}
              className="chip disabled:opacity-50"
              onClick={() => (setArea(a.k), a.products[0] && setSlug(a.products[0]))}
            >
              {t(a.l)}
              {"soon" in a && a.soon ? ` · ${t(tx("soon", "akan datang"))}` : ""}
            </button>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          {areaDef.products.map((s) => (
            <button key={s} className="chip" aria-pressed={slug === s} onClick={() => setSlug(s)}>
              {productBySlug(s)!.shortName}
            </button>
          ))}
        </div>
        <p className="mt-8 text-[13px] font-semibold tracking-[0.12em] uppercase">
          {t(tx("Shade", "Rona"))} · {shade.name}
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {p.shades.map((s) => (
            <button
              key={s.name}
              aria-label={s.name}
              title={s.name}
              onClick={() => setShade(s)}
              className="h-11 w-11 rounded-full border border-black/10"
              style={{ background: s.hex, boxShadow: shade.name === s.name ? "0 0 0 2.5px var(--bg), 0 0 0 4px var(--ink)" : undefined }}
            />
          ))}
        </div>
        <div className="border-line bg-surface mt-8 flex items-center justify-between rounded-[20px] border p-5">
          <div>
            <p className="product-name text-[19px]">{p.name}</p>
            <p className="text-ink-3 text-[13.5px]">
              {shade.name} · {rm(p.price)}
            </p>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              cart.add({ slug: p.slug, shade: shade.name, qty: 1 });
              ui.notify(`${p.shortName} · ${shade.name} — ${t(tx("added to bag", "dimasukkan ke troli"))}`);
            }}
          >
            {t(tx("Add", "Tambah"))} · {rm(p.price)}
          </button>
        </div>
        <div className="mt-8">
          <p className="flex items-center gap-2 text-[13px] font-semibold tracking-[0.12em] uppercase">
            <Grid2x2 className="h-4 w-4" /> {t(tx("Compare up to 4 shades", "Banding sehingga 4 rona"))}
          </p>
          {shots.length === 0 ? (
            <p className="text-ink-3 mt-3 text-[14px]">{t(tx("Start the camera, pick a shade and tap “Capture to compare”.", "Mulakan kamera, pilih rona dan ketik “Tangkap untuk banding”."))}</p>
          ) : (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {shots.map((s, i) => (
                <figure key={i} className="border-line overflow-hidden rounded-[14px] border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.url} alt={s.label} className="aspect-[3/4] w-full object-cover" />
                  <figcaption className="flex items-center justify-between px-3 py-2 text-[12.5px]">
                    {s.label}
                    <a href={s.url} download={`lunae-${s.label.replace(/\W+/g, "-")}.jpg`} aria-label={t(tx("Download", "Muat turun"))}>
                      <Download className="h-4 w-4" />
                    </a>
                  </figcaption>
                </figure>
              ))}
            </div>
          )}
        </div>
        <L href="/shade-finder" className="link mt-8 inline-block text-[14px]">
          {t(tx("Need a base shade? Try the AI Shade Finder", "Perlukan rona alas? Cuba Pencari Rona AI"))}
        </L>
      </div>
    </div>
  );
}
