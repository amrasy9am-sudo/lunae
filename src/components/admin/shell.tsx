"use client";

import { usePathname } from "next/navigation";
import { Home, ShoppingBag, LayoutGrid, Users, Gift, Moon, Radio, Truck, Inbox, ShieldCheck, Boxes, Handshake, Wallet, BarChart3, Bot, FileText } from "lucide-react";
import { Logo } from "../logo";
import { L } from "../ui";
import { ADMIN_LINKS } from "@/data/admin-nav";

const ICONS = [Home, ShoppingBag, LayoutGrid, Boxes, Users, Gift, Moon, FileText, Radio, Bot, Inbox, Handshake, Wallet, BarChart3, Truck, ShieldCheck];
const ADMIN_NAV = ADMIN_LINKS.map((n, k) => ({ ...n, i: ICONS[k] }));

export function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname().replace(/^\/(en|ms)/, "");
  return (
    <div data-theme="midnight" className="bg-bg text-ink min-h-dvh">
      <div className="bg-accent text-accent-ink px-4 py-1.5 text-center text-[12px] font-medium">
        Admin console preview · sample data only · production runs on admin.lunae.my behind SSO + MFA + IP allow-list
      </div>
      <div className="grid lg:grid-cols-[250px_1fr]">
        <aside className="border-line border-b p-4 lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto lg:border-r lg:border-b-0 lg:p-5">
          <L href="/" className="block px-2 py-2">
            <Logo />
          </L>
          <nav className="no-scrollbar mt-6 flex gap-1 overflow-x-auto lg:block lg:space-y-0.5" aria-label="Admin">
            {ADMIN_NAV.map(({ href, l, i: Icon }) => (
              <L
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-[12px] px-3 py-2.5 text-[14.5px] ${path === href ? "bg-surface-2 font-semibold" : "text-ink-2 hover:bg-surface"}`}
              >
                <Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /> {l}
              </L>
            ))}
          </nav>
          <div className="bg-surface text-ink-2 mt-6 hidden rounded-[14px] p-4 text-[12.5px] lg:block">
            Signed in as <strong className="text-ink">Ops Manager</strong>
            <br />
            MFA · hardware key · IP allow-listed
          </div>
        </aside>
        <main id="main" className="min-w-0 p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
