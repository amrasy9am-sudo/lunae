"use client";

/* On-device face landmarks (MediaPipe Face Landmarker, WASM + WebGL).
   Camera frames never leave the browser. Loaded only when a customer opens
   the Shade Finder or AR try-on, so it never touches the page JS budget. */

import type { FaceLandmarker as FL, NormalizedLandmark } from "@mediapipe/tasks-vision";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.1.1/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task";

let instance: Promise<FL> | null = null;
let mode: "VIDEO" | "IMAGE" = "VIDEO";

export function loadFaceLandmarker(): Promise<FL> {
  if (!instance) {
    instance = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks(WASM);
      const make = (delegate: "GPU" | "CPU") =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL, delegate },
          runningMode: "VIDEO",
          numFaces: 1,
          outputFaceBlendshapes: false,
        });
      try {
        return await make("GPU");
      } catch {
        return await make("CPU");
      }
    })();
    instance.catch(() => (instance = null));
  }
  return instance;
}

export async function setMode(fl: FL, m: "VIDEO" | "IMAGE") {
  if (mode !== m) {
    await fl.setOptions({ runningMode: m });
    mode = m;
  }
}

export const LIPS_OUTER = [61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291, 409, 270, 269, 267, 0, 37, 39, 40, 185];
export const LIPS_INNER = [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191];
export const CHEEK_L = 50;
export const CHEEK_R = 280;
export const FOREHEAD = 151;
export const BROW_L = [70, 63, 105, 66, 107, 55, 65, 52, 53, 46];
export const BROW_R = [300, 293, 334, 296, 336, 285, 295, 282, 283, 276];

export type Landmarks = NormalizedLandmark[];

/** Average sRGB of small patches around given landmarks. */
export function sampleSkin(ctx: CanvasRenderingContext2D, lm: Landmarks, w: number, h: number, idx = [CHEEK_L, CHEEK_R, FOREHEAD]) {
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  const faceW = Math.abs(lm[454].x - lm[234].x) * w;
  const s = Math.max(4, Math.round(faceW * 0.05));
  for (const i of idx) {
    const cx = Math.round(lm[i].x * w);
    const cy = Math.round(lm[i].y * h);
    const d = ctx.getImageData(Math.max(0, cx - s), Math.max(0, cy - s), s * 2, s * 2).data;
    for (let k = 0; k < d.length; k += 4) {
      const lum = 0.2126 * d[k] + 0.7152 * d[k + 1] + 0.0722 * d[k + 2];
      if (lum < 25 || lum > 245) continue; // skip shadows & specular highlights
      r += d[k];
      g += d[k + 1];
      b += d[k + 2];
      n++;
    }
  }
  return n ? ([r / n, g / n, b / n] as [number, number, number]) : null;
}

export function frameStats(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const step = 16;
  const d = ctx.getImageData(0, 0, w, h).data;
  let r = 0,
    g = 0,
    b = 0,
    n = 0;
  for (let y = 0; y < h; y += step)
    for (let x = 0; x < w; x += step) {
      const k = (y * w + x) * 4;
      r += d[k];
      g += d[k + 1];
      b += d[k + 2];
      n++;
    }
  const avg: [number, number, number] = [r / n, g / n, b / n];
  const lum = 0.2126 * avg[0] + 0.7152 * avg[1] + 0.0722 * avg[2];
  return { avg, lum };
}
