"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Camera, ImageUp, ListChecks, ShieldCheck, Sparkles } from "lucide-react";
import { useT } from "./providers";
import { L, Toggle } from "./ui";
import { FaceIllustration } from "./face-illustration";
import { tx } from "@/lib/i18n";
import { products } from "@/data/catalogue";
import { deltaE2000, estimateKelvin, hexToLab, rgbToHex, rgbToLab, undertoneFromLab, whiteBalance } from "@/lib/color";
import { useProfile, useUI, type ShadeProfile } from "@/lib/store";
import { frameStats, loadFaceLandmarker, sampleSkin, setMode } from "@/lib/face";
import type { Shade, Undertone } from "@/lib/types";

const BASE_SHADES: Shade[] = products.find((p) => p.slug === "eclipse-cushion")!.shades; // full 12-shade range
const UT: Record<Undertone, { en: string; ms: string }> = { cool: tx("Cool", "Sejuk"), neutral: tx("Neutral", "Neutral"), warm: tx("Warm", "Hangat"), olive: tx("Olive", "Zaitun") };

type Result = { shade: Shade; undertone: Undertone; confidence: number; method: "selfie" | "quiz"; measuredHex?: string };

function matchFromLab(lab: [number, number, number]) {
  const ut = undertoneFromLab(lab);
  const ranked = BASE_SHADES.map((s) => ({ s, d: deltaE2000(lab, hexToLab(s.hex)) - (s.undertone === ut ? 1.2 : 0) })).sort((a, b) => a.d - b.d);
  const best = ranked[0];
  const gap = ranked[1].d - best.d;
  const confidence = Math.round(Math.max(45, Math.min(97, 100 - best.d * 4.2 + gap * 3)));
  return { shade: best.s, undertone: ut, confidence };
}

function neighbours(s: Shade) {
  const i = BASE_SHADES.findIndex((x) => x.name === s.name);
  return [BASE_SHADES[i - 1], s, BASE_SHADES[i + 1]].filter(Boolean) as Shade[];
}

