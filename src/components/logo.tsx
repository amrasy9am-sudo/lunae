export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="2.2" />
      <path d="M38.5 16.5a13 13 0 1 0 8 19.5 10.5 10.5 0 1 1-8-19.5Z" fill="var(--accent)" transform="translate(-6 2)" />
      <circle cx="44" cy="15" r="1.3" fill="var(--accent)" />
      <circle cx="48" cy="20" r="0.9" fill="var(--accent)" />
      <line x1="12" y1="40" x2="52" y2="40" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="20" y1="45.5" x2="44" y2="45.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity=".55" />
      <line x1="26" y1="50" x2="38" y2="50" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity=".35" />
    </svg>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <LogoMark className="h-9 w-9" />
      <span className="text-[22px] font-medium tracking-[0.42em] sm:text-[24px]">LUNAE</span>
    </span>
  );
}
