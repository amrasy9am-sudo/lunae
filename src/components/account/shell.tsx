"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Home, ShoppingBag, RefreshCw, Sparkles, Moon, Heart, KeyRound, ShieldCheck, LogOut, MapPin } from "lucide-react";
import { useHref, useLang, useT } from "../providers";
import { L } from "../ui";
import { tx } from "@/lib/i18n";
import { useAccount } from "@/lib/store";
import { dateFmt } from "@/lib/format";

export const ACCOUNT_NAV = [
  { href: "/account", l: tx("Overview", "Ringkasan"), i: Home },
  { href: "/account/orders", l: tx("Orders & returns", "Pesanan & pemulangan"), i: ShoppingBag },
  { href: "/account/refills", l: tx("Refills & subscriptions", "Isi semula & langganan"), i: RefreshCw },
  { href: "/account/profile", l: tx("Skin & shade profile", "Profil kulit & rona"), i: Sparkles },
  { href: "/account/circle", l: tx("Lunae Circle", "Lunae Circle"), i: Moon },
  { href: "/account/wishlist", l: tx("Wishlist", "Senarai hajat"), i: Heart },
  { href: "/account/addresses", l: tx("Addresses & payment", "Alamat & pembayaran"), i: MapPin },
  { href: "/account/security", l: tx("Passkeys & security", "Passkey & keselamatan"), i: KeyRound },
  { href: "/account/privacy", l: tx("Privacy centre (PDPA)", "Pusat privasi (PDPA)"), i: ShieldCheck },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const lang = useLang();
  const href = useHref();
  const pathname = usePathname();
  const router = useRouter();
  const acc = useAccount();
  const [ready, setReady] = useState(false);
  const bare = pathname.endsWith("/account/login");
  const path = pathname.replace(/^\/(en|ms)/, "");

  useEffect(() => {
    const done = () => setReady(true);
    if (useAccount.persist.hasHydrated()) done();
    const unsub = useAccount.persist.onFinishHydration(done);
    return unsub;
  }, []);
  useEffect(() => {
    if (ready && !acc.user && !bare && path !== "/account/wishlist") router.replace(href(`/account/login?next=${encodeURIComponent(path)}`));
  }, [ready, acc.user, bare, path, router, href]);

  if (bare) return <>{children}</>;
  if (!ready || (!acc.user && path !== "/account/wishlist"))
    return (
      <div className="container-lux py-16">
        <div className="skeleton h-96" />
      </div>
    );

  return (
    <div className="container-lux grid gap-10 py-10 lg:grid-cols-[260px_1fr] lg:py-14">
      <aside>
        {acc.user ? (
          <>
            <p className="font-display text-[40px] leading-none">
              {t(tx("Hi", "Hai"))}, {acc.user.name.split(" ")[0]}
            </p>
            <p className="text-ink-3 mt-2 text-[13.5px]">
              {t(tx("Member since", "Ahli sejak"))} {dateFmt(acc.user.since, lang, { month: "short", year: "numeric" })}
            </p>
          </>
        ) : (
          <p className="font-display text-[34px] leading-none">{t(tx("Your wishlist", "Senarai hajat anda"))}</p>
        )}
        <nav className="no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:block lg:space-y-1 lg:px-0" aria-label={t(tx("Account", "Akaun"))}>
          {ACCOUNT_NAV.map(({ href: h, l, i: Icon }) => {
            const active = path === h;
            return (
              <L
                key={h}
                href={h}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px] ${active ? "bg-surface font-semibold shadow-[var(--shadow-e1)]" : "text-ink-2 hover:bg-surface"}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /> {t(l)}
              </L>
            );
          })}
          {acc.user && (
            <button
              className="text-ink-3 hover:bg-surface flex shrink-0 items-center gap-3 rounded-[12px] px-3 py-2.5 text-[15px]"
              onClick={() => {
                acc.signOut();
                router.replace(href("/"));
              }}
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.5} /> {t(tx("Sign out", "Log keluar"))}
            </button>
          )}
        </nav>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
