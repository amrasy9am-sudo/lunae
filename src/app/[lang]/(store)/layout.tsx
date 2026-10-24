import { AnnouncementBar, PreviewRibbon } from "@/components/chrome/announcement";
import { Header } from "@/components/chrome/header";
import { Footer } from "@/components/chrome/footer";
import { CartDrawer } from "@/components/chrome/cart-drawer";
import { SearchOverlay } from "@/components/chrome/search-overlay";
import { MobileTabBar } from "@/components/chrome/mobile-bar";
import { CookieNotice } from "@/components/chrome/cookie-notice";
import { AdvisorLauncher } from "@/components/chrome/advisor";

export default async function StoreLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  return (
    <>
      <a href="#main" className="bg-primary text-primary-ink sr-only z-[100] rounded-full px-4 py-2 focus:not-sr-only focus:fixed focus:top-4 focus:left-4">
        {lang === "ms" ? "Langkau ke kandungan" : "Skip to content"}
      </a>
      <PreviewRibbon />
      <AnnouncementBar />
      <Header />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer />
      <MobileTabBar />
      <CartDrawer />
      <SearchOverlay />
      <AdvisorLauncher />
      <CookieNotice />
    </>
  );
}
