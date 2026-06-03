// @holo/agent-prompts — all agent prompt copy lives here. Core's agent runner
// imports these; they are never inlined in routes or UI.

import type { ChamberKey } from "@holo/contracts";
import {
  REZZIE_CHAMBER_APPENDIX,
  REZZIE_RETURN_APPENDIX,
  REZZIE_SYSTEM_PROMPT,
} from "./rezzie";
import { COACH_RETURN_APPENDIX, COACH_SYNTHESIS_INSTRUCTION, COACH_SYSTEM_PROMPT } from "./coach";

export {
  REZZIE_SYSTEM_PROMPT,
  REZZIE_CHAMBER_APPENDIX,
  REZZIE_RETURN_APPENDIX,
} from "./rezzie";
export {
  COACH_SYSTEM_PROMPT,
  COACH_SYNTHESIS_INSTRUCTION,
  COACH_RETURN_APPENDIX,
} from "./coach";

/** Which prompt persona drives an agent. */
export type PromptAgent = "rezzie" | "coach";

export interface ComposePromptArgs {
  agent: PromptAgent;
  chamberKey: ChamberKey;
  isReturning: boolean;
}

/**
 * Assemble the full static system prompt for an agent: persona + the
 * chamber-specific (REZZIE) or synthesis (COACH) instruction + the return-mode
 * appendix when the user is returning. The runner appends the dynamic memory
 * snapshot + user input separately.
 */
export function composePrompt({ agent, chamberKey, isReturning }: ComposePromptArgs): string {
  const parts: string[] =
    agent === "coach"
      ? [COACH_SYSTEM_PROMPT, COACH_SYNTHESIS_INSTRUCTION]
      : [REZZIE_SYSTEM_PROMPT, REZZIE_CHAMBER_APPENDIX[chamberKey]];

  if (isReturning) {
    parts.push(agent === "coach" ? COACH_RETURN_APPENDIX : REZZIE_RETURN_APPENDIX);
  }
  return parts.join("\n\n---\n\n");
}
