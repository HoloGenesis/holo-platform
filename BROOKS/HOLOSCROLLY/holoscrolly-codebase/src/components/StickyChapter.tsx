import { createRef, RefObject, useMemo } from "react";
import { useActiveStep } from "../hooks/useActiveStep";
import { HoloSigil } from "./HoloSigil";

export interface ChapterStep {
  label: string;
  title: string;
  body: string;
}

interface StickyChapterProps {
  eyebrow: string;
  title: string;
  body: string;
  steps: ChapterStep[];
}

export function StickyChapter({ eyebrow, title, body, steps }: StickyChapterProps) {
  const refs = useMemo(
    () => steps.map(() => createRef<HTMLDivElement>()),
    [steps]
  ) as RefObject<HTMLDivElement>[];
  const active = useActiveStep(refs, 0.55);

  return (
    <section className="sticky-chapter">
      <aside className="sticky-chapter__visual">
        <div className="eyebrow">{eyebrow}</div>
        <h2>{title}</h2>
        <p>{body}</p>
        <HoloSigil activeLabel={steps[active]?.label} />
      </aside>
      <main className="sticky-chapter__steps">
        {steps.map((step, index) => (
          <div
            ref={refs[index]}
            className={`step-card ${active === index ? "step-card--active" : ""}`}
            key={step.title}
          >
            <div className="step-card__label">{step.label}</div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </div>
        ))}
      </main>
    </section>
  );
}
