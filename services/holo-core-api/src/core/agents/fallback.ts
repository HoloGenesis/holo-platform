import type { CoachingAgentOutput, SoulSeedAgentOutput } from "@holo/contracts";

// Safe canned responses when the model fails validation twice — so the user is
// never left staring at an empty chamber. Persona-agnostic: the conductor's
// message falls back to the chamber's own opener.

function agentFallback(chamberIntro: string): SoulSeedAgentOutput {
  return {
    message: chamberIntro || "Take your time.",
    insight: "Agent fallback used.",
    detectedThemes: [],
    coherenceDelta: 0,
    memoryWrites: [{ scope: "event", content: "Agent fallback used.", contentJson: null, importance: 0.05 }],
    statePatch: {},
    suggestedNextQuestion: null,
    suggestedNextChamber: null,
  };
}

function synthesisFallback(): CoachingAgentOutput {
  return {
    message: "Here's what I'm seeing. Read it once before you decide what to do with it.",
    snapshot: {
      identitySignal: "You arrive as someone in motion — the rest is being written.",
      presentState: "The present is loud and undecided. That's not nothing.",
      returningPattern: "The pattern that keeps returning hasn't named itself yet. Notice when it does.",
      emergingTrajectory: "The direction is faintly drawn. Walk toward the part that's already true.",
      firstInvitation:
        "This week, name the thing you've been pretending not to notice. Write it where you'll see it tomorrow.",
      hurl: "hurl://soulseed/living-invitation/state-1/coherence-000",
      deeperTrajectoryTeaser: null,
    },
    insight: "Synthesis fallback used.",
    detectedThemes: [],
    coherenceDelta: 0,
    memoryWrites: [
      { scope: "narrative", content: "Fallback Snapshot crystallization.", contentJson: null, importance: 0.85 },
      { scope: "artifact", content: "Snapshot generated (fallback).", contentJson: null, importance: 0.7 },
    ],
    statePatch: { custom: { completedFlow: true } },
    returnSeed: "Come back when something changes. I'll ask you what.",
  };
}

export function fallbackOutput(
  outputKind: "agent" | "synthesis",
  chamberIntro: string
): SoulSeedAgentOutput | CoachingAgentOutput {
  return outputKind === "synthesis" ? synthesisFallback() : agentFallback(chamberIntro);
}
