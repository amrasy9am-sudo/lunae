import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  type: z.enum(["stockist", "affiliate", "ambassador"]),
  name: z.string().min(2).max(120),
  business: z.string().max(160).optional(),
  ssm: z.string().max(40).optional(),
  email: z.string().email(),
  phone: z.string().min(9).max(20),
  state: z.string().max(40),
  channels: z.string().max(300),
  agree: z.literal("on"),
});

export async function POST(req: Request) {
  const r = Schema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ ok: false }, { status: 400 });
  const hook = process.env.PARTNER_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: true, delivered: false });
  const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source: "lunae-partner", ...r.data, at: new Date().toISOString() }) }).catch(
    () => null,
  );
  return NextResponse.json({ ok: Boolean(res?.ok), delivered: Boolean(res?.ok) });
}
