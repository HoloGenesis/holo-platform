import type { ReactNode } from "react";
import clsx from "clsx";

// Dawn Glass card — spec §4. Frosted glass panel with the iridescent edge.
export function DawnGlass({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={clsx("dawn-glass rounded-[32px]", className)}>{children}</div>;
}
