import { NextResponse } from "next/server";
import { z } from "zod";

const Schema = z.object({ email: z.string().trim().email(), drop: z.string().max(60) });

/** Waitlist sign-up. Forwards to WAITLIST_WEBHOOK_URL (CRM/ESP) when configured. */
export async function POST(req: Request) {
  const r = Schema.safeParse(await req.json().catch(() => null));
  if (!r.success) return NextResponse.json({ ok: false }, { status: 400 });
  const hook = process.env.WAITLIST_WEBHOOK_URL;
  if (hook) {
    await fetch(hook, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ source: "lunae-waitlist", ...r.data, at: new Date().toISOString() }) }).catch(
      () => null,
    );
  }
  return NextResponse.json({ ok: true, stored: Boolean(hook) });
}
