/** Sample data for the admin & partner consoles (clearly labelled as demo in the UI). */

// deterministic pseudo-random so server & client render the same numbers
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}
const r = rng(42);

export const revenue30 = Array.from({ length: 30 }, (_, i) => Math.round(28000 + Math.sin(i / 4) * 6000 + i * 520 + r() * 7000));

export const kpis = [
  { k: "Revenue (today)", v: "RM48,210", d: "+18.4%", up: true },
  { k: "Orders", v: "312", d: "+12.1%", up: true },
  { k: "Conversion", v: "3.1%", d: "+0.4 pt", up: true },
  { k: "AOV", v: "RM154.50", d: "+5.6%", up: true },
  { k: "Shade Finder → buy", v: "41%", d: "+3.2 pt", up: true },
  { k: "Return rate", v: "1.8%", d: "−0.3 pt", up: false },
];

export const channels = [
  { k: "Website", v: 46, c: "#E08E6D" },
  { k: "Shopee", v: 22, c: "#D9B77E" },
  { k: "TikTok Shop", v: 17, c: "#C9BFD9" },
  { k: "Lazada", v: 9, c: "#8C83A8" },
  { k: "Stockists (B2B)", v: 6, c: "#7D8F6E" },
];

export const fefo = [
  { p: "Moonbeam · Madu", b: "B2405", note: "exp 05/2030", s: "OK" },
  { p: "Nightbloom · Rambutan", b: "B2411", note: "214 left", s: "LOW" },
  { p: "Eclipse · Langsat", b: "B2402", note: "96 left · 11d cover", s: "REORDER" },
  { p: "Tide Mist", b: "B2398", note: "exp in 90d", s: "FEFO PUSH" },
];

export const live = [
  { k: "Visitors on site", v: "1,842" },
  { k: "Carts open", v: "264" },
  { k: "Live stream viewers", v: "1,204" },
  { k: "WhatsApp chats waiting", v: "7 · 1m 40s avg" },
  { k: "Payment success (1h)", v: "98.6%" },
];

const names = ["Nur Aina", "Farah Z.", "Mei Ling", "Siti H.", "Priya R.", "Aisyah K.", "Nadia M.", "Chloe T.", "Hana Y.", "Zara L."];
const states = ["Selangor", "Johor", "Pulau Pinang", "Perak", "Kelantan", "Sabah", "W.P. Kuala Lumpur", "Perlis", "Sarawak", "Kedah"];
const statuses = ["PAID", "PROCESSING", "SHIPPED", "DELIVERED", "COMPLETED", "AWAITING_PAYMENT", "RETURNED"];
const chans = ["Web", "Shopee", "TikTok", "Lazada", "B2B"];
export const orders = Array.from({ length: 14 }, (_, i) => ({
  no: `LN-${24817 - i * 7}`,
  customer: names[i % names.length],
  state: states[(i * 3) % states.length],
  channel: chans[i % 5],
  items: 1 + Math.floor(r() * 4),
  total: Math.round((60 + r() * 220) * 100) / 100,
  status: statuses[i % statuses.length],
  at: `${21 - Math.floor(i / 4)} Oct 2027`,
}));

export const customers = names.map((n, i) => ({
  name: n,
  tier: ["Purnama", "Separa", "Sabit"][i % 3],
  ltv: Math.round(120 + r() * 1400),
  orders: 1 + Math.floor(r() * 9),
  shade: ["Madu W3", "Langsat N2", "Pasir N3", "Susu W1", "Sawo O4"][i % 5],
  consent: i % 3 !== 2,
}));

export const inbox = [
  { ch: "WhatsApp", who: "Siti H.", msg: "Shade Kayu Manis ada stok tak?", sla: "2m", tag: "Shade" },
  { ch: "Chat", who: "Chloe T.", msg: "Can I change my delivery address for LN-24803?", sla: "6m", tag: "Order" },
  { ch: "Email", who: "Priya R.", msg: "Slight redness after Full Moon serum — batch B2417", sla: "1m", tag: "Adverse event" },
  { ch: "WhatsApp", who: "Aisyah K.", msg: "Nak jadi stokis di Kota Bharu", sla: "12m", tag: "Partner" },
];

export const partners = [
  { name: "Kak Ros Beauty", type: "Stockist", state: "Kelantan", tier: "Gold", sales: 18420, commission: 1842, status: "Active" },
  { name: "@mei.makeup", type: "Affiliate", state: "Pulau Pinang", tier: "Micro", sales: 9640, commission: 1157, status: "Active" },
  { name: "Glow by Hana", type: "Stockist", state: "Johor", tier: "Silver", sales: 7210, commission: 721, status: "KYC review" },
  { name: "@aina.makeup", type: "Ambassador", state: "Selangor", tier: "Macro", sales: 22410, commission: 2689, status: "Active" },
];
