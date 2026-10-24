import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { channels, fefo, kpis, live, revenue30 } from "@/data/admin-demo";

export const metadata: Metadata = { title: "Command centre" };

function AreaChart({ data }: { data: number[] }) {
  const w = 760,
    h = 240,
    pad = 10;
  const max = Math.max(...data) * 1.1,
    min = Math.min(...data) * 0.85;
  const x = (i: number) => pad + (i / (data.length - 1)) * (w - pad * 2);
  const y = (v: number) => h - pad - ((v - min) / (max - min)) * (h - pad * 2);
  const line = data.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const peak = data.indexOf(Math.max(...data));
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-64 w-full" role="img" aria-label="Revenue, last 30 days">
      <defs>
        <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#E08E6D" stopOpacity=".45" />
          <stop offset="1" stopColor="#E08E6D" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((g) => (
        <line key={g} x1={pad} x2={w - pad} y1={h * g} y2={h * g} stroke="#4A4460" strokeWidth="1" />
      ))}
      <path d={`${line} L${x(data.length - 1)},${h} L${x(0)},${h} Z`} fill="url(#rev)" />
      <path d={line} fill="none" stroke="#E08E6D" strokeWidth="2.5" strokeLinejoin="round" />
      <circle cx={x(peak)} cy={y(data[peak])} r="5" fill="#F3EDE4" />
    </svg>
  );
}

export default function CommandCentre() {
  const total = revenue30.reduce((a, b) => a + b, 0);
  const badge: Record<string, string> = { OK: "bg-success/25 text-[#9bc28f]", LOW: "bg-warning/25 text-glow", REORDER: "bg-error/25 text-ember", "FEFO PUSH": "bg-glow/25 text-glow" };
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-semibold">Command centre</h1>
          <p className="text-ink-2 text-[14px]">Live · all channels · sample data</p>
        </div>
        <span className="btn btn-accent btn-sm">● Full Moon Drop: T−2d</span>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => (
          <div key={k.k} className="border-line bg-surface rounded-[16px] border p-4">
            <p className="text-ink-2 text-[13px]">{k.k}</p>
            <p className="mt-2 text-[26px] leading-none font-semibold">{k.v}</p>
            <p className={`mt-2 text-[12.5px] ${k.up ? "text-[#9bc28f]" : "text-ember"}`}>{k.d} vs last week</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.8fr_1fr]">
        <div className="border-line bg-surface rounded-[18px] border p-5">
          <div className="flex justify-between">
            <p className="font-semibold">Revenue · last 30 days</p>
            <p className="text-ink-2 text-[13px]">RM{(total / 1e6).toFixed(2)}m · +22% MoM</p>
          </div>
          <AreaChart data={revenue30} />
        </div>
        <div className="border-line bg-surface rounded-[18px] border p-5">
          <p className="font-semibold">Sales by channel</p>
          <ul className="mt-4 space-y-4">
            {channels.map((c) => (
              <li key={c.k}>
                <div className="flex justify-between text-[14px]">
                  <span>{c.k}</span>
                  <span>{c.v}%</span>
                </div>
                <div className="bg-veil mt-1.5 h-1.5 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${c.v * 2}%`, background: c.c }} />
                </div>
              </li>
            ))}
          </ul>
          <div className="bg-surface-2 mt-5 rounded-[14px] p-4 text-[13.5px] leading-relaxed">
            <Sparkles className="text-glow mb-1 h-4 w-4" />
            <strong>AI insight:</strong> Eclipse · Langsat sells out in 11 days at current pace. Raise PO of 1,500 units to ODM by Friday to avoid a stock-out before 11.11.
          </div>
        </div>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="border-line bg-surface rounded-[18px] border p-5">
          <div className="flex justify-between">
            <p className="font-semibold">Batch & expiry watch (FEFO)</p>
            <p className="text-ink-2 text-[13px]">4 alerts</p>
          </div>
          <table className="mt-3 w-full text-[14px]">
            <tbody className="divide-line divide-y">
              {fefo.map((f) => (
                <tr key={f.b}>
                  <td className="py-3">{f.p}</td>
                  <td className="text-ink-2 py-3">{f.b}</td>
                  <td className="text-ink-2 py-3">{f.note}</td>
                  <td className="py-3 text-right">
                    <span className={`badge ${badge[f.s]}`}>{f.s}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-line bg-surface rounded-[18px] border p-5">
          <p className="font-semibold">Live right now</p>
          <ul className="divide-line mt-3 divide-y text-[14px]">
            {live.map((l) => (
              <li key={l.k} className="flex justify-between py-3">
                <span className="text-ink-2">{l.k}</span>
                <strong>{l.v}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
