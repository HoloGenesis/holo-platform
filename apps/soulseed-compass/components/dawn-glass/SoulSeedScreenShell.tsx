import type { ReactNode } from "react";
import clsx from "clsx";

// One-screen HOLOSCROLLY shell — spec §5. The chrome every Sprint-10 screen
// renders inside: logo + step rail + back button, fixed cinematic background,
// CSS-only screen-enter animation on mount. The back button is inert for now
// (S89 wires navigation).

type SoulSeedScreenShellProps = {
  step: number;
  total?: number;
  backgroundSrc: string;
  children: ReactNode;
  className?: string;
  /** "return" renders the short 3-dot rail (S89's 3-screen return flow). */
  mode?: "first" | "return";
};

export function SoulSeedScreenShell({
  step,
  total = 9,
  backgroundSrc,
  children,
  className,
  mode = "first",
}: SoulSeedScreenShellProps) {
  const railTotal = mode === "return" ? 3 : total;
  return (
    <main className={clsx("soulseed-page min-h-svh screen-enter", className)}>
      <div className="soulseed-bg">
        <img src={backgroundSrc} alt="" />
      </div>
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 text-soulseed-dawn">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-soulseed-honey/60 text-soulseed-honey">
            ◎
          </span>
          <span className="font-ssUi text-xl">SoulSeed Compass</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {Array.from({ length: railTotal }).map((_, index) => (
            <span
              key={index}
              className={clsx(
                "h-2.5 w-2.5 rounded-full transition-all",
                index + 1 <= step ? "bg-soulseed-honey shadow-ss-glow" : "bg-white/20"
              )}
            />
          ))}
        </div>
        <button className="ghost-button px-5 py-3">← Back</button>
      </header>
      <section className="relative z-10 flex min-h-svh items-end px-6 pb-8 pt-28 md:px-12">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </section>
    </main>
  );
}
