import clsx from "clsx";

// Whorl — spec §4. Decorative breathing geometry; aria-hidden (no label).
export function Whorl({ className }: { className?: string }) {
  return <div className={clsx("whorl", className)} aria-hidden="true" />;
}
