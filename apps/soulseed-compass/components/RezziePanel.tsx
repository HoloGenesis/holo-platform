import type { AgentKey } from "@holo/contracts";
import { BreathingPaw } from "./BreathingPaw";
import { Typewriter } from "./Typewriter";

interface RezziePanelProps {
  agentKey: AgentKey;
  /** The chamber opener (from the manifest) — shown before the user speaks. */
  intro: string;
  /** REZZIE's live reflection for this turn, once the agent has run. */
  reflection: string | null;
  thinking: boolean;
}

const AGENT_LABEL: Record<AgentKey, string> = {
  rezzie: "REZZIE",
  coach: "COACH",
  ang3l: "ANG3L",
};

/** The agent's voice — a glass panel with the breathing paw and typed words. */
export function RezziePanel({ agentKey, intro, reflection, thinking }: RezziePanelProps) {
  const text = reflection ?? intro;

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 flex items-center gap-2.5">
        <BreathingPaw />
        <span className="text-xs font-semibold uppercase tracking-[0.25em] gold-text">
          {AGENT_LABEL[agentKey]}
        </span>
        {reflection && !thinking && (
          <span className="text-[10px] uppercase tracking-widest text-neutral-500">· noticed</span>
        )}
      </div>
      <p className="text-lg leading-relaxed text-neutral-100">
        {thinking ? (
          <span className="text-neutral-500">listening…</span>
        ) : (
          <Typewriter text={text} />
        )}
      </p>
    </div>
  );
}
