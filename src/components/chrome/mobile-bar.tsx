"use client";

import { usePathname } from "next/navigation";
import { Camera, Home, LayoutGrid, Moon, ShoppingBag } from "lucide-react";
import { L } from "../ui";
import { useT } from "../providers";
import { useCart, useUI } from "@/lib/store";
import { tx } from "@/lib/i18n";

export function MobileTabBar() {
  const t = useT();
  const pathname = usePathname().replace(/^\/(en|ms)/, "") || "/";
  const count = useCart((s) => s.lines.reduce((a, l) => a + l.qty, 0));
  const ui = useUI();
  const items = [
    { href: "/", icon: Home, l: tx("Home", "Utama"), active: pathname === "/" },
    { href: "/shop", icon: LayoutGrid, l: tx("Shop", "Kedai"), active: pathname.startsWith("/shop") || pathname.startsWith("/products") },
    { href: "/try-on", icon: Camera, l: tx("Try-on", "Cuba"), active: pathname.startsWith("/try-on") || pathname.startsWith("/shade-finder") },
    { href: "/circle", icon: Moon, l: tx("Circle", "Circle"), active: pathname.startsWith("/circle") || pathname.startsWith("/account/circle") },
  ];
  return (
    <nav aria-label={t(tx("Quick navigation", "Navigasi pantas"))} className="border-line bg-bg/95 fixed inset-x-0 bottom-0 z-40 border-t pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <ul className="grid grid-cols-5">
        {items.map(({ href, icon: Icon, l, active }) => (
          <li key={href}>
            <L
              href={href}
              aria-current={active ? "page" : undefined}
              className={`flex h-[60px] flex-col items-center justify-center gap-1 text-[11px] ${active ? "text-ink font-semibold" : "text-ink-3"}`}
            >
              <Icon className="h-[21px] w-[21px]" strokeWidth={1.5} />
              {t(l)}
            </L>
          </li>
        ))}
        <li>
          <button onClick={() => ui.set({ cartOpen: true })} className="text-ink-3 relative flex h-[60px] w-full flex-col items-center justify-center gap-1 text-[11px]">
            <ShoppingBag className="h-[21px] w-[21px]" strokeWidth={1.5} />
            {t(tx("Bag", "Troli"))}
            {count > 0 && <span className="bg-accent text-accent-ink absolute top-2 right-[calc(50%-20px)] grid h-4 min-w-4 place-items-center rounded-full px-1 text-[10px] font-bold">{count}</span>}
          </button>
        </li>
      </ul>
    </nav>
  );
}
