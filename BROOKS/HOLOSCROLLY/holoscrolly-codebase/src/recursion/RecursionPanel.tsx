import { useState } from "react";
import { CornerDownLeft, GitBranch } from "lucide-react";
import type { HdomNode, Hurl } from "../types/hdom";
import { createReturnEvent, type HolonReturnEvent } from "./holonicRecursion";

interface HolonicRecursionProps {
  /** The nested, complete HOLOSCROLLY holon to open. Its children are its steps. */
  holon: HdomNode;
  parentHurl: Hurl;
  depth?: number;
  onReturn: (event: HolonReturnEvent) => void;
}

/**
 * A step that opens a smaller complete HOLOSCROLLY and returns to the parent
 * timeline. Entering records an entry timestamp; traversing the inner steps is
 * self-contained; returning mints a HolonReturnEvent carried back up to the
 * parent. Reduced motion is respected via CSS (no transitions).
 */
export function HolonicRecursion({ holon, parentHurl, depth = 1, onReturn }: HolonicRecursionProps) {
  const [open, setOpen] = useState(false);
  const [enteredAt, setEnteredAt] = useState<string | null>(null);
  const [carried, setCarried] = useState("");
  const [returned, setReturned] = useState(false);

  const steps = holon.children;

  const enter = () => {
    setEnteredAt(new Date().toISOString());
    setOpen(true);
    setReturned(false);
  };

  const returnUp = () => {
    const event = createReturnEvent(
      parentHurl,
      holon,
      enteredAt ?? new Date().toISOString(),
      new Date().toISOString(),
      carried.trim() || null,
      depth
    );
    onReturn(event);
    setOpen(false);
    setReturned(true);
  };

  return (
    <section className="recursion" aria-label="Holonic recursion">
      <div className="recursion__frame">
        <div className="eyebrow"><GitBranch size={16} /> TOPO • HOLONIC RECURSION • DEPTH {depth}</div>
        <h3>{holon.title}</h3>
        <p>{holon.summary}</p>

        {!open ? (
          <button type="button" className="recursion__enter" onClick={enter}>
            {returned ? "Re-enter the chamber" : "Enter the chamber"}
          </button>
        ) : (
          <div className="recursion__inner" role="group" aria-label={`${holon.title} — nested HOLOSCROLLY`}>
            <ol className="recursion__steps">
              {steps.map((step) => (
                <li key={step.id} className="recursion__step">
                  <span className="recursion__step-title">{step.title}</span>
                  <span className="recursion__step-body">{step.summary}</span>
                </li>
              ))}
            </ol>

            <label className="recursion__carry">
              <span>Carry one true step back up:</span>
              <input
                type="text"
                value={carried}
                onChange={(e) => setCarried(e.target.value)}
                placeholder="the next true step…"
              />
            </label>

            <button type="button" className="recursion__return" onClick={returnUp}>
              <CornerDownLeft size={16} /> Return to parent timeline
            </button>
          </div>
        )}

        {returned ? (
          <p className="recursion__ack">
            Returned to the parent timeline. {carried.trim() ? <>Carried: <strong>{carried.trim()}</strong>.</> : null} The parent holon now remembers this descent.
          </p>
        ) : null}
      </div>
    </section>
  );
}
