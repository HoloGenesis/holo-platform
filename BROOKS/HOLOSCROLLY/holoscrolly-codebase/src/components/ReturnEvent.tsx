import { useState } from "react";
import { History, Sparkle } from "lucide-react";
import { isReturning, RETURN_PROMPT, type ReturnMemory } from "../memory/returnMemory";

interface ReturnEventProps {
  memory: ReturnMemory;
  onReflect: (text: string) => void;
}

/**
 * The Return Event. Only appears for a returning visitor. It compares prior
 * state to present arrival and invites a reflection that is written back into
 * memory — the hinge where a static page becomes a relationship.
 */
export function ReturnEvent({ memory, onReflect }: ReturnEventProps) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  if (!isReturning(memory)) return null;

  const lastSeen = new Date(memory.lastVisitAt).toLocaleString();

  return (
    <section className="return-event" aria-label="Return Event">
      <div className="return-event__card">
        <div className="eyebrow"><History size={16} /> RETURN EVENT • VISIT {memory.visits}</div>
        <h2>{RETURN_PROMPT}</h2>
        <p className="return-event__meta">
          You were last here on {lastSeen}
          {memory.lastActiveNode ? <> · resting in <strong>{memory.lastActiveNode}</strong></> : null}.
          {memory.lastReflection ? <> Last time you wrote: <em>&ldquo;{memory.lastReflection}&rdquo;</em></> : null}
        </p>

        {done ? (
          <p className="return-event__ack"><Sparkle size={16} /> Held. Your trajectory has been updated.</p>
        ) : (
          <form
            className="return-event__form"
            onSubmit={(e) => {
              e.preventDefault();
              const value = text.trim();
              if (!value) return;
              onReflect(value);
              setDone(true);
            }}
          >
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              placeholder="Name the shift, however small…"
              aria-label={RETURN_PROMPT}
            />
            <button type="submit">Record the change</button>
          </form>
        )}
      </div>
    </section>
  );
}
