import type { OrderRecord } from "./store";

export const STAGES = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
export type Stage = (typeof STAGES)[number];

/** Demo timeline: real status comes from courier webhooks. Here it advances with time since payment. */
export function orderStage(o: Pick<OrderRecord, "at" | "status">, now = Date.now()): { stage: Stage; idx: number; times: (string | null)[] } {
  if (o.status === "CANCELLED") return { stage: "PAID", idx: 0, times: [o.at, null, null, null] };
  const t0 = new Date(o.at).getTime();
  const mins = (now - t0) / 60_000;
  const marks = [0, 3, 20, 120];
  const idx = marks.filter((m) => mins >= m).length - 1;
  return { stage: STAGES[idx], idx, times: marks.map((m, i) => (i <= idx ? new Date(t0 + m * 60_000).toISOString() : null)) };
}

export function etaFromDays(at: string, days: [number, number]) {
  const d = new Date(at);
  let n = days[1];
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n--;
  }
  return d.toISOString();
}
