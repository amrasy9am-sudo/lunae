import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@fontsource/cormorant-garamond/latin-300.css";
import "@fontsource/cormorant-garamond/latin-300-italic.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-400-italic.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/lora/latin-600.css";
import "@fontsource/lora/latin-600-italic.css";
import "@fontsource/lora/latin-400-italic.css";
import "@fontsource-variable/inter/index.css";
import "../globals.css";
import { hasLocale, locales } from "@/lib/i18n";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const ms = lang === "ms";
  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: ms ? "LUNAE — Berseri dari terbit mentari hingga cahaya bulan" : "LUNAE — Glow from sun-up to moonlight",
      template: "%s · LUNAE",
    },
    description: ms
      ? "Solekan & penjagaan kulit halal yang direka untuk cuaca tropika. Diuji pada 33°C, 80% kelembapan. Rona untuk setiap kulit Asia Tenggara."
      : "Halal makeup & skincare engineered for tropical weather. Tested at 33°C, 80% humidity. Shades for every Southeast Asian skin tone.",
    applicationName: "LUNAE",
    alternates: { languages: { en: "/en", ms: "/ms" } },
    openGraph: { siteName: "LUNAE", type: "website", locale: ms ? "ms_MY" : "en_MY" },
    icons: { icon: "/icon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF6F1" },
    { media: "(prefers-color-scheme: dark)", color: "#15131F" },
  ],
  width: "device-width",
  initialScale: 1,
};

/* Runs before first paint: apply the saved Day/Midnight choice, or pick
   automatically from local time (refined on the client with SunCalc). */
const THEME_SCRIPT = `(function(){try{var p=localStorage.getItem("lunae-theme")||"auto";var t=p;if(p==="auto"){var h=new Date().getHours()+new Date().getMinutes()/60;t=(h>=19.3||h<7.1)?"midnight":"day"}document.documentElement.setAttribute("data-theme",t);document.documentElement.setAttribute("data-theme-pref",p)}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return (
    <html lang={lang === "ms" ? "ms-MY" : "en-MY"} data-theme="day" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-dvh">
        <Providers lang={lang}>{children}</Providers>
      </body>
    </html>
  );
}
