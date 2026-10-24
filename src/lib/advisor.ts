import { products, sets } from "@/data/catalogue";
import { glossary } from "@/data/formulas";
import type { Locale } from "./types";

export interface AdvisorReply {
  text: string;
  products: string[];
  addSet?: string[];
  handoff?: boolean;
  sources: { label: string; href: string }[];
  engine: "rules" | "llm";
}

export interface AdvisorContext {
  lastOrder?: { no: string; status: string; eta: string; courier: string } | null;
  profile?: { shade: string; code: string; undertone: string } | null;
}

const has = (s: string, words: string[]) => words.some((w) => new RegExp(`(^|[^\\p{L}])${w}`, "iu").test(s));

/** Rule-based concierge over the LUNAE catalogue, INCI glossary & policies. Guardrails: no medical claims, hands off when unsure. */
export function ruleAdvisor(raw: string, lang: Locale, ctx: AdvisorContext = {}): AdvisorReply {
  const q = raw.toLowerCase();
  const ms = lang === "ms" || has(q, ["saya", "nak", "boleh", "tak", "apa", "macam", "mana", "ke ", "kan", "tolong", "untuk", "esok", "panas"]);
  const L = (en: string, m: string) => (ms ? m : en);
  const r: AdvisorReply = { text: "", products: [], sources: [], engine: "rules" };

  // 1. Safety first — reactions & medical questions go to a human, never a diagnosis.
  if (has(q, ["rash", "ruam", "gatal", "itch", "allerg", "alahan", "bengkak", "swell", "burn", "pedih", "reaction", "reaksi"])) {
    r.text = L(
      "I'm sorry you're dealing with that. Please stop using the product and rinse with cool water. If it's severe or you have trouble breathing, seek medical help right away. I'm handing you to our care team so we can log the batch and look after you.",
      "Maaf dengar tentang itu. Sila berhenti guna produk dan bilas dengan air sejuk. Jika teruk atau sukar bernafas, dapatkan rawatan segera. Saya serahkan kepada pasukan penjagaan kami untuk merekod nombor kelompok dan bantu anda.",
    );
    r.handoff = true;
    r.sources.push({ label: L("Report a reaction", "Lapor reaksi"), href: "/trace" });
    return r;
  }
  if (has(q, ["eczema", "ekzema", "psoriasis", "cure", "ubat", "rawat", "treat", "jerawat batu", "cystic", "dermatitis", "pregnan", "mengandung"])) {
    r.text = L(
      "I can't give medical advice — for skin conditions or pregnancy, please check with a doctor or dermatologist. What I can do is show you our gentlest, fragrance-free options so you can take the ingredient lists to them.",
      "Saya tak boleh beri nasihat perubatan — untuk masalah kulit atau semasa mengandung, sila rujuk doktor atau pakar dermatologi. Saya boleh tunjuk pilihan paling lembut dan bebas pewangi supaya anda boleh bawa senarai ramuannya.",
    );
    r.products = ["new-moon-gentle-cleanser", "nocturne-water-gel", "daybreak-sun-gel"];
    r.sources.push({ label: L("Ingredients glossary", "Glosari ramuan"), href: "/ingredients" });
    return r;
  }
  if (has(q, ["human", "manusia", "agent", "ejen", "orang", "cs", "customer service", "khidmat"])) {
    r.text = L(
      "Sure — connecting you with our care team on WhatsApp (9 am–9 pm daily). I'll pass on this chat so you don't have to repeat yourself.",
      "Baik — saya sambungkan dengan pasukan kami di WhatsApp (9 pagi–9 malam setiap hari). Saya hantar sekali perbualan ini supaya anda tak perlu ulang.",
    );
    r.handoff = true;
    return r;
  }

  // 2. Orders
  if (has(q, ["order", "pesanan", "parcel", "bungkusan", "track", "jejak", "where's my", "mana barang", "sampai", "delivery status"])) {
    if (ctx.lastOrder) {
      r.text = L(
        `Your latest order ${ctx.lastOrder.no} is ${ctx.lastOrder.status.toLowerCase()} with ${ctx.lastOrder.courier}, estimated ${ctx.lastOrder.eta}.`,
        `Pesanan terkini anda ${ctx.lastOrder.no} berstatus ${ctx.lastOrder.status.toLowerCase()} dengan ${ctx.lastOrder.courier}, anggaran ${ctx.lastOrder.eta}.`,
      );
      r.sources.push({ label: L("Track order", "Jejak pesanan"), href: `/track?no=${ctx.lastOrder.no}` });
    } else {
      r.text = L(
        "I can't see an order on this device yet. Pop your order number and email or phone into the tracking page and you'll get the live timeline.",
        "Saya belum nampak pesanan pada peranti ini. Masukkan nombor pesanan dan e-mel atau telefon di halaman jejak untuk lihat status terkini.",
      );
      r.sources.push({ label: L("Track order", "Jejak pesanan"), href: "/track" });
    }
    return r;
  }

  // 3. Halal
  if (has(q, ["halal", "jakim", "babi", "pork", "alkohol", "alcohol", "khinzir", "gelatin", "wudhu", "wuduk"])) {
    r.text = L(
      "Every LUNAE formula is developed to MS 2634:2019 (halal cosmetics): no animal-derived ingredients, no carmine or beeswax, plant-derived glycerin with supplier certificates, and no ethanol from alcoholic beverages. JAKIM certification is applied for before launch, and each batch page shows the certificate once issued.",
      "Setiap formula LUNAE dibangunkan mengikut MS 2634:2019 (kosmetik halal): tiada ramuan haiwan, tiada karmin atau lilin lebah, gliserin daripada tumbuhan dengan sijil pembekal, dan tiada etanol daripada minuman beralkohol. Pensijilan JAKIM dimohon sebelum pelancaran, dan setiap halaman kelompok akan tunjuk sijil sebaik dikeluarkan.",
    );
    r.sources.push({ label: L("Our halal promise", "Janji halal kami"), href: "/halal" }, { label: L("Batch & halal check", "Semakan kelompok"), href: "/trace" });
    return r;
  }

  // 4. Returns / swaps / shipping / promos / launch
  if (has(q, ["return", "pulang", "refund", "swap", "tukar", "salah rona", "wrong shade"])) {
    r.text = L(
      "Wrong shade? The Shade-Match Guarantee gives you one free swap within 30 days — even if opened — in 3 taps from your account. Unopened items can be returned within 14 days; damaged or wrong items are replaced or refunded with postage on us.",
      "Rona tak sesuai? Jaminan Padanan Rona beri satu pertukaran percuma dalam 30 hari — walaupun dah dibuka — dengan 3 ketikan di akaun. Barang belum dibuka boleh dipulangkan dalam 14 hari; barang rosak atau salah diganti atau dipulangkan wang dengan kos pos kami tanggung.",
    );
    r.sources.push({ label: L("Returns & swaps", "Pemulangan & tukar"), href: "/policies/returns" });
    return r;
  }
  if (has(q, ["shipping", "delivery", "hantar", "penghantaran", "pos", "courier", "kurier", "sabah", "sarawak", "labuan", "free shipping"])) {
    r.text = L(
      "Orders paid before 2 pm on working days ship the same day. Peninsular Malaysia: 1–3 working days, free over RM80. Sabah, Sarawak & Labuan: 3–7 working days. Tracking comes by WhatsApp and email.",
      "Pesanan dibayar sebelum 2 petang hari bekerja dihantar hari yang sama. Semenanjung: 1–3 hari bekerja, percuma melebihi RM80. Sabah, Sarawak & Labuan: 3–7 hari bekerja. Nombor jejak dihantar melalui WhatsApp dan e-mel.",
    );
    r.sources.push({ label: L("Delivery policy", "Polisi penghantaran"), href: "/policies/shipping" });
    return r;
  }
  if (has(q, ["voucher", "baucar", "promo", "diskaun", "discount", "murah", "sale", "kod"])) {
    r.text = L(
      "Routine sets save 10–15% automatically when all items are in your bag, Lunae Circle points take up to 30% off, and Full Moon Drop nights give 2× points.",
      "Set rutin jimat 10–15% secara automatik bila semua item dalam troli, mata Lunae Circle boleh potong sehingga 30%, dan malam Full Moon Drop beri 2× mata.",
    );
    r.sources.push({ label: L("Sets & gifts", "Set & hadiah"), href: "/sets" }, { label: "Lunae Circle", href: "/circle" });
    return r;
  }
  if (has(q, ["launch", "lancar", "bila", "when", "available", "ada stok", "ready"])) {
    r.text = L(
      "Wave 1 (10 products) launches with Merdeka in August 2027; Wave 2 (6 more) follows in early 2028, before Raya. Join a Full Moon Drop waitlist to get first access.",
      "Gelombang 1 (10 produk) dilancarkan sempena Merdeka, Ogos 2027; Gelombang 2 (6 lagi) menyusul awal 2028, sebelum Raya. Sertai senarai menunggu Full Moon Drop untuk akses awal.",
    );
    r.sources.push({ label: "Full Moon Drops", href: "/drops" });
    return r;
  }

  // 5. Ingredients
  const ing = glossary.find((g) => g.name.length > 4 && q.includes(g.name.toLowerCase().split(" (")[0]));
  const ingAlias = has(q, ["pegaga", "centella"]) ? glossary.find((g) => g.key.startsWith("centella")) : has(q, ["tamanu", "bintangor"]) ? glossary.find((g) => g.key.includes("calophyllum")) : null;
  const gi = ing ?? ingAlias;
  if (gi) {
    r.text = L(
      `${gi.name}: ${gi.fns.join("; ").toLowerCase()}. You'll find it in ${gi.products.length} LUNAE product${gi.products.length > 1 ? "s" : ""}.`,
      `${gi.name}: ${gi.fns.join("; ").toLowerCase()}. Terdapat dalam ${gi.products.length} produk LUNAE.`,
    );
    r.products = gi.products.slice(0, 4);
    r.sources.push({ label: gi.name, href: `/ingredients/${gi.key}` });
    return r;
  }

  // 6. Shade
  if (has(q, ["shade", "rona", "match", "padan", "undertone", "warna kulit", "skin tone", "tona"])) {
    if (ctx.profile) {
      r.text = L(
        `From your saved profile you're ${ctx.profile.shade} ${ctx.profile.code} with a ${ctx.profile.undertone} undertone — that's Eclipse Cushion and Moonbeam in ${ctx.profile.shade}. If it isn't right, the swap is free within 30 days.`,
        `Ikut profil anda, rona anda ${ctx.profile.shade} ${ctx.profile.code} dengan undertone ${ctx.profile.undertone} — iaitu Eclipse Cushion dan Moonbeam dalam ${ctx.profile.shade}. Kalau tak ngam, tukar percuma dalam 30 hari.`,
      );
      r.products = ["eclipse-cushion", "moonbeam-skin-tint", "crescent-concealer"];
    } else {
      r.text = L(
        "The AI Shade Finder takes about 60 seconds: a guided selfie (analysed on your phone, never uploaded) or a short quiz. It matches you across all base products.",
        "Pencari Rona AI ambil kira-kira 60 saat: swafoto berpandu (dianalisis di telefon anda, tidak dimuat naik) atau kuiz ringkas. Ia padankan anda dengan semua produk alas.",
      );
    }
    r.sources.push({ label: L("AI Shade Finder", "Pencari Rona AI"), href: "/shade-finder" });
    return r;
  }

  // 7. Occasions & concerns → routine
  if (has(q, ["wedding", "kahwin", "kenduri", "majlis", "outdoor", "luar", "panas", "hot", "sweat", "peluh", "humid", "lembap", "futsal", "konvo", "event", "hari raya", "raya"])) {
    r.text = L(
      "For a long, hot event I'd build this — every step is wear-tested in our 33°C climate chamber: Daybreak SPF50+ first, Eclipse Cushion tapped in thin layers, Nightbloom on lips & cheeks, then Tide Mist to lock it. Reapply SPF around 1:30 pm when UV peaks.",
      "Untuk majlis panjang dan panas, saya cadangkan rutin ini — setiap langkah diuji dalam kebuk iklim 33°C kami: Daybreak SPF50+ dulu, Eclipse Cushion ditepuk nipis, Nightbloom pada bibir & pipi, kemudian Tide Mist untuk kunci. Ulang SPF sekitar 1:30 tengah hari bila UV paling tinggi.",
    );
    r.products = ["daybreak-sun-gel", "eclipse-cushion", "nightbloom-lip-cheek-tint", "tide-setting-mist"];
    r.addSet = r.products;
    return r;
  }
  if (has(q, ["oily", "minyak", "berminyak", "shine", "kilat", "pori", "pore"])) {
    r.text = L(
      "For oily skin: Full Moon Glow Serum (5% niacinamide) morning and night, Nocturne Water Gel as a light moisturiser, then press Stardust on the T-zone and finish with Tide Mist.",
      "Untuk kulit berminyak: Full Moon Glow Serum (5% niacinamide) pagi dan malam, Nocturne Water Gel sebagai pelembap ringan, kemudian tekan Stardust pada zon-T dan akhiri dengan Tide Mist.",
    );
    r.products = ["full-moon-glow-serum", "nocturne-water-gel", "stardust-loose-powder", "tide-setting-mist"];
    return r;
  }
  if (has(q, ["tudung", "hijab", "mask", "pelitup", "transfer", "melekat", "comot", "smudge", "panda"])) {
    r.text = L(
      "Nightbloom Lip & Cheek Tint is made to dry down so it won't transfer to your tudung or mask — give it 30–60 seconds to set. For eyes, Starlash and Midnight liner resist humidity.",
      "Nightbloom Lip & Cheek Tint direka untuk kering supaya tak melekat pada tudung atau pelitup — beri 30–60 saat untuk set. Untuk mata, Starlash dan pengaris Midnight tahan kelembapan.",
    );
    r.products = ["nightbloom-lip-cheek-tint", "selene-matte-lipstick", "starlash-lift-mascara"];
    return r;
  }
  if (has(q, ["sensitive", "sensitif", "acne", "jerawat", "breakout", "kemerahan", "redness"])) {
    r.text = L(
      "For sensitive or breakout-prone skin, keep it short and fragrance-free: New Moon cleanser, Full Moon serum with centella, Daybreak SPF50+, and Moonbeam for light coverage. Patch-test new products on your jaw for 48 hours first.",
      "Untuk kulit sensitif atau mudah berjerawat, ringkaskan dan bebas pewangi: pencuci New Moon, serum Full Moon dengan pegaga, Daybreak SPF50+, dan Moonbeam untuk liputan ringan. Uji tampalan pada rahang selama 48 jam dahulu.",
    );
    r.products = ["new-moon-gentle-cleanser", "full-moon-glow-serum", "daybreak-sun-gel", "moonbeam-skin-tint"];
    return r;
  }
  if (has(q, ["night", "malam", "dinner", "party", "parti"])) {
    r.text = L(
      "Tonight's edit: Moonglow for a glow that catches the light, Selene for colour that won't budge, Starlash for lashes that hold to the last dance — set with Tide.",
      "Pilihan malam ini: Moonglow untuk sinar yang menangkap cahaya, Selene untuk warna yang kekal, Starlash untuk bulu mata yang tahan hingga tamat majlis — kunci dengan Tide.",
    );
    r.products = ["moonglow-liquid-highlighter", "selene-matte-lipstick", "starlash-lift-mascara", "tide-setting-mist"];
    return r;
  }

  // 8. Product mention
  const mentioned = products.filter((p) => q.includes(p.shortName.toLowerCase()));
  if (mentioned.length) {
    const p = mentioned[0];
    r.text = L(
      `${p.name} (${p.size}, RM${p.price}): ${p.tagline.en} Key points: ${p.claims.join(", ")}. ${p.wave === 1 ? "Part of Wave 1 (Aug 2027)." : "Arrives in Wave 2 (early 2028)."}`,
      `${p.name} (${p.size}, RM${p.price}): ${p.tagline.ms} Ciri utama: ${p.claims.join(", ")}. ${p.wave === 1 ? "Sebahagian Gelombang 1 (Ogos 2027)." : "Tiba dalam Gelombang 2 (awal 2028)."}`,
    );
    r.products = mentioned.map((m) => m.slug).slice(0, 3);
    return r;
  }
  if (has(q, ["set", "bundle", "rutin", "routine", "gift", "hadiah"])) {
    const s = sets[0];
    r.text = L(
      "Our ready routines save 10–15%. The 5-Minute Set (Moonbeam + Nightbloom + Tide) is the easiest start — or build your own AM/PM routine.",
      "Rutin siap kami jimat 10–15%. Set 5 Minit (Moonbeam + Nightbloom + Tide) paling mudah — atau bina rutin pagi/malam sendiri.",
    );
    r.products = s.items;
    r.addSet = s.items;
    r.sources.push({ label: L("Routine Builder", "Pembina Rutin"), href: "/routine" });
    return r;
  }

  r.text = L(
    "I'm the Lunae Advisor — I can match your shade, build a routine for the weather, explain any ingredient, check halal details or find your order. What are you getting ready for?",
    "Saya Lunae Advisor — saya boleh padankan rona, bina rutin ikut cuaca, terangkan mana-mana ramuan, semak butiran halal atau cari pesanan anda. Nak bersiap untuk apa?",
  );
  return r;
}

