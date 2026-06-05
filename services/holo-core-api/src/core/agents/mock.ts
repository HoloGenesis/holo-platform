import type { AgentRunRequest, CoachingAgentOutput, SoulSeedAgentOutput } from "@holo/contracts";

// Deterministic, schema-valid MOCK output for dev/CI. Persona-agnostic: it is
// driven by the output kind, the user input, and the chamber's own copy — it
// contains NO persona or instance strings. Voice comes from the skin's prompt
// (live mode) or, if a skin wants flavored mocks, from its own layer.

export interface MockContext {
  request: AgentRunRequest;
  outputKind: "agent" | "synthesis";
  /** The active chamber's opener (from the manifest), used when there's no input. */
  chamberIntro: string;
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function mockAgent(request: AgentRunRequest, chamberIntro: string): SoulSeedAgentOutput {
  const message = asString(request.input.message, "");
  const formData = request.input.formData ?? {};
  const returnContext = request.context?.returnContext;

  // Return mode — remember and ask what changed (never "welcome back").
  if (returnContext) {
    const arrivalVector = asString(returnContext["arrivalVector"], "here");
    if (!message) {
      return {
        message: `Last time, you were ${arrivalVector}. What changed?`,
        insight: `Return opener (prior vector "${arrivalVector}").`,
        detectedThemes: [],
        coherenceDelta: 0,
        memoryWrites: [],
        statePatch: {},
        suggestedNextQuestion: null,
        suggestedNextChamber: null,
      };
    }
    return {
      message: "Something moved, then.",
      insight: "User named a change on return.",
      detectedThemes: ["return", "change"],
      coherenceDelta: 0.1,
      memoryWrites: [
        {
          scope: "narrative",
          content: `Since last time: ${message}`,
          contentJson: { key: "return-delta" },
          importance: 0.9,
        },
      ],
      statePatch: {},
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    };
  }

  // A single-choice form (e.g. an arrival vector) — reflect + record it.
  const choice = formData["arrivalVector"];
  if (typeof choice === "string") {
    return {
      message: `Okay — ${choice}.`,
      insight: `User chose "${choice}".`,
      detectedThemes: [choice],
      coherenceDelta: choice === "unknown" ? 0 : 0.05,
      memoryWrites: [
        {
          scope: "narrative",
          content: `Arrived as "${choice}".`,
          contentJson: { arrivalVector: choice },
          importance: 0.85,
        },
        { scope: "state", content: `Current frame: ${choice}.`, contentJson: null, importance: 0.7 },
      ],
      statePatch: { custom: { arrivalVector: choice } },
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    };
  }

  // Freeform reflection.
  if (message) {
    return {
      message: "I hear the shape of that.",
      insight: "User reflected.",
      detectedThemes: [],
      coherenceDelta: 0.1,
      memoryWrites: [{ scope: "state", content: message.slice(0, 280), contentJson: null, importance: 0.6 }],
      statePatch: {},
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    };
  }

  // Chamber just opened, no input — echo the chamber's own opener.
  return {
    message: chamberIntro,
    insight: "Chamber opened.",
    detectedThemes: [],
    coherenceDelta: 0,
    memoryWrites: [],
    statePatch: {},
    suggestedNextQuestion: null,
    suggestedNextChamber: null,
  };
}

function mockSynthesis(): CoachingAgentOutput {
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
    insight: "Reached the synthesis chamber; Snapshot composed from available signal.",
    detectedThemes: [],
    coherenceDelta: 0.15,
    memoryWrites: [
      { scope: "narrative", content: "Crystallized a first Snapshot.", contentJson: null, importance: 0.9 },
      { scope: "artifact", content: "Snapshot generated.", contentJson: { summary: "first run" }, importance: 0.7 },
    ],
    statePatch: { custom: { completedFlow: true } },
    returnSeed: "Come back when something changes. I'll ask you what.",
  };
}

export function mockAgentOutput(ctx: MockContext): SoulSeedAgentOutput | CoachingAgentOutput {
  return ctx.outputKind === "synthesis" ? mockSynthesis() : mockAgent(ctx.request, ctx.chamberIntro);
}