/* ------------------------------ Selfie ------------------------------ */
function Selfie({ onResult, onFallback }: { onResult: (r: Result) => void; onFallback: () => void }) {
  const t = useT();
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const stream = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "denied" | "error">("loading");
  const [light, setLight] = useState<{ k: number; lum: number } | null>(null);
  const [face, setFace] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let raf = 0;
    let alive = true;
    (async () => {
      try {
        const [fl, s] = await Promise.all([loadFaceLandmarker(), navigator.mediaDevices.getUserMedia({ video: { facingMode: "user", width: { ideal: 960 }, height: { ideal: 1280 } }, audio: false })]);
        if (!alive) return s.getTracks().forEach((x) => x.stop());
        stream.current = s;
        const v = video.current!;
        v.srcObject = s;
        await v.play();
        await setMode(fl, "VIDEO");
        setStatus("ready");
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        let last = 0;
        const loop = (ts: number) => {
          if (!alive) return;
          if (ts - last > 250 && v.videoWidth) {
            last = ts;
            c.width = 160;
            c.height = Math.round((160 * v.videoHeight) / v.videoWidth);
            ctx.drawImage(v, 0, 0, c.width, c.height);
            const st = frameStats(ctx, c.width, c.height);
            setLight({ k: estimateKelvin(st.avg), lum: st.lum });
            const res = fl.detectForVideo(v, performance.now());
            setFace(!!res.faceLandmarks?.length);
          }
          raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
      } catch (e) {
        if (!alive) return;
        setStatus((e as Error)?.name === "NotAllowedError" ? "denied" : "error");
      }
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      stream.current?.getTracks().forEach((x) => x.stop());
    };
  }, []);

  const analyse = async (src: HTMLVideoElement | HTMLImageElement, w: number, h: number, isImage: boolean) => {
    const fl = await loadFaceLandmarker();
    const c = canvas.current!;
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d", { willReadFrequently: true })!;
    ctx.drawImage(src, 0, 0, w, h);
    await setMode(fl, isImage ? "IMAGE" : "VIDEO");
    const res = isImage ? fl.detect(c) : fl.detectForVideo(c, performance.now());
    const lm = res.faceLandmarks?.[0];
    if (!lm) {
      ctx.clearRect(0, 0, w, h);
      return null;
    }
    const skin = sampleSkin(ctx, lm, w, h);
    const st = frameStats(ctx, w, h);
    ctx.clearRect(0, 0, w, h); // discard the image immediately
    c.width = 1;
    c.height = 1;
    if (!skin) return null;
    const wb = whiteBalance(st.avg);
    const corrected = skin.map((v, i) => Math.min(255, v * (1 + (wb[i] - 1) * 0.6))) as [number, number, number];
    const lab = rgbToLab(corrected);
    const m = matchFromLab(lab);
    const k = estimateKelvin(st.avg);
    const lightPenalty = k < 3800 || k > 7500 ? 12 : k < 4500 || k > 6500 ? 5 : 0;
    return { ...m, confidence: Math.max(40, m.confidence - lightPenalty), method: "selfie" as const, measuredHex: rgbToHex(...corrected) };
  };

  const capture = async () => {
    const v = video.current!;
    const r = await analyse(v, v.videoWidth, v.videoHeight, false);
    stream.current?.getTracks().forEach((x) => x.stop());
    if (r) onResult(r);
    else onFallback();
  };

  const good = light && light.lum > 70 && light.lum < 215 && light.k > 4200 && light.k < 7000;
  const lightLabel = !light
    ? "…"
    : light.lum <= 70
      ? t(tx("Too dark — face a window", "Terlalu gelap — hadap tingkap"))
      : light.lum >= 215
        ? t(tx("Too bright — step out of direct sun", "Terlalu terang — elak cahaya matahari terus"))
        : light.k <= 4200
          ? t(tx("Light is too warm — try daylight", "Cahaya terlalu kuning — cuba cahaya siang"))
          : light.k >= 7000
            ? t(tx("Light is too cool", "Cahaya terlalu biru"))
            : t(tx("Good", "Baik"));

  if (status === "denied" || status === "error")
    return (
      <div className="border-line bg-surface rounded-[24px] border p-8 text-center">
        <p className="font-serif text-[20px] font-semibold">
          {status === "denied"
            ? t(tx("Camera access was declined.", "Akses kamera ditolak."))
            : t(tx("The camera or face model couldn't start on this device.", "Kamera atau model wajah tidak dapat dimulakan pada peranti ini."))}
        </p>
        <p className="text-ink-2 mt-2">{t(tx("You can upload a photo instead, or take the 6-question quiz.", "Anda boleh muat naik foto, atau jawab kuiz 6 soalan."))}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button className="btn btn-secondary btn-sm" onClick={() => file.current?.click()}>
            <ImageUp className="h-4 w-4" /> {t(tx("Upload a photo", "Muat naik foto"))}
          </button>
          <button className="btn btn-primary btn-sm" onClick={onFallback}>
            <ListChecks className="h-4 w-4" /> {t(tx("Take the quiz", "Jawab kuiz"))}
          </button>
        </div>
        <input
          ref={file}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            const img = new Image();
            img.src = URL.createObjectURL(f);
            await img.decode();
            const scale = Math.min(1, 1200 / Math.max(img.width, img.height));
            const r = await analyse(img, Math.round(img.width * scale), Math.round(img.height * scale), true).catch(() => null);
            URL.revokeObjectURL(img.src);
            if (r) onResult(r);
            else onFallback();
          }}
        />
        <canvas ref={canvas} className="hidden" />
      </div>
    );

  return (
    <div className="mx-auto max-w-md">
      <div className="bg-night relative aspect-[3/4] overflow-hidden rounded-[28px]">
        <video ref={video} playsInline muted className="h-full w-full -scale-x-100 object-cover" />
        <svg viewBox="0 0 300 400" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          <defs>
            <mask id="oval">
              <rect width="300" height="400" fill="white" />
              <ellipse cx="150" cy="185" rx="95" ry="125" fill="black" />
            </mask>
          </defs>
          <rect width="300" height="400" fill="rgba(21,19,31,.45)" mask="url(#oval)" />
          <ellipse cx="150" cy="185" rx="95" ry="125" fill="none" stroke={face ? "#9db08e" : "#fff"} strokeWidth="2" strokeDasharray="6 6" />
        </svg>
        {status === "loading" && (
          <div className="text-moon absolute inset-0 grid place-items-center text-[14px]">{t(tx("Starting camera & on-device model…", "Memulakan kamera & model dalam peranti…"))}</div>
        )}
        <div className="bg-glass absolute inset-x-4 bottom-4 rounded-[14px] p-3 backdrop-blur-[14px]">
          <div className="flex justify-between text-[13px]">
            <span>{t(tx("Lighting", "Pencahayaan"))}</span>
            <span className={good ? "text-sage" : "text-warning"}>
              {lightLabel}
              {light ? ` · ${light.k.toLocaleString()}K` : ""}
            </span>
          </div>
          <div className="bg-line mt-2 h-1.5 overflow-hidden rounded-full">
            <div className={`h-full rounded-full transition-all ${good ? "bg-sage" : "bg-warning"}`} style={{ width: `${light ? Math.min(100, (light.lum / 160) * 100) : 0}%` }} />
          </div>
        </div>
      </div>
      <p className="text-ink-3 mt-4 text-center text-[13.5px]">
        {face
          ? t(tx("Face found — hold still, no filters, natural light.", "Wajah dikesan — jangan bergerak, tanpa penapis, cahaya semula jadi."))
          : t(tx("Fit your face inside the oval, without glasses or heavy makeup.", "Letakkan wajah dalam bujur, tanpa cermin mata atau solekan tebal."))}
      </p>
      <button className="btn btn-primary mt-5 w-full" disabled={status !== "ready" || !face} onClick={capture}>
        <Camera className="h-4 w-4" /> {t(tx("Analyse my shade", "Analisis rona saya"))}
      </button>
      <canvas ref={canvas} className="hidden" />
    </div>
  );
}

