interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 40, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Earth circle background */}
      <circle cx="32" cy="32" r="30" fill="#81B29A" opacity="0.15" />
      <circle cx="32" cy="32" r="30" stroke="#81B29A" strokeWidth="1.5" opacity="0.3" />

      {/* Baobab trunk */}
      <path
        d="M28 48 L28 30 Q28 24 32 18 Q36 24 36 30 L36 48"
        fill="#E07A5F"
      />
      {/* Trunk texture lines */}
      <path d="M30 35 L30 28" stroke="#D06A4F" strokeWidth="0.5" opacity="0.5" />
      <path d="M34 35 L34 28" stroke="#D06A4F" strokeWidth="0.5" opacity="0.5" />

      {/* Tree canopy - layered organic shapes */}
      <ellipse cx="32" cy="19" rx="16" ry="13" fill="#81B29A" />
      <ellipse cx="26" cy="17" rx="8" ry="7" fill="#6FA38A" opacity="0.6" />
      <ellipse cx="38" cy="17" rx="8" ry="7" fill="#6FA38A" opacity="0.6" />
      <ellipse cx="32" cy="14" rx="6" ry="5" fill="#5D9478" opacity="0.4" />

      {/* Small roots */}
      <path d="M28 48 Q24 50 22 49" stroke="#E07A5F" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M36 48 Q40 50 42 49" stroke="#E07A5F" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* Children silhouettes at base */}
      {/* Left child */}
      <circle cx="21" cy="43" r="2.5" fill="#2B2D42" opacity="0.75" />
      <path d="M21 45.5 L21 50 M19 47.5 L23 47.5 M21 50 L19 53 M21 50 L23 53" stroke="#2B2D42" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* Right child */}
      <circle cx="43" cy="43" r="2.5" fill="#2B2D42" opacity="0.75" />
      <path d="M43 45.5 L43 50 M41 47.5 L45 47.5 M43 50 L41 53 M43 50 L45 53" stroke="#2B2D42" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />

      {/* Center child (slightly larger, closer) */}
      <circle cx="32" cy="45" r="2.5" fill="#E07A5F" opacity="0.8" />
      <path d="M32 47.5 L32 52 M30 49.5 L34 49.5 M32 52 L30 55 M32 52 L34 55" stroke="#E07A5F" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />

      {/* Earth arc at bottom */}
      <path
        d="M6 52 Q32 60 58 52"
        stroke="#E07A5F"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      />

      {/* Small decorative stars/sparkles */}
      <circle cx="12" cy="12" r="1" fill="#F4A261" opacity="0.6" />
      <circle cx="52" cy="10" r="1.2" fill="#F4A261" opacity="0.5" />
      <circle cx="8" cy="28" r="0.8" fill="#F4A261" opacity="0.4" />
      <circle cx="56" cy="24" r="0.8" fill="#F4A261" opacity="0.4" />
    </svg>
  );
}
