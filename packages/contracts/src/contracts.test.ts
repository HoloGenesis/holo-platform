import { describe, expect, it } from "vitest";
import {
  AgentRunRequestSchema,
  CoheringInputSchema,
  CoheringOutputSchema,
  ProductManifestSchema,
  ProofInputSchema,
  ProofOutputSchema,
} from "./index";

const USER_ID = "11111111-1111-4111-8111-111111111111";
const SESSION_ID = "22222222-2222-4222-8222-222222222222";

describe("AgentRunRequestSchema", () => {
  const valid = {
    userId: USER_ID,
    sessionId: SESSION_ID,
    productKey: "soulseed",
    chamberKey: "threshold",
    agentKey: "rezzie",
    input: { message: "you look like you're between worlds" },
  };

  it("parses a valid AgentRunRequest", () => {
    const parsed = AgentRunRequestSchema.parse(valid);
    expect(parsed.agentKey).toBe("rezzie");
    expect(parsed.input.message).toBeTypeOf("string");
  });

  it("throws on an invalid AgentRunRequest (unknown agentKey + bad uuid)", () => {
    const invalid = {
      ...valid,
      userId: "not-a-uuid",
      agentKey: "wizard", // not in the AgentKey enum
    };
    expect(() => AgentRunRequestSchema.parse(invalid)).toThrow();
  });
});

describe("CoheringInputSchema", () => {
  it("parses a valid CoheringInput (with optional correctionOf)", () => {
    const parsed = CoheringInputSchema.parse({
      userId: USER_ID,
      sessionId: SESSION_ID,
      answer: "I'm a builder who wants clarity before depth.",
      correctionOf: "earlier answer",
    });
    expect(parsed.answer).toContain("builder");
    expect(parsed.correctionOf).toBe("earlier answer");
  });

  it("throws on an empty answer", () => {
    expect(() =>
      CoheringInputSchema.parse({ userId: USER_ID, sessionId: SESSION_ID, answer: "" })
    ).toThrow();
  });
});

describe("CoheringOutputSchema", () => {
  const valid = {
    recognitionLine: "You arrive wanting proof before symbol.",
    supportingLine: "Clarity first keeps your momentum.",
    chamberVectors: {
      threshold: "Arrives skeptical, value-seeking",
      identitySeed: "Builder / systems thinker",
      presentState: "Seeking clarity before depth",
      memoryRoot: "Returns to meaning over noise",
      trajectoryBranch: "Toward less proving, more building",
      livingInvitation: "Name one priority; define enough",
    },
    confidence: 0.72,
  };

  it("parses a valid CoheringOutput", () => {
    const parsed = CoheringOutputSchema.parse(valid);
    expect(parsed.chamberVectors.identitySeed).toContain("Builder");
    expect(parsed.confidence).toBeCloseTo(0.72);
  });

  it("throws when a chamber vector is missing", () => {
    const invalid: Record<string, unknown> = {
      ...valid,
      chamberVectors: { ...valid.chamberVectors },
    };
    delete (invalid.chamberVectors as Record<string, unknown>).memoryRoot;
    expect(() => CoheringOutputSchema.parse(invalid)).toThrow();
  });
});

describe("ProofInputSchema / ProofOutputSchema", () => {
  it("parses a valid ProofInput", () => {
    const parsed = ProofInputSchema.parse({ userId: USER_ID, sessionId: SESSION_ID });
    expect(parsed.userId).toBe(USER_ID);
  });

  it("throws on a ProofInput with a bad uuid", () => {
    expect(() => ProofInputSchema.parse({ userId: "nope", sessionId: SESSION_ID })).toThrow();
  });

  it("parses a valid ProofOutput", () => {
    const parsed = ProofOutputSchema.parse({
      demoQuestion: "What should I focus on next?",
      genericResponse: "Here are some tips that might help you…",
      attunedResponse: "Because you value clarity before depth, focus on one priority.",
      attunedCitation: "you value clarity before depth",
    });
    expect(parsed.attunedResponse).toContain(parsed.attunedCitation);
  });

  it("throws on a ProofOutput missing attunedCitation", () => {
    expect(() =>
      ProofOutputSchema.parse({
        demoQuestion: "q",
        genericResponse: "g",
        attunedResponse: "a",
      })
    ).toThrow();
  });
});

describe("ProductManifestSchema", () => {
  const valid = {
    productKey: "soulseed",
    name: "SoulSeed Compass",
    version: "1.0.0",
    rootHolon: {
      id: "root",
      type: "product",
      title: "SoulSeed Compass",
      identity: {},
      state: {},
      history: [],
      trajectory: {},
      relationships: [],
      children: [],
    },
    agents: {
      rezzie: {
        role: "conductor",
        systemPrompt: "You are a guide.",
        output: "agent",
        readScopes: ["profile", "narrative"],
      },
    },
    chambers: [
      {
        key: "threshold",
        title: "Threshold",
        agentKey: "rezzie",
        memoryReadScopes: ["profile"],
        memoryWriteScopes: ["profile", "event"],
        next: "identity-seed",
        prompts: {
          intro: "You look like you're between worlds.",
          questions: ["What should I call you?"],
        },
      },
    ],
  };

  it("parses a valid ProductManifest", () => {
    const parsed = ProductManifestSchema.parse(valid);
    expect(parsed.productKey).toBe("soulseed");
    expect(parsed.chambers[0]?.next).toBe("identity-seed");
  });

  it("throws on an invalid ProductManifest (missing required agents)", () => {
    const invalid: Record<string, unknown> = { ...valid };
    delete invalid.agents;
    expect(() => ProductManifestSchema.parse(invalid)).toThrow();
  });
});
