/** Stylised face used for AR / Shade Finder illustrations (no real person depicted). */
export function FaceIllustration({
  lip = "#B5303A",
  cheek = "#E3878A",
  skin = "#E2AE86",
  mesh = true,
  className = "",
}: {
  lip?: string;
  cheek?: string;
  skin?: string;
  mesh?: boolean;
  className?: string;
}) {
  const pts: [number, number][] = [
    [120, 132],
    [150, 122],
    [180, 120],
    [210, 122],
    [240, 132],
    [112, 175],
    [248, 175],
    [125, 222],
    [235, 222],
    [150, 252],
    [210, 252],
    [180, 262],
    [180, 196],
  ];
  return (
    <svg viewBox="0 0 360 440" className={className} aria-hidden>
      <defs>
        <radialGradient id="fi-bg" cx="50%" cy="40%" r="70%">
          <stop offset="0" stopColor="#E6C3AE" />
          <stop offset="1" stopColor="#C99A80" />
        </radialGradient>
      </defs>
      <rect width="360" height="440" fill="url(#fi-bg)" />
      <path d="M58 440c0-90 30-170 30-250C88 90 140 40 180 40s92 50 92 150c0 80 30 160 30 250Z" fill="#2B1B17" />
      <rect x="150" y="280" width="60" height="120" rx="26" fill={skin} />
      <ellipse cx="180" cy="190" rx="78" ry="98" fill={skin} />
      <path d="M102 150c10-58 46-84 78-84s70 26 78 84c-18-40-46-56-78-56s-60 16-78 56Z" fill="#2B1B17" />
      <ellipse cx="132" cy="214" rx="20" ry="11" fill={cheek} opacity=".55" />
      <ellipse cx="228" cy="214" rx="20" ry="11" fill={cheek} opacity=".55" />
      <path d="M134 168q16-12 32 0M194 168q16-12 32 0" stroke="#2B1B17" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M178 180q-4 22 -8 30q10 4 18 0" stroke="#9B6A52" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M152 238q28 -12 56 0q-28 28 -56 0Z" fill={lip} />
      <path d="M152 238q28 6 56 0" stroke="#00000033" strokeWidth="1.5" fill="none" />
      {mesh && (
        <g stroke="#FFFFFF" strokeWidth="1" opacity=".75" fill="none">
          <polyline
            points={pts
              .slice(0, 5)
              .map((p) => p.join(","))
              .join(" ")}
          />
          <polyline points="112,175 125,222 150,252 180,262 210,252 235,222 248,175" />
          <polyline points="120,132 112,175 180,196 248,175 240,132" />
          <polyline points="125,222 180,196 235,222" />
          {pts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" fill="#FFFFFF" stroke="none" />
          ))}
        </g>
      )}
    </svg>
  );
}
