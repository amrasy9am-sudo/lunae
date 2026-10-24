import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";

export const metadata: Metadata = { title: { default: "Partners", template: "%s · LUNAE Partners" } };

export default async function PartnersLayout({ children, params }: LayoutProps<"/[lang]/partners">) {
  const { lang } = await params;
  const ms = lang === "ms";
  return (
    <>
      <header className="border-line bg-bg border-b">
        <div className="container-lux flex h-[72px] items-center justify-between gap-4">
          <Link href={`/${lang}/partners`} className="flex items-center gap-3">
            <Logo />
            <span className="bg-surface-2 text-accent-deep hidden rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] uppercase sm:inline">Partners</span>
          </Link>
          <nav className="flex items-center gap-2 text-[14px]">
            <Link href={`/${lang}`} className="text-ink-2 hover:text-ink hidden px-3 py-2 sm:inline">
              {ms ? "Kedai" : "Shop"}
            </Link>
            <Link href={`/${lang}/partners/join`} className="btn btn-primary btn-sm">
              {ms ? "Mohon" : "Apply"}
            </Link>
          </nav>
        </div>
      </header>
      <main id="main">{children}</main>
    </>
  );
}
