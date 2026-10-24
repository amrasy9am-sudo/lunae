import { FREE_SHIPPING, SST_RATE, productBySlug, sets } from "@/data/catalogue";
import type { CartLine } from "./types";

export const VOUCHERS: Record<string, { type: "pct" | "fixed"; value: number; min: number; label: string }> = {
  BERSERI10: { type: "pct", value: 0.1, min: 60, label: "10% off (min RM60)" },
  MERDEKA: { type: "fixed", value: 15, min: 100, label: "RM15 off (min RM100)" },
  CIRCLE200: { type: "fixed", value: 2, min: 0, label: "Welcome RM2" },
};

export const SHIPPING = {
  standard: { key: "standard", courier: "J&T", fee: 6, days: [1, 3] as [number, number] },
  express: { key: "express", courier: "Ninja Van", fee: 8, days: [1, 1] as [number, number] },
  eastMalaysia: { fee: 12, days: [3, 7] as [number, number] },
};

export const POINTS_PER_RM = 1; // 1 point per RM1
export const POINT_VALUE = 0.01; // 100 points = RM1

export type Tier = "sabit" | "separa" | "purnama";
export const TIERS: { key: Tier; name: string; min: number; mult: number }[] = [
  { key: "sabit", name: "Sabit", min: 0, mult: 1 },
  { key: "separa", name: "Separa", min: 300, mult: 1.25 },
  { key: "purnama", name: "Purnama", min: 800, mult: 1.5 },
];
export const tierFor = (yearSpend: number) => [...TIERS].reverse().find((t) => yearSpend >= t.min) ?? TIERS[0];

/**
 * The bundle rule: if every item of a routine set (or ≥3 distinct
 * skincare/routine items via the Routine Builder) is in the bag, the
 * set discount applies to those items.
 */
export function bundleDiscount(lines: CartLine[]) {
  const slugs = new Set(lines.map((l) => l.slug));
  let best = { amount: 0, label: "" };
  // Generic routine rule (Routine Builder): 3 distinct products −10%, 4+ −12% on one of each.
  if (slugs.size >= 3) {
    const pct = slugs.size >= 4 ? 0.12 : 0.1;
    const sub = [...slugs].reduce((a, s) => a + (productBySlug(s)?.price ?? 0), 0);
    best = { amount: Math.round(sub * pct * 100) / 100, label: `Routine bundle −${Math.round(pct * 100)}%` };
  }
  for (const s of sets) {
    if (s.items.every((i) => slugs.has(i))) {
      const sub = s.items.reduce((a, i) => a + (productBySlug(i)?.price ?? 0), 0);
      const amount = Math.round(sub * s.discount * 100) / 100;
      if (amount > best.amount) best = { amount, label: `${s.name.en} −${Math.round(s.discount * 100)}%` };
    }
  }
  return best;
}

export interface QuoteInput {
  lines: CartLine[];
  voucher?: string;
  pointsToUse?: number;
  shipping?: "standard" | "express";
  state?: string;
}

export function quote({ lines, voucher, pointsToUse = 0, shipping = "standard", state }: QuoteInput) {
  const items = lines
    .map((l) => {
      const p = productBySlug(l.slug);
      if (!p) return null;
      const qty = Math.max(1, Math.min(10, Math.floor(l.qty)));
      return { ...l, qty, name: p.name, unit: p.price, total: p.price * qty };
    })
    .filter(Boolean) as (CartLine & { name: string; unit: number; total: number })[];

  const subtotal = items.reduce((a, i) => a + i.total, 0);
  const bundle = bundleDiscount(items);
  let voucherDiscount = 0;
  let voucherError: string | undefined;
  const v = voucher ? VOUCHERS[voucher.trim().toUpperCase()] : undefined;
  if (voucher && !v) voucherError = "invalid";
  else if (v && subtotal < v.min) voucherError = "min";
  else if (v) voucherDiscount = v.type === "pct" ? Math.round((subtotal - bundle.amount) * v.value * 100) / 100 : v.value;

  const afterDiscounts = Math.max(0, subtotal - bundle.amount - voucherDiscount);
  // points can cover at most 30% of the order (discount discipline)
  const maxPoints = Math.floor((afterDiscounts * 0.3) / POINT_VALUE / 100) * 100;
  const usedPoints = Math.max(0, Math.min(Math.floor(pointsToUse / 100) * 100, maxPoints));
  const pointsDiscount = usedPoints * POINT_VALUE;

  const east = state ? /sabah|sarawak|labuan/i.test(state) : false;
  const merch = afterDiscounts - pointsDiscount;
  let shippingFee = 0;
  if (east) shippingFee = merch >= FREE_SHIPPING ? 0 : SHIPPING.eastMalaysia.fee;
  else if (shipping === "express") shippingFee = SHIPPING.express.fee;
  else shippingFee = merch >= FREE_SHIPPING ? 0 : SHIPPING.standard.fee;

  const total = Math.round((merch + shippingFee) * 100) / 100;
  // prices are SST-inclusive; show the included tax
  const sstIncluded = Math.round((total - total / (1 + SST_RATE)) * 100) / 100;
  const pointsEarned = Math.floor(merch * POINTS_PER_RM);

  return {
    items,
    subtotal,
    bundle,
    voucherDiscount,
    voucherError,
    usedPoints,
    maxPoints,
    pointsDiscount,
    shippingFee,
    east,
    total,
    sstIncluded,
    pointsEarned,
    freeShippingGap: Math.max(0, FREE_SHIPPING - merch),
  };
}
