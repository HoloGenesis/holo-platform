import type {
  AgentRunRequest,
  ChamberKey,
  CoachingAgentOutput,
  SoulSeedAgentOutput,
} from "@holo/contracts";

// Deterministic, schema-valid mock outputs so the walking skeleton runs without
// a live model. Grounded in the request input where possible.

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

// Emergence pressure rises as the user moves deeper into the scroll. The agent
// emits it; orchestration shallow-merges it onto session.state.
const EMERGENCE_PRESSURE: Partial<Record<ChamberKey, number>> = {
  "identity-seed": 0.1,
  "present-state": 0.25,
  "memory-root": 0.4,
  "trajectory-branch": 0.6,
};

function mockRezzie(request: AgentRunRequest): SoulSeedAgentOutput {
  const chamber: ChamberKey = request.chamberKey;
  const message = asString(request.input.message, "");
  const emergencePressure = EMERGENCE_PRESSURE[chamber];

  // Return mode — REZZIE remembers and asks what changed (never "welcome back").
  const returnContext = request.context?.returnContext;
  if (returnContext) {
    const arrivalVector = asString(returnContext["arrivalVector"], "between worlds");
    if (!message) {
      // the opener, derived from the prior arrival vector
      return {
        message: `Last time, you were ${arrivalVector}. What changed?`,
        insight: `Return opener for prior vector "${arrivalVector}".`,
        detectedThemes: [],
        coherenceDelta: 0,
        memoryWrites: [],
        statePatch: {},
        suggestedNextQuestion: null,
        suggestedNextChamber: null,
      };
    }
    // the answer — a delta memory that evolves the snapshot
    return {
      message: "Something moved, then. I'll hold the new shape with the old.",
      insight: `Between visits, the user named a change from "${arrivalVector}".`,
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

  if (chamber === "identity-seed") {
    const vector = asString(request.input.formData?.["arrivalVector"], "unknown");
    return {
      message: `Okay. ${vector} is heavier than it looks.`,
      insight: `User arrived in the "${vector}" frame.`,
      detectedThemes: [vector],
      coherenceDelta: vector === "unknown" ? 0 : 0.05,
      memoryWrites: [
        {
          scope: "narrative",
          content: `User arrived as "${vector}".`,
          contentJson: { arrivalVector: vector },
          importance: 0.85,
        },
        { scope: "state", content: `Current frame: ${vector}.`, contentJson: null, importance: 0.7 },
      ],
      statePatch: { emergencePressure: emergencePressure ?? 0, custom: { arrivalVector: vector } },
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    };
  }

  if (chamber === "threshold") {
    return {
      message: "You look like you're between worlds.",
      insight: "User arrived at the threshold.",
      detectedThemes: ["liminal"],
      coherenceDelta: 0,
      memoryWrites: [
        { scope: "event", content: "Arrived at threshold.", contentJson: null, importance: 0.1 },
      ],
      statePatch: {},
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    };
  }

  // present-state / memory-root / trajectory-branch — generic grounded mirror
  return {
    message: message ? "I hear the shape of that." : "Take your time.",
    insight: `User responded in ${chamber}.`,
    detectedThemes: [],
    coherenceDelta: message ? 0.1 : 0,
    memoryWrites: message
      ? [
          {
            scope: chamber === "trajectory-branch" ? "trajectory" : "state",
            content: message.slice(0, 280),
            contentJson: null,
            importance: 0.6,
          },
        ]
      : [],
    statePatch: emergencePressure !== undefined ? { emergencePressure } : {},
    suggestedNextQuestion: null,
    suggestedNextChamber: null,
  };
}

function mockCoach(request: AgentRunRequest): CoachingAgentOutput {
  void request;
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
    insight: "User reached the Living Invitation; Snapshot composed from available signal.",
    detectedThemes: [],
    coherenceDelta: 0.15,
    memoryWrites: [
      {
        scope: "narrative",
        content: "User crystallized a first SoulSeed Snapshot.",
        contentJson: null,
        importance: 0.9,
      },
      {
        scope: "artifact",
        content: "SoulSeed Snapshot generated.",
        contentJson: { summary: "first run" },
        importance: 0.7,
      },
    ],
    statePatch: { custom: { completedFlow: true } },
    returnSeed: "Come back when something changes. I'll ask you what.",
  };
}

export function mockAgentOutput(request: AgentRunRequest): SoulSeedAgentOutput | CoachingAgentOutput {
  return request.agentKey === "coach" ? mockCoach(request) : mockRezzie(request);
}
