import { NextResponse } from "next/server";
import { z } from "zod";
import { sign, verify } from "@/lib/sign";

/**
 * Demo payment-gateway webhook. In production this endpoint receives the
 * gateway's HMAC-signed callback; the order switches to PAID only after the
 * signature and amount are verified here — never from a browser "success" page.
 */
const Body = z.object({ session: z.string(), result: z.enum(["success", "failed"]), amount: z.number() });

export async function POST(req: Request) {
  const b = Body.safeParse(await req.json().catch(() => null));
  if (!b.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const s = verify<{ no: string; amount: number; exp: number }>(b.data.session);
  if (!s) return NextResponse.json({ error: "bad_signature" }, { status: 401 });
  if (Date.now() > s.exp) return NextResponse.json({ status: "CANCELLED", reason: "expired" }, { status: 410 });
  if (Math.abs(s.amount - b.data.amount) > 0.001) return NextResponse.json({ error: "amount_mismatch" }, { status: 409 });
  if (b.data.result === "failed") return NextResponse.json({ no: s.no, status: "AWAITING_PAYMENT", paid: false });
  return NextResponse.json({ no: s.no, status: "PAID", paid: true, receipt: sign({ no: s.no, paid: true, at: Date.now() }) });
}
