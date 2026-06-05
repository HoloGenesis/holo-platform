import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { SoulSeedAgentOutputSchema } from "@holo/contracts";
import type { AgentRunRequest } from "@holo/contracts";
import { makeFakeRepo } from "../../testing/fakeRepo";
import { mockRouter } from "./modelRouter";
import type { ModelRouter } from "./modelRouter";
import { runAgent } from "./runAgent";

function request(overrides: Partial<AgentRunRequest> = {}): AgentRunRequest {
  return {
    userId: randomUUID(),
    sessionId: randomUUID(),
    productKey: "soulseed",
    chamberKey: "identity-seed",
    agentKey: "rezzie",
    input: { formData: { arrivalVector: "building" } },
    ...overrides,
  };
}

// a router that returns a fixed raw string (to simulate model output)
function fixedRouter(raws: string[], model = "test"): ModelRouter {
  let i = 0;
  return {
    model,
    generate: () => Promise.resolve(raws[Math.min(i++, raws.length - 1)] ?? ""),
  };
}

describe("runAgent — MOCK mode (default)", () => {
  it("returns a valid SoulSeedAgentOutput for identity-seed and writes an agent_runs row", async () => {
    const { repo, agentRuns } = makeFakeRepo();
    const res = await runAgent(repo, request(), { router: mockRouter() });

    expect(res.usedFallback).toBe(false);
    expect(res.model).toBe("mock");
    expect(SoulSeedAgentOutputSchema.safeParse(res.output).success).toBe(true);
    expect(res.output.message).toBeTypeOf("string");

    // agent_runs persisted
    expect(agentRuns).toHaveLength(1);
    expect(agentRuns[0]?.agentKey).toBe("rezzie");
    expect(agentRuns[0]?.chamberKey).toBe("identity-seed");
    expect(agentRuns[0]?.model).toBe("mock");
  });
});

describe("runAgent — malformed model output", () => {
  it("falls back to a valid response when the model never returns valid JSON (no crash)", async () => {
    const { repo, agentRuns } = makeFakeRepo();
    const res = await runAgent(repo, request(), {
      router: fixedRouter(["{ not json at all", "still ☠ not json"], "broken"),
    });

    expect(res.usedFallback).toBe(true);
    expect(res.model).toBe("broken+fallback");
    expect(SoulSeedAgentOutputSchema.safeParse(res.output).success).toBe(true);
    expect(res.output.insight).toContain("fallback");
    expect(agentRuns).toHaveLength(1); // run still recorded
  });

  it("repairs on retry — malformed first, valid second", async () => {
    const { repo } = makeFakeRepo();
    const valid = JSON.stringify({
      message: "ok",
      insight: "repaired",
      detectedThemes: [],
      coherenceDelta: 0,
      memoryWrites: [],
      statePatch: {},
      suggestedNextQuestion: null,
      suggestedNextChamber: null,
    });
    const res = await runAgent(repo, request(), {
      router: fixedRouter(["}{ broken", valid], "flaky"),
    });

    expect(res.usedFallback).toBe(false);
    expect(res.output.insight).toBe("repaired");
  });
});

describe("runAgent — provider error (transient outage)", () => {
  it("degrades to the safe fallback instead of throwing when the router throws", async () => {
    const { repo, agentRuns } = makeFakeRepo();
    const throwingRouter: ModelRouter = {
      model: "down",
      generate: () => Promise.reject(new Error("provider returned 502")),
    };

    // must NOT reject — a model outage cannot break the user's journey
    const res = await runAgent(repo, request(), { router: throwingRouter });

    expect(res.usedFallback).toBe(true);
    expect(res.model).toBe("down+fallback");
    expect(SoulSeedAgentOutputSchema.safeParse(res.output).success).toBe(true);
    expect(agentRuns).toHaveLength(1); // run still recorded
  });
});

describe("runAgent — unknown agent", () => {
  it("rejects an agent not in the registry", async () => {
    const { repo } = makeFakeRepo();
    // "ang3l" is a valid AgentKey but is parked (not in the v1 registry)
    await expect(
      runAgent(repo, request({ agentKey: "ang3l" }), { router: mockRouter() })
    ).rejects.toThrow();
  });
});
