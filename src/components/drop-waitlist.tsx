"use client";

import { useState } from "react";
import { Bell, Check } from "lucide-react";
import { useT } from "./providers";
import { L } from "./ui";
import { tx } from "@/lib/i18n";
import { useAccount, useUI } from "@/lib/store";

export function DropWaitlist({ drop }: { drop: string }) {
  const t = useT();
  const acc = useAccount();
  const notify = useUI((s) => s.notify);
  const [email, setEmail] = useState(acc.user?.email ?? "");
  const [consent, setConsent] = useState(false);
  const joined = acc.waitlist.includes(drop);
  if (joined)
    return (
      <div className="border-mist bg-dusk/60 text-moon flex items-center gap-3 rounded-[16px] border p-5">
        <Check className="text-glow h-6 w-6" />
        <div>
          <p className="font-semibold">{t(tx("You're on the waitlist.", "Anda dalam senarai menunggu."))}</p>
          <p className="text-halo text-[13.5px]">{t(tx("We'll remind you 24 hours and 15 minutes before 8 pm.", "Kami akan ingatkan 24 jam dan 15 minit sebelum 8 malam."))}</p>
          <L href="/queue" className="text-glow mt-2 inline-block text-[13px] underline underline-offset-2">
            {t(tx("Preview the waiting room", "Pratonton bilik menunggu"))}
          </L>
        </div>
      </div>
    );
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) return notify(t(tx("Please enter a valid email.", "Sila masukkan e-mel yang sah.")), "error");
        if (!consent) return notify(t(tx("Please tick the reminder consent.", "Sila tandakan persetujuan peringatan.")), "warning");
        await fetch("/api/waitlist", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email, drop }) }).catch(() => {});
        acc.joinWaitlist(drop);
        notify(t(tx("You're on the list — see you under the full moon.", "Anda dalam senarai — jumpa di bawah bulan purnama.")));
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t(tx("Your email", "E-mel anda"))}
          className="border-mist text-moon placeholder:text-halo focus:border-moon h-12 flex-1 rounded-full border bg-transparent px-5 outline-none"
          aria-label="Email"
        />
        <button className="btn bg-moon text-cocoa-ink">
          <Bell className="h-4 w-4" /> {t(tx("Join waitlist", "Sertai senarai"))}
        </button>
      </div>
      <label className="text-halo flex items-start gap-2 text-[12.5px]">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 accent-[#D9B77E]" />
        {t(tx("Remind me by email before this drop (T−24h, T−15m). No other marketing.", "Ingatkan saya melalui e-mel sebelum drop ini (T−24j, T−15m). Tiada pemasaran lain."))}
      </label>
    </form>
  );
}
