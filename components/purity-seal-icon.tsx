export function PuritySealIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Supporter Badge"
    >
      {/* Parchment scroll base */}
      <path d="M9 12 L15 12 L15 20 L13.5 18.5 L12 20 L10.5 18.5 L9 20 Z" fill="#f5deb3" opacity="0.95" />

      {/* Scroll lines */}
      <line x1="10" y1="14" x2="14" y2="14" stroke="#8b7355" strokeWidth="0.3" opacity="0.5" />
      <line x1="10" y1="16" x2="14" y2="16" stroke="#8b7355" strokeWidth="0.3" opacity="0.5" />
      <line x1="10" y1="18" x2="14" y2="18" stroke="#8b7355" strokeWidth="0.3" opacity="0.5" />

      {/* Cog symbol at bottom */}
      <circle cx="12" cy="17.5" r="0.8" fill="#8b7355" opacity="0.4" />

      {/* Outer red circle */}
      <circle cx="12" cy="8" r="6" fill="#dc2626" opacity="0.95" />

      {/* Inner decorative circles */}
      <circle cx="12" cy="8" r="4" fill="#991b1b" opacity="0.3" />
      <circle cx="12" cy="8" r="2.5" fill="#7f1d1d" opacity="0.4" />
    </svg>
  )
}
