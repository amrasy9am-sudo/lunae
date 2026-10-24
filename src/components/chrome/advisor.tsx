"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, Sparkles, X } from "lucide-react";
import { LogoMark } from "../logo";
import { L } from "../ui";
import { useLang, useT } from "../providers";
import { useAccount, useCart, useProfile, useUI } from "@/lib/store";
import { productBySlug, tintBg } from "@/data/catalogue";
import { rm } from "@/lib/format";
import { tx } from "@/lib/i18n";
import { WHATSAPP } from "@/lib/site";
import type { AdvisorReply } from "@/lib/advisor";

type Msg = { role: "user" | "assistant"; content: string; reply?: AdvisorReply };

export function AdvisorPanel({ embedded = false }: { embedded?: boolean }) {
  const t = useT();
  const lang = useLang();
  const ui = useUI();
  const cart = useCart();
  const profile = useProfile((s) => s.profile);
  const orders = useAccount((s) => s.orders);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => end.current?.scrollIntoView({ behavior: "smooth", block: "end" }), [msgs, busy]);

  const send = async (text: string) => {
    if (!text.trim() || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content: text.trim() }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const o = orders[0];
      const res = await fetch("/api/advisor", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: next.map(({ role, content }) => ({ role, content })),
          context: {
            lastOrder: o ? { no: o.no, status: o.status, eta: o.eta, courier: o.courier } : null,
            profile: profile ? { shade: profile.shade, code: profile.code, undertone: profile.undertone } : null,
          },
        }),
      });
      const reply = (await res.json()) as AdvisorReply;
      setMsgs((m) => [...m, { role: "assistant", content: reply.text ?? "…", reply }]);
    } catch {
      setMsgs((m) => [
        ...m,
        { role: "assistant", content: t(tx("I couldn't connect just now — try again, or reach us on WhatsApp.", "Saya tak dapat sambung sekarang — cuba lagi, atau hubungi kami di WhatsApp.")) },
      ]);
    } finally {
      setBusy(false);
    }
  };

  const chips = [
    tx("Add set to bag", "Tambah set ke troli"),
    tx("Where's my order?", "Mana pesanan saya?"),
    tx("Is it halal?", "Halal ke?"),
    tx("What lasts through a wedding?", "Apa yang tahan sepanjang kenduri?"),
  ];

  return (
    <div className={`bg-bg flex flex-col ${embedded ? "border-line h-[640px] rounded-[24px] border" : "h-full"}`}>
      <div className="border-line flex items-center gap-3 border-b px-5 py-4">
        <span className="bg-night text-moon grid h-10 w-10 place-items-center rounded-full">
          <LogoMark className="h-7 w-7" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Lunae Advisor</p>
          <p className="text-ink-3 flex items-center gap-1.5 text-[12px]">
            <span className="bg-sage h-1.5 w-1.5 rounded-full" /> {t(tx("AI · replies in BM, EN & Manglish", "AI · balas dalam BM, EN & Manglish"))}
          </p>
        </div>
        <a href={WHATSAPP} target="_blank" rel="noreferrer" className="badge bg-surface-2 text-accent-deep hover:bg-surface-3">
          {t(tx("Human", "Manusia"))}
        </a>
        {!embedded && (
          <button className="hover:bg-surface-2 grid h-9 w-9 place-items-center rounded-full" aria-label={t(tx("Close", "Tutup"))} onClick={() => ui.set({ advisorOpen: false })}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto px-4 py-5" aria-live="polite">
        {msgs.length === 0 && (
          <div className="border-line bg-surface rounded-[16px] border p-4 text-[14.5px] leading-relaxed">
            {t(
              tx(
                "Hi! I'm the Lunae Advisor. Tell me where you're headed — office, kenduri, futsal — and I'll build a routine that survives the weather. I answer only from LUNAE's catalogue & policies, and I'll pass you to a human whenever you want.",
                "Hai! Saya Lunae Advisor. Beritahu ke mana anda nak pergi — pejabat, kenduri, futsal — dan saya bina rutin yang tahan cuaca. Saya jawab berdasarkan katalog & polisi LUNAE sahaja, dan boleh sambungkan dengan manusia bila-bila masa.",
              ),
            )}
          </div>
        )}
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[88%] rounded-[16px] px-4 py-3 text-[14.5px] leading-relaxed ${m.role === "user" ? "bg-primary text-primary-ink" : "border-line bg-surface border"}`}>
              {m.content}
              {m.reply?.products?.length ? (
                <ul className="divide-line border-line bg-bg mt-3 divide-y rounded-[12px] border">
                  {m.reply.products.map((slug) => {
                    const p = productBySlug(slug);
                    if (!p) return null;
                    return (
                      <li key={slug}>
                        <L href={`/products/${slug}`} className="hover:bg-surface flex items-center gap-3 p-2.5">
                          <span className={`relative h-10 w-9 shrink-0 overflow-hidden rounded-md ${tintBg[p.tint]}`}>
                            <Image src={`/img/cutouts/${slug}.webp`} alt="" fill sizes="36px" className="object-contain p-1" />
                          </span>
                          <span className="min-w-0 flex-1 truncate text-[13.5px]">
                            <strong className="font-serif">{p.shortName}</strong> <span className="text-ink-3">{t(p.type)}</span>
                          </span>
                          <span className="text-[13px] font-semibold">{rm(p.price)}</span>
                        </L>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
              {m.reply?.addSet && (
                <button
                  className="btn btn-sm btn-accent mt-3"
                  onClick={() => {
                    m.reply!.addSet!.forEach((s) =>
                      cart.add({ slug: s, shade: profile && productBySlug(s)?.shades.some((x) => x.name === profile.shade) ? profile.shade : productBySlug(s)?.shades[0]?.name, qty: 1 }),
                    );
                    ui.notify(t(tx("Routine added to your bag", "Rutin dimasukkan ke troli")));
                  }}
                >
                  {t(tx("Add all to bag", "Tambah semua ke troli"))}
                </button>
              )}
              {m.reply?.handoff && (
                <a href={WHATSAPP} target="_blank" rel="noreferrer" className="btn btn-sm btn-primary mt-3">
                  <MessageCircle className="h-4 w-4" /> {t(tx("Continue on WhatsApp", "Teruskan di WhatsApp"))}
                </a>
              )}
              {m.reply?.sources?.length ? (
                <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[12px]">
                  {m.reply.sources.map((s) => (
                    <L key={s.href} href={s.href} className="link">
                      {s.label}
                    </L>
                  ))}
                </p>
              ) : null}
            </div>
          </div>
        ))}
        {busy && <div className="skeleton h-12 w-2/3" />}
        <div ref={end} />
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-2">
        {chips.map((c) => (
          <button key={c.en} className="chip shrink-0 text-[13px]" onClick={() => send(t(c))}>
            {t(c)}
          </button>
        ))}
      </div>
      <form
        className="border-line flex items-center gap-2 border-t p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t(tx("Ask anything…", "Tanya apa sahaja…"))}
          className="field min-h-11 flex-1 rounded-full"
          aria-label={t(tx("Message", "Mesej"))}
          maxLength={500}
        />
        <button className="bg-primary text-primary-ink grid h-11 w-11 place-items-center rounded-full disabled:opacity-40" disabled={!input.trim() || busy} aria-label={t(tx("Send", "Hantar"))}>
          <ArrowUp className="h-5 w-5" />
        </button>
      </form>
    </div>
  );
}

export function AdvisorLauncher() {
  const t = useT();
  const ui = useUI();
  return (
    <>
      {!ui.advisorOpen && (
        <button
          onClick={() => ui.set({ advisorOpen: true })}
          className="bg-night text-moon fixed right-4 bottom-[84px] z-40 flex h-12 items-center gap-2 rounded-full pr-4 pl-3 text-[13px] font-semibold shadow-[var(--shadow-e3)] transition hover:scale-[1.03] md:right-6 md:bottom-6"
          aria-label={t(tx("Open Lunae Advisor", "Buka Lunae Advisor"))}
        >
          <Sparkles className="text-glow h-4 w-4" />
          <span className="hidden sm:inline">Lunae Advisor</span>
        </button>
      )}
      {ui.advisorOpen && (
        <div className="fixed inset-0 z-[76] md:inset-auto md:right-6 md:bottom-6 md:h-[620px] md:w-[400px]" role="dialog" aria-modal="false" aria-label="Lunae Advisor">
          <div className="animate-fade-up md:border-line h-full overflow-hidden shadow-[var(--shadow-e3)] md:rounded-[24px] md:border">
            <AdvisorPanel />
          </div>
        </div>
      )}
    </>
  );
}
