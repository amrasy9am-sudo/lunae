import Link from "next/link";
import { Lock } from "lucide-react";
import { Logo } from "@/components/logo";

export default async function CheckoutLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <>
      <header className="border-line bg-bg border-b">
        <div className="flex h-[72px] items-center justify-between px-4 sm:px-8 lg:px-14">
          <Link href={`/${lang}`} aria-label="LUNAE — home">
            <Logo />
          </Link>
          <p className="text-ink-2 flex items-center gap-2 text-[13px]">
            <Lock className="h-4 w-4" />
            <span className="hidden sm:inline">{lang === "ms" ? "Checkout selamat · TLS 256-bit · gerbang PCI-DSS" : "Secure checkout · 256-bit TLS · PCI-DSS gateway"}</span>
          </p>
        </div>
      </header>
      <main id="main">{children}</main>
    </>
  );
}
