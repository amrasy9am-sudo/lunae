import Link from "next/link";
import type { Locale } from "@/lib/types";
import { lhref } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export function Breadcrumbs({ lang, items }: { lang: Locale; items: { href?: string; label: string }[] }) {
  const all = [{ href: "/", label: lang === "ms" ? "Utama" : "Home" }, ...items];
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((x, i) => ({ "@type": "ListItem", position: i + 1, name: x.label, item: x.href ? `${SITE_URL}${lhref(lang, x.href)}` : undefined })),
  };
  return (
    <nav aria-label="Breadcrumb" className="text-ink-3 text-[13.5px]">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((x, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {x.href && i < all.length - 1 ? (
              <Link href={lhref(lang, x.href)} className="hover:text-ink">
                {x.label}
              </Link>
            ) : (
              <span aria-current={i === all.length - 1 ? "page" : undefined} className={i === all.length - 1 ? "text-ink" : ""}>
                {x.label}
              </span>
            )}
          </li>
        ))}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </nav>
  );
}

export function PageHeader({ eyebrow, title, intro, children, dark = false }: { eyebrow?: string; title: React.ReactNode; intro?: React.ReactNode; children?: React.ReactNode; dark?: boolean }) {
  return (
    <header className={dark ? "starfield bg-night text-moon" : "bg-[linear-gradient(180deg,var(--surface),var(--bg))]"}>
      <div className="container-lux py-14 lg:py-20">
        {eyebrow && <p className={`eyebrow ${dark ? "text-glow" : "text-accent-deep"}`}>{eyebrow}</p>}
        <h1 className="display-l mt-4 max-w-4xl">{title}</h1>
        {intro && <div className={`mt-5 max-w-2xl text-[17px] leading-relaxed ${dark ? "text-halo" : "text-ink-2"}`}>{intro}</div>}
        {children}
      </div>
    </header>
  );
}

export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
