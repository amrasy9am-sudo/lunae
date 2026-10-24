import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { customers, inbox, orders, partners } from "@/data/admin-demo";
import { products } from "@/data/catalogue";
import { formulas } from "@/data/formulas";
import { batches } from "@/data/batches";
import { VOUCHERS, TIERS } from "@/lib/pricing";
import { articles } from "@/data/journal";
import { ADMIN_LINKS as ADMIN_NAV } from "@/data/admin-nav";

const MODULES = ADMIN_NAV.filter((n) => n.href !== "/admin").map((n) => n.href.split("/").pop()!);

export function generateStaticParams() {
  return MODULES.map((module) => ({ module }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/admin/[module]">): Promise<Metadata> {
  const { module } = await params;
  return { title: ADMIN_NAV.find((n) => n.href.endsWith(module))?.l ?? "Admin" };
}

function Table({ head, rows }: { head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="border-line bg-surface overflow-x-auto rounded-[18px] border">
      <table className="w-full min-w-[640px] text-left text-[14px]">
        <thead className="border-line text-ink-2 border-b text-[12px] tracking-[0.12em] uppercase">
          <tr>
            {head.map((h) => (
              <th key={h} className="px-4 py-3 font-semibold">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-line divide-y">
          {rows.map((r, i) => (
            <tr key={i} className="hover:bg-surface-2/50">
              {r.map((c, j) => (
                <td key={j} className="px-4 py-3">
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Notes({ items }: { items: string[] }) {
  return (
    <ul className="mt-5 grid gap-3 md:grid-cols-3">
      {items.map((x) => (
        <li key={x} className="border-line bg-surface text-ink-2 rounded-[14px] border p-4 text-[13.5px]">
          {x}
        </li>
      ))}
    </ul>
  );
}

export default async function AdminModule({ params }: PageProps<"/[lang]/admin/[module]">) {
  const { module } = await params;
  if (!MODULES.includes(module)) notFound();
  const title = ADMIN_NAV.find((n) => n.href.endsWith(module))!.l;
  let body: React.ReactNode = null;
  switch (module) {
    case "orders":
      body = (
        <>
          <Table
            head={["Order", "Customer", "State", "Channel", "Items", "Total", "Status", "Date"]}
            rows={orders.map((o) => [o.no, o.customer, o.state, o.channel, o.items, `RM${o.total.toFixed(2)}`, o.status, o.at])}
          />
          <Notes
            items={[
              "State machine: NEW → AWAITING_PAYMENT → PAID → PROCESSING → SHIPPED → DELIVERED → COMPLETED; every transition audited.",
              "Refunds ≤ RM200 by CS/Ops; > RM200 require Finance second approval.",
              "Split shipments, RMA and internal notes per order.",
            ]}
          />
        </>
      );
      break;
    case "products":
      body = (
        <>
          <Table
            head={["Product", "Category", "Size", "Price", "Variants", "Wave", "PAO", "NPRA / Halal"]}
            rows={products.map((p) => [p.name, p.category, p.size, `RM${p.price}`, Math.max(1, p.shades.length), p.wave, formulas[p.slug].pao ?? "—", "Pending (pre-launch)"])}
          />
          <Notes
            items={[
              "Every shade is its own SKU with shade hex, skin swatches and INCI.",
              "GLB/USDZ 3D assets attach per product for 360° and room AR.",
              "SEO fields & BM/EN copy edited here; enrichment in the CMS.",
            ]}
          />
        </>
      );
      break;
    case "inventory":
      body = (
        <>
          <Table
            head={["Batch", "Product", "Shade", "Units", "Manufactured", "Expiry", "Recall"]}
            rows={batches.map((b) => [b.no, products.find((p) => p.slug === b.slug)!.name, b.shade ?? "—", b.units.toLocaleString(), b.manufactured, b.expiry, b.recall ? "LOCKED" : "—"])}
          />
          <Notes
            items={[
              "FEFO allocation: index on (variant_id, expiry_date); < 9 months shelf life never ships to retail.",
              "Append-only stock_movements ledger — stock = sum of movements.",
              "One-click recall locks stock on every channel and lists affected customers.",
            ]}
          />
        </>
      );
      break;
    case "customers":
      body = (
        <Table head={["Customer", "Tier", "LTV", "Orders", "Shade", "Marketing consent"]} rows={customers.map((c) => [c.name, c.tier, `RM${c.ltv}`, c.orders, c.shade, c.consent ? "Yes" : "No"])} />
      );
      break;
    case "promotions":
      body = (
        <>
          <Table
            head={["Code", "Rule", "Type", "Value", "Min spend"]}
            rows={Object.entries(VOUCHERS).map(([k, v]) => [k, v.label, v.type, v.type === "pct" ? `${v.value * 100}%` : `RM${v.value}`, `RM${v.min}`])}
          />
          <Notes
            items={[
              "Bundles: 3 products −10%, 4+ −12%; curated sets up to −15%.",
              "Full Moon Drop scheduler with per-customer/device limits and waiting room.",
              "Discount discipline: average ≤ 15%, never > 30% except near-expiry stock.",
            ]}
          />
        </>
      );
      break;
    case "loyalty":
      body = <Table head={["Phase", "Annual spend", "Multiplier"]} rows={TIERS.map((t) => [t.name, `RM${t.min}+`, `${t.mult}×`])} />;
      break;
    case "content":
      body = <Table head={["Article", "Type", "Reviewed", "Claims check"]} rows={articles.map((a) => [a.title.en, a.kind.en, a.reviewed, "Passed"])} />;
      break;
    case "inbox":
      body = <Table head={["Channel", "From", "Message", "SLA", "Tag"]} rows={inbox.map((m) => [m.ch, m.who, m.msg, m.sla, m.tag])} />;
      break;
    case "partners":
      body = (
        <Table
          head={["Partner", "Type", "State", "Tier", "Sales", "Commission", "Status"]}
          rows={partners.map((p) => [p.name, p.type, p.state, p.tier, `RM${p.sales.toLocaleString()}`, `RM${p.commission.toLocaleString()}`, p.status])}
        />
      );
      break;
    default:
      body = (
        <Notes
          items={
            {
              live: ["Schedule streams, pin products with live prices.", "Chat moderation (automatic + manual).", "Viewer & conversion analytics per stream."],
              advisor: ["Knowledge base: catalogue, INCI, policies, FAQ.", "Conversation review & guardrail logs (no medical claims, no PII in training).", "Hand-off rate and customer feedback."],
              finance: ["Gateway settlements & reconciliation.", "SST reports & MyInvois e-Invoice submission.", "Accounting export."],
              reports: ["Sales, cohorts & funnels.", "Shade Finder, AR & Advisor impact on conversion.", "CSV exports for the data warehouse."],
              fulfilment: ["3PL integration: pick, pack (barcode scan), dispatch.", "Courier aggregator — J&T, Ninja Van, Pos Laju.", "Same-day dispatch for orders paid before 2 pm."],
              settings: ["Users & RBAC (Owner, Ops, CS, Marketing, Finance, QA/Reg, Partner mgr).", "Mandatory MFA, IP allow-list, session timeout.", "Append-only audit log of every admin change."],
            }[module] ?? ["Module preview."]
          }
        />
      );
  }
  return (
    <div>
      <h1 className="text-[28px] font-semibold">{title}</h1>
      <p className="text-ink-2 mb-6 text-[14px]">Sample data · production module connects to the commerce engine API</p>
      {body}
    </div>
  );
}
