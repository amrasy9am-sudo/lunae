import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  topic: z.string().max(40),
  order: z.string().max(40).optional(),
  message: z.string().trim().min(10).max(2000),
});

/** Validates server-side. Forwards to CONTACT_WEBHOOK_URL (e.g. helpdesk/Slack) when configured. */
export async function POST(req: Request) {
  const r = Schema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ ok: false }, { status: 400 });
  const hook = process.env.CONTACT_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: true, delivered: false });
  try {
    const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source: "lunae-contact", ...r.data }) });
    return NextResponse.json({ ok: res.ok, delivered: res.ok });
  } catch {
    return NextResponse.json({ ok: false, delivered: false }, { status: 502 });
  }
}
