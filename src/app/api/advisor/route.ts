import { NextResponse } from "next/server";
import { z } from "zod";
import { advisorSystemPrompt, ruleAdvisor, type AdvisorReply } from "@/lib/advisor";
import { products } from "@/data/catalogue";

const Body = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) }))
    .min(1)
    .max(30),
  lang: z.enum(["en", "ms"]).default("en"),
  context: z
    .object({
      lastOrder: z.object({ no: z.string(), status: z.string(), eta: z.string(), courier: z.string() }).nullable().optional(),
      profile: z.object({ shade: z.string(), code: z.string(), undertone: z.string() }).nullable().optional(),
    })
    .optional(),
});

// naive in-memory rate limit per instance (edge WAF does the real work in production)
const hits = new Map<string, { n: number; t: number }>();

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const now = Date.now();
  const h = hits.get(ip);
  if (h && now - h.t < 60_000 && h.n > 30) return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  hits.set(ip, h && now - h.t < 60_000 ? { n: h.n + 1, t: h.t } : { n: 1, t: now });

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "bad_request" }, { status: 400 });
  const { messages, lang, context } = parsed.data;
  const last = messages[messages.length - 1].content;

  const turn = messages.filter((m) => m.role === "user").length;
  const rules = ruleAdvisor(last, lang, { ...(context ?? {}), turn });
  // Safety & account intents always use the deterministic path.
  if (rules.handoff || !process.env.ANTHROPIC_API_KEY) return NextResponse.json(rules);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": process.env.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: process.env.ADVISOR_MODEL || "claude-haiku-5-5",
        max_tokens: 400,
        system: advisorSystemPrompt(lang),
        messages: messages.slice(-10),
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = data.content?.find((c) => c.type === "text")?.text?.trim();
    if (!text) throw new Error("empty");
    const mentioned = products
      .filter((p) => text.includes(p.shortName))
      .map((p) => p.slug)
      .slice(0, 4);
    const reply: AdvisorReply = { text, products: mentioned, sources: rules.sources, engine: "llm" };
    return NextResponse.json(reply);
  } catch {
    return NextResponse.json(rules);
  }
}
