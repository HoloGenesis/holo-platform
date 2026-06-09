import type { ButtonHTMLAttributes } from "react";
import clsx from "clsx";

// Ghost button — spec §4. Quiet glass secondary action.
export function GhostButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "ghost-button inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