/* ------------------------------ Quiz ------------------------------ */
const Q_DEPTH = [
  { l: tx("Very fair", "Sangat cerah"), hex: "#F5E0CC", d: 0 },
  { l: tx("Fair", "Cerah"), hex: "#EED0B2", d: 2 },
  { l: tx("Light-medium", "Terang-sederhana"), hex: "#E3BC8E", d: 4 },
  { l: tx("Medium", "Sederhana"), hex: "#D09A6C", d: 6 },
  { l: tx("Tan", "Sawo matang"), hex: "#B2774D", d: 8 },
  { l: tx("Deep", "Gelap"), hex: "#7C4D31", d: 10 },
];

function Quiz({ onResult }: { onResult: (r: Result & { skinType: ShadeProfile["skinType"]; concerns: string[] }) => void }) {
  const t = useT();
  const [step, setStep] = useState(0);
  const [a, setA] = useState<{ depth?: number; vein?: Undertone; sun?: number; metal?: Undertone | "both"; skin?: ShadeProfile["skinType"]; concerns: string[] }>({ concerns: [] });
  const qs = [
    {
      q: tx("Which is closest to your skin in natural daylight?", "Yang mana paling hampir dengan kulit anda di cahaya siang?"),
      body: (
        <div className="grid grid-cols-3 gap-3">
          {Q_DEPTH.map((o) => (
            <button
              key={o.d}
              className={`rounded-[16px] border p-3 text-center transition ${a.depth === o.d ? "border-ink bg-surface" : "border-line hover:border-ink"}`}
              onClick={() => (setA({ ...a, depth: o.d }), setStep(1))}
            >
              <span className="mx-auto block h-12 w-12 rounded-full" style={{ background: o.hex }} />
              <span className="mt-2 block text-[13.5px]">{t(o.l)}</span>
            </button>
          ))}
        </div>
      ),
    },
    {
      q: tx("Look at the veins on your inner wrist. They look…", "Lihat urat di pergelangan tangan dalam. Ia kelihatan…"),
      opts: [
        { l: tx("Blue or purple", "Biru atau ungu"), v: "cool" },
        { l: tx("Green", "Hijau"), v: "warm" },
        { l: tx("A mix — hard to tell", "Campuran — sukar dikenal pasti"), v: "neutral" },
        { l: tx("Greenish-grey; skin can look slightly ashy", "Hijau keabuan; kulit kadang nampak kelabu"), v: "olive" },
      ],
      set: (v: string) => setA({ ...a, vein: v as Undertone }),
    },
    {
      q: tx("After an hour in the midday sun, your skin…", "Selepas sejam di bawah matahari tengah hari, kulit anda…"),
      opts: [
        { l: tx("Burns, rarely tans", "Terbakar, jarang gelap"), v: "-1" },
        { l: tx("Burns a little, then tans", "Terbakar sedikit, kemudian gelap"), v: "0" },
        { l: tx("Tans easily", "Mudah gelap"), v: "1" },
        { l: tx("Rarely burns, deepens a lot", "Jarang terbakar, cepat gelap"), v: "1" },
      ],
      set: (v: string) => setA({ ...a, sun: +v }),
    },
    {
      q: tx("Which jewellery flatters you more?", "Barang kemas mana lebih sesuai dengan anda?"),
      opts: [
        { l: tx("Gold", "Emas"), v: "warm" },
        { l: tx("Silver", "Perak"), v: "cool" },
        { l: tx("Both look good", "Kedua-duanya sesuai"), v: "both" },
      ],
      set: (v: string) => setA({ ...a, metal: v as Undertone | "both" }),
    },
    {
      q: tx("By 2 pm, your skin usually feels…", "Menjelang 2 petang, kulit anda biasanya terasa…"),
      opts: [
        { l: tx("Oily all over", "Berminyak seluruhnya"), v: "oily" },
        { l: tx("Oily T-zone, normal cheeks", "Zon-T berminyak, pipi normal"), v: "combination" },
        { l: tx("Comfortable", "Selesa"), v: "normal" },
        { l: tx("Tight or dry", "Ketat atau kering"), v: "dry" },
      ],
      set: (v: string) => setA({ ...a, skin: v as ShadeProfile["skinType"] }),
    },
    {
      q: tx("Anything else you'd like help with? (optional)", "Ada lagi yang anda perlukan? (pilihan)"),
      multi: [
        { l: tx("Shine", "Kilat"), v: "shine" },
        { l: tx("Dark spots", "Bintik gelap"), v: "dark-spots" },
        { l: tx("Dark circles", "Lingkaran gelap"), v: "dark-circles" },
        { l: tx("Redness", "Kemerahan"), v: "redness" },
        { l: tx("Sensitive skin", "Kulit sensitif"), v: "sensitive" },
        { l: tx("Pores", "Pori"), v: "pores" },
      ],
    },
  ];

  const finish = () => {
    const votes: Record<string, number> = { cool: 0, neutral: 0, warm: 0, olive: 0 };
    if (a.vein) votes[a.vein] += 2;
    if (a.metal === "both") votes.neutral += 1;
    else if (a.metal) votes[a.metal] += 1;
    const ut = (Object.entries(votes).sort((x, y) => y[1] - x[1])[0][0] ?? "neutral") as Undertone;
    const depth = Math.max(0, Math.min(11, (a.depth ?? 6) + (a.sun ?? 0)));
    const cands = BASE_SHADES.map((s) => ({ s, score: Math.abs((s.depth ?? 0) - depth) * 2 + (s.undertone === ut ? 0 : 1.5) })).sort((x, y) => x.score - y.score);
    const confidence = Math.round(Math.max(62, 86 - cands[0].score * 6));
    onResult({ shade: cands[0].s, undertone: ut, confidence, method: "quiz", skinType: a.skin, concerns: a.concerns });
  };

  const cur = qs[step];
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-3">
        {step > 0 && (
          <button className="hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-full" onClick={() => setStep(step - 1)} aria-label={t(tx("Back", "Kembali"))}>
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}
        <div className="bg-line h-1 flex-1 overflow-hidden rounded-full">
          <div className="bg-ink h-full rounded-full transition-all" style={{ width: `${((step + 1) / qs.length) * 100}%` }} />
        </div>
        <span className="text-ink-3 text-[13px]">
          {step + 1}/{qs.length}
        </span>
      </div>
      <h2 className="font-display mt-8 text-[34px] leading-tight">{t(cur.q)}</h2>
      <div className="mt-6">
        {"body" in cur && cur.body}
        {"opts" in cur && cur.opts && (
          <div className="grid gap-3">
            {cur.opts.map((o) => (
              <button
                key={o.l.en}
                className="border-line bg-surface hover:border-ink rounded-[16px] border px-5 py-4 text-left text-[15.5px] transition"
                onClick={() => {
                  cur.set!(o.v);
                  setStep(step + 1);
                }}
              >
                {t(o.l)}
              </button>
            ))}
          </div>
        )}
        {"multi" in cur && cur.multi && (
          <>
            <div className="flex flex-wrap gap-2">
              {cur.multi.map((o) => (
                <button
                  key={o.v}
                  className="chip"
                  aria-pressed={a.concerns.includes(o.v)}
                  onClick={() => setA({ ...a, concerns: a.concerns.includes(o.v) ? a.concerns.filter((x) => x !== o.v) : [...a.concerns, o.v] })}
                >
                  {t(o.l)}
                </button>
              ))}
            </div>
            <button className="btn btn-primary mt-8 w-full" onClick={finish}>
              {t(tx("See my shade", "Lihat rona saya"))}
            </button>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------ Result ------------------------------ */
function ResultView({ r, onRestart, extra }: { r: Result; onRestart: () => void; extra?: Pick<ShadeProfile, "skinType" | "concerns"> }) {
  const t = useT();
  const setProfile = useProfile((s) => s.setProfile);
  const notify = useUI((s) => s.notify);
  const [sel, setSel] = useState(r.shade);
  const [save, setSave] = useState(true);
  const [saved, setSaved] = useState(false);
  const base = products.filter((p) => p.sub === "base" || p.sub === "concealer" || p.sub === "powder");
  const low = r.confidence < 70;
  return (
    <div className="mx-auto max-w-2xl">
      <p className="eyebrow text-sage">{t(tx("Your match", "Padanan anda"))}</p>
      <div className="mt-4 flex items-center gap-5">
        <span className="h-20 w-20 shrink-0 rounded-full border border-black/10" style={{ background: sel.hex }} />
        <div>
          <p className="font-display text-[44px] leading-none">
            {sel.name} · {sel.code}
          </p>
          <p className="text-ink-2 mt-2">
            {t(UT[r.undertone])} {t(tx("undertone", "undertone"))} · {r.confidence}% {t(tx("confidence", "keyakinan"))} ·{" "}
            {r.method === "selfie" ? t(tx("selfie analysis", "analisis swafoto")) : t(tx("quiz", "kuiz"))}
          </p>
        </div>
      </div>
      {low && (
        <p className="bg-tint-blush mt-5 rounded-[14px] p-4 text-[14.5px]">
          {t(
            tx(
              "Confidence is below 70%. Compare the neighbouring shades below, retake in daylight, or order a sample sachet with your first purchase.",
              "Keyakinan di bawah 70%. Bandingkan rona bersebelahan di bawah, ulang dalam cahaya siang, atau pesan sampel bersama pembelian pertama.",
            ),
          )}
        </p>
      )}
      <p className="mt-8 text-[13px] font-semibold tracking-[0.12em] uppercase">{t(tx("Neighbouring shades", "Rona bersebelahan"))}</p>
      <div className="mt-3 grid grid-cols-3 gap-3">
        {neighbours(r.shade).map((s) => (
          <button key={s.name} onClick={() => setSel(s)} className={`rounded-[16px] border p-4 text-center ${sel.name === s.name ? "border-ink bg-surface" : "border-line"}`}>
            <span className="mx-auto block h-10 w-10 rounded-full" style={{ background: s.hex }} />
            <span className="mt-2 block text-[14px]">{s.name}</span>
            <span className="text-ink-3 block text-[12px]">{s.code}</span>
          </button>
        ))}
      </div>
      <p className="mt-8 text-[13px] font-semibold tracking-[0.12em] uppercase">{t(tx("Matched across base products", "Dipadankan merentas produk alas"))}</p>
      <ul className="divide-line border-line bg-surface mt-3 divide-y rounded-[16px] border">
        {base.map((p) => {
          const exact = p.shades.find((s) => s.name === sel.name);
          const near =
            exact ?? [...p.shades].filter((s) => s.depth !== undefined).sort((a, b) => Math.abs((a.depth ?? 0) - (sel.depth ?? 0)) - Math.abs((b.depth ?? 0) - (sel.depth ?? 0)))[0] ?? p.shades[0];
          return (
            <li key={p.slug} className="flex items-center justify-between gap-3 px-4 py-3">
              <L href={`/products/${p.slug}`} className="product-name hover:text-accent-deep">
                {p.name}
              </L>
              <span className="flex items-center gap-2 text-[14px]">
                <span className="h-4 w-4 rounded-full" style={{ background: near.hex }} /> {near.name}
              </span>
            </li>
          );
        })}
      </ul>
      <label className="border-line mt-6 flex items-center justify-between gap-4 rounded-[16px] border p-4 text-[14.5px]">
        <span>
          <span className="block font-semibold">{t(tx("Save to my skin profile", "Simpan ke profil kulit saya"))}</span>
          <span className="text-ink-3 block text-[13px]">
            {t(tx("Only colour values are saved on this device. Your image was discarded after analysis.", "Hanya nilai warna disimpan pada peranti ini. Imej anda dibuang selepas analisis."))}
          </span>
        </span>
        <Toggle checked={save} onChange={setSave} label={t(tx("Save profile", "Simpan profil"))} />
      </label>
      <div className="mt-6 flex flex-wrap gap-3">
        <L
          href="/shop/face"
          className="btn btn-primary flex-1"
          onClick={() => {
            if (save && !saved) {
              setProfile({
                shade: sel.name,
                code: sel.code ?? "",
                hex: sel.hex,
                undertone: (sel.undertone ?? r.undertone) as Undertone,
                confidence: r.confidence,
                method: r.method,
                at: new Date().toISOString(),
                ...extra,
              });
              setSaved(true);
            }
          }}
        >
          {t(tx("See my matched products", "Lihat produk padanan saya"))}
        </L>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setProfile({
              shade: sel.name,
              code: sel.code ?? "",
              hex: sel.hex,
              undertone: (sel.undertone ?? r.undertone) as Undertone,
              confidence: r.confidence,
              method: r.method,
              at: new Date().toISOString(),
              ...extra,
            });
            setSaved(true);
            notify(t(tx("Shade profile saved", "Profil rona disimpan")));
          }}
          disabled={saved}
        >
          {saved ? t(tx("Saved", "Disimpan")) : t(tx("Save", "Simpan"))}
        </button>
        <button className="btn btn-ghost" onClick={onRestart}>
          {t(tx("Start again", "Mula semula"))}
        </button>
      </div>
    </div>
  );
}

export function ShadeFinder() {
  const t = useT();
  const [mode, setModeState] = useState<"intro" | "selfie" | "quiz" | "result">("intro");
  const [r, setR] = useState<Result | null>(null);
  const [extra, setExtra] = useState<Pick<ShadeProfile, "skinType" | "concerns">>();
  if (mode === "result" && r) return <ResultView r={r} extra={extra} onRestart={() => (setR(null), setModeState("intro"))} />;
  if (mode === "selfie") return <Selfie onResult={(x) => (setR(x), setModeState("result"))} onFallback={() => setModeState("quiz")} />;
  if (mode === "quiz")
    return (
      <Quiz
        onResult={(x) => {
          setExtra({ skinType: x.skinType, concerns: x.concerns });
          setR(x);
          setModeState("result");
        }}
      />
    );
  return (
    <div className="grid items-center gap-12 lg:grid-cols-2">
      <div className="border-cocoa-ink mx-auto w-full max-w-sm overflow-hidden rounded-[32px] border-[8px] shadow-[var(--shadow-e3)]">
        <FaceIllustration lip="#C26B63" skin="#D09A6C" className="block w-full" />
      </div>
      <div>
        <div className="grid gap-4">
          <button onClick={() => setModeState("selfie")} className="border-line bg-surface hover:border-ink flex items-start gap-4 rounded-[20px] border p-6 text-left transition">
            <Camera className="text-accent-deep mt-1 h-6 w-6 shrink-0" strokeWidth={1.5} />
            <span>
              <span className="block font-serif text-[21px] font-semibold">{t(tx("Guided selfie", "Swafoto berpandu"))}</span>
              <span className="text-ink-2 mt-1 block text-[14.5px]">
                {t(tx("Light meter + face frame → shade, undertone & confidence in ~10 seconds.", "Meter cahaya + bingkai wajah → rona, undertone & keyakinan dalam ~10 saat."))}
              </span>
            </span>
          </button>
          <button onClick={() => setModeState("quiz")} className="border-line bg-surface hover:border-ink flex items-start gap-4 rounded-[20px] border p-6 text-left transition">
            <ListChecks className="text-accent-deep mt-1 h-6 w-6 shrink-0" strokeWidth={1.5} />
            <span>
              <span className="block font-serif text-[21px] font-semibold">{t(tx("6-question quiz", "Kuiz 6 soalan"))}</span>
              <span className="text-ink-2 mt-1 block text-[14.5px]">{t(tx("No camera needed. Takes under a minute.", "Tanpa kamera. Kurang seminit."))}</span>
            </span>
          </button>
        </div>
        <p className="text-ink-3 mt-6 flex items-start gap-2 text-[13.5px]">
          <ShieldCheck className="text-sage h-4 w-4 shrink-0" />
          {t(
            tx(
              "Analysis runs on your device. Your camera feed is never uploaded and the image is discarded straight after — only colour values are kept, if you choose to save them.",
              "Analisis berjalan dalam peranti anda. Suapan kamera tidak pernah dimuat naik dan imej dibuang serta-merta — hanya nilai warna disimpan, jika anda memilih untuk menyimpannya.",
            ),
          )}
        </p>
        <p className="text-ink-3 mt-3 flex items-start gap-2 text-[13.5px]">
          <Sparkles className="text-accent-deep h-4 w-4 shrink-0" />
          {t(tx("Wrong shade anyway? It's covered by the 30-day Shade-Match Guarantee.", "Masih salah rona? Dilindungi Jaminan Padanan Rona 30 hari."))}
        </p>
      </div>
    </div>
  );
}
