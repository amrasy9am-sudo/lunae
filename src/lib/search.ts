import { products } from "@/data/catalogue";
import type { Product } from "./types";

/* BM ↔ EN synonyms so "gincu", "bedak" or "pelindung matahari" find the right products. */
const SYN: Record<string, string[]> = {
  lipstick: ["gincu", "lip", "bibir", "lipstik"],
  lip: ["bibir", "gincu", "tint", "lips"],
  cheek: ["pipi", "blush", "pemerah"],
  blush: ["pemerah", "pipi", "cheek"],
  foundation: ["alas", "base", "cushion", "kusyen", "tint", "asas"],
  base: ["alas", "foundation", "cushion", "tint"],
  cushion: ["kusyen", "foundation", "base"],
  concealer: ["pelindung cela", "tutup", "lingkaran gelap", "dark circles"],
  powder: ["bedak", "tabur", "setting"],
  sunscreen: ["spf", "pelindung matahari", "sunblock", "sun", "matahari", "uv"],
  spf: ["sunscreen", "pelindung matahari", "sunblock", "uv"],
  mascara: ["maskara", "bulu mata", "lash", "lentik"],
  eyeliner: ["liner", "pengaris", "celak", "mata"],
  brow: ["kening", "eyebrow"],
  serum: ["serum", "niacinamide", "pegaga", "centella"],
  cleanser: ["pencuci", "sabun muka", "facial wash", "cuci"],
  moisturiser: ["pelembap", "moisturizer", "gel", "lembap"],
  mist: ["semburan", "spray", "setting spray", "penetap"],
  highlighter: ["penyerlah", "glow", "shimmer", "sinar"],
  sweat: ["peluh", "berpeluh", "sweatproof", "kalis peluh", "panas", "heat"],
  oil: ["minyak", "berminyak", "oily", "kilat", "shine"],
  transfer: ["tudung", "hijab", "mask", "pelitup", "tak melekat", "won't transfer", "transferproof"],
  waterproof: ["kalis air", "tahan air", "smudge", "comot"],
  halal: ["halal", "jakim"],
  sensitive: ["sensitif", "kulit sensitif"],
};

const norm = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\p{L}\p{N}\s+]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();

function lev(a: string, b: string) {
  if (a === b) return 0;
  const m = a.length,
    n = b.length;
  if (!m || !n) return m || n;
  const d = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    let prev = d[0];
    d[0] = i;
    for (let j = 1; j <= n; j++) {
      const tmp = d[j];
      d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = tmp;
    }
  }
  return d[n];
}

function haystack(p: Product) {
  return norm(
    [p.name, p.type.en, p.type.ms, p.tagline.en, p.tagline.ms, p.category, p.sub, p.finish, ...p.claims, ...p.concerns.map((c) => c.replace(/-/g, " ")), ...p.shades.map((s) => s.name)].join(" "),
  );
}
const INDEX = products.map((p) => ({ p, text: haystack(p), words: haystack(p).split(" ") }));

function expand(token: string) {
  const out = new Set([token]);
  for (const [k, vs] of Object.entries(SYN)) {
    const all = [k, ...vs];
    if (all.some((v) => v === token || (token.length > 3 && v.startsWith(token)))) all.forEach((v) => out.add(v));
  }
  return [...out];
}

export function searchProducts(q: string) {
  const tokens = norm(q)
    .split(" ")
    .filter((t) => t.length > 1 && !["the", "a", "yang", "untuk", "for", "that", "and", "dan", "won't", "wont", "to", "on", "my", "saya"].includes(t));
  if (!tokens.length) return [];
  const scored = INDEX.map(({ p, text, words }) => {
    let score = 0;
    for (const t of tokens) {
      let best = 0;
      for (const v of expand(t)) {
        if (v.includes(" ") ? text.includes(v) : words.includes(v)) best = Math.max(best, v === t ? 3 : 2);
        else if (v.length > 3 && text.includes(v)) best = Math.max(best, 1.5);
        else if (t.length > 3 && words.some((w) => Math.abs(w.length - t.length) <= 2 && lev(w, t) <= (t.length > 6 ? 2 : 1))) best = Math.max(best, 1.2);
      }
      score += best;
    }
    if (norm(p.name).includes(norm(q))) score += 5;
    return { p, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.map((x) => x.p);
}

export const POPULAR = ["Eclipse Cushion", "tudung-proof lip", "SPF50", "concealer", "bedak", "pegaga"];
