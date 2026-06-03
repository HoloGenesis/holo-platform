interface BreathingPawProps {
  className?: string;
}

/** REZZIE's breathing paw — the Sensei Wonderdog's quiet presence. CSS-only. */
export function BreathingPaw({ className }: BreathingPawProps) {
  return (
    <span
      className={["relative inline-flex h-6 w-6 items-center justify-center", className]
        .filter(Boolean)
        .join(" ")}
      aria-hidden
    >
      <span className="absolute inset-0 rounded-full bg-gold/20 blur-md animate-breathe" />
      <svg viewBox="0 0 24 24" className="relative h-4 w-4 animate-breathe text-gold" fill="currentColor">
        {/* main pad */}
        <ellipse cx="12" cy="15.5" rx="4.4" ry="3.6" />
        {/* toe beans */}
        <circle cx="6.4" cy="10.6" r="1.7" />
        <circle cx="10" cy="8.2" r="1.8" />
        <circle cx="14" cy="8.2" r="1.8" />
        <circle cx="17.6" cy="10.6" r="1.7" />
      </svg>
    </span>
  );
}
