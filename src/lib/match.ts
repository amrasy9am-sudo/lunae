import type { Product, Shade } from "./types";
import { deltaE2000, hexToLab } from "./color";

export interface ProfileLike {
  hex: string;
  undertone: string;
  shade: string;
}

/** Best shade of a product for a skin profile: exact name, else nearest by ΔE2000 + undertone bonus. */
export function bestShadeFor(p: Product, profile: ProfileLike): Shade | null {
  const baseLike = p.sub === "base" || p.sub === "concealer" || p.sub === "powder";
  if (!baseLike || !p.shades.length) return null;
  const exact = p.shades.find((s) => s.name === profile.shade);
  if (exact) return exact;
  const target = hexToLab(profile.hex);
  let best: Shade | null = null;
  let bestScore = Infinity;
  for (const s of p.shades) {
    if (s.name === "Lut Sinar") continue;
    const d = deltaE2000(target, hexToLab(s.hex)) - (s.undertone === profile.undertone ? 1.5 : 0);
    if (d < bestScore) {
      bestScore = d;
      best = s;
    }
  }
  return best;
}

/** Products that have a base shade within reach of the profile. */
export function isMyShade(p: Product, profile: ProfileLike) {
  if (!(p.sub === "base" || p.sub === "concealer" || p.sub === "powder")) return true;
  const s = bestShadeFor(p, profile);
  if (!s) return false;
  return deltaE2000(hexToLab(profile.hex), hexToLab(s.hex)) < 8;
}
