import { NextResponse } from "next/server";
import { CheckoutSchema, normaliseMyPhone, stateFromPostcode } from "@/lib/checkout";
import { quote, SHIPPING } from "@/lib/pricing";
import { productBySlug } from "@/data/catalogue";
import { sign } from "@/lib/sign";

/**
 * Creates an order in AWAITING_PAYMENT and a (demo) gateway session.
 * All prices, discounts, points and tax are recalculated here on the server —
 * the browser's numbers are never trusted.
 */
export async function POST(req: Request) {
  const parsed = CheckoutSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid", issues: parsed.error.issues.map((i) => i.path.join(".")) }, { status: 400 });
  const input = parsed.data;

  const phone = normaliseMyPhone(input.contact.phone);
  if (!phone) return NextResponse.json({ error: "invalid", issues: ["contact.phone"] }, { status: 400 });
  const pcState = stateFromPostcode(input.address.postcode);
  if (!pcState) return NextResponse.json({ error: "invalid", issues: ["address.postcode"] }, { status: 400 });

  for (const l of input.lines) {
    const p = productBySlug(l.slug);
    if (!p) return NextResponse.json({ error: "unknown_product", slug: l.slug }, { status: 400 });
    if (p.shades.length && l.shade && !p.shades.some((s) => s.name === l.shade)) return NextResponse.json({ error: "unknown_shade", slug: l.slug }, { status: 400 });
  }

  const q = quote({ lines: input.lines, voucher: input.voucher, pointsToUse: Math.min(input.pointsToUse, input.pointsBalance), shipping: input.shipping, state: pcState });
  if (q.voucherError) return NextResponse.json({ error: "voucher", reason: q.voucherError }, { status: 400 });

  const now = Date.now();
  const no = `LN-${String(Math.floor(10000 + Math.random() * 89999))}`;
  const days = q.east ? SHIPPING.eastMalaysia.days : input.shipping === "express" ? SHIPPING.express.days : SHIPPING.standard.days;
  const order = {
    no,
    createdAt: new Date(now).toISOString(),
    status: "AWAITING_PAYMENT",
    amount: q.total,
    currency: "MYR",
    lines: q.items.map((i) => ({ slug: i.slug, shade: i.shade, qty: i.qty, name: i.name, unit: i.unit })),
    subtotal: q.subtotal,
    discount: Math.round((q.bundle.amount + q.voucherDiscount + q.pointsDiscount) * 100) / 100,
    shippingFee: q.shippingFee,
    sst: q.sstIncluded,
    pointsUsed: q.usedPoints,
    pointsEarned: q.pointsEarned,
    courier: q.east ? "Pos Laju" : input.shipping === "express" ? "Ninja Van" : "J&T",
    etaDays: days,
    address: `${input.address.line1}, ${input.address.postcode} ${input.address.city}, ${pcState}`,
    email: input.contact.email,
    phone,
    payment: input.payment,
    bank: input.bank,
    gift: input.gift.on,
    reservedUntil: new Date(now + 15 * 60_000).toISOString(),
  };
  // Signed session: the payment step and webhook can verify nothing was tampered with.
  const session = sign({ no, amount: q.total, exp: now + 30 * 60_000 });
  return NextResponse.json({ order, session, quote: q });
}
