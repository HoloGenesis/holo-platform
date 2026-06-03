import { describe, expect, it } from "vitest";
import { AgentRunRequestSchema, ProductManifestSchema } from "./index";

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

describe("ProductManifestSchema", () => {
  const valid = {
    productKey: "soulseed",
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

  it("throws on an invalid ProductManifest (chamber.next is not a ChamberKey)", () => {
    const invalid = {
      ...valid,
      chambers: [{ ...valid.chambers[0], next: "nowhere" }],
    };
    expect(() => ProductManifestSchema.parse(invalid)).toThrow();
  });
});