export function advisorSystemPrompt(lang: Locale) {
  const catalogue = products
    .map(
      (p) =>
        `- ${p.name} (${p.slug}) · ${p.category} · ${p.size} · RM${p.price} · Wave ${p.wave} · ${p.tagline.en} · Claims: ${p.claims.join(", ")} · Shades: ${p.shades.map((s) => s.name).join(", ") || "n/a"}`,
    )
    .join("\n");
  return `You are the Lunae Advisor, the beauty concierge of LUNAE — a Malaysian halal makeup & skincare brand designed for tropical heat and humidity (tagline "Glow from sun-up to moonlight").
Reply in ${lang === "ms" ? "relaxed, warm Bahasa Melayu (Manglish is fine if the customer uses it)" : "warm, concise English"}; 2–4 sentences; like a big sister who's great at makeup.
Answer ONLY from the catalogue and policies below. If unsure, say so and offer the human care team.
Guardrails: never give medical advice or diagnose skin conditions; for reactions tell them to stop use and hand off to a human; claims marked * are pending testing — present them as targets; never invent prices, shades or certificates. JAKIM halal certification and NPRA notification are being applied for before launch (Wave 1: August 2027, Wave 2: early 2028).
Policies: free delivery over RM80 (Peninsular), 1–3 working days; Sabah/Sarawak 3–7; Shade-Match Guarantee one free swap in 30 days; unopened returns 14 days; Lunae Circle 1 point per RM1, 100 points = RM1, tiers Sabit / Separa (RM300/yr, 1.25×) / Purnama (RM800/yr, 1.5×); routine sets save 10–15%.
Catalogue:
${catalogue}
When you recommend products, mention them by their exact product name.`;
}
