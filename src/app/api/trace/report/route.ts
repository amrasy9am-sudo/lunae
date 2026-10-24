import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({ batch: z.string().max(20), product: z.string().max(80), details: z.string().min(10).max(2000), contact: z.string().min(5).max(120) });

/** Adverse-event intake → ADVERSE_EVENT_WEBHOOK_URL (helpdesk) when configured. */
export async function POST(req: Request) {
  const r = Schema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ ok: false }, { status: 400 });
  const hook = process.env.ADVERSE_EVENT_WEBHOOK_URL;
  if (!hook) return NextResponse.json({ ok: true, delivered: false });
  const res = await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ type: "adverse_event", ...r.data, at: new Date().toISOString() }) }).catch(
    () => null,
  );
  return NextResponse.json({ ok: Boolean(res?.ok), delivered: Boolean(res?.ok) });
}
