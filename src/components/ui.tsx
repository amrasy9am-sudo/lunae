"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { useLang } from "./providers";
import { lhref } from "@/lib/i18n";

/** Locale-aware link. */
export function L({ href, ...rest }: Omit<ComponentProps<typeof Link>, "href"> & { href: string }) {
  const lang = useLang();
  return <Link href={lhref(lang, href)} {...rest} />;
}

export function Overline({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`eyebrow text-accent-deep ${className}`}>{children}</p>;
}

export function Swatch({ hex, size = 16, selected = false, title }: { hex: string; size?: number; selected?: boolean; title?: string }) {
  return (
    <span
      title={title}
      className="inline-block shrink-0 rounded-full border border-black/10"
      style={{ width: size, height: size, background: hex, boxShadow: selected ? "0 0 0 2px var(--bg), 0 0 0 3.5px var(--ink)" : undefined }}
    />
  );
}

export function Toggle({ checked, onChange, label, id }: { checked: boolean; onChange: (v: boolean) => void; label: string; id?: string }) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${checked ? "bg-sage" : "bg-line"}`}
    >
      <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${checked ? "translate-x-6" : "translate-x-1"}`} />
    </button>
  );
}
