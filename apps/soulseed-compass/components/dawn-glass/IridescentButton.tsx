import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

// Iridescent CTA button — spec §4. Honey→violet→cyan gradient with a glow.
export function IridescentButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "iridescent-button inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium",
        "focus:outline-none focus:ring-2 focus:ring-soulseed-honey/60 focus:ring-offset-2 focus:ring-offset-soulseed-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
