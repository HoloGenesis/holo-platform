import { describe, expect, it } from "vitest";
import type { ChamberKey, SessionState, SoulSeedAgentOutput } from "@holo/contracts";
import { soulseedCompassManifest } from "@holo/product-manifests";
import { makeFakeRepo } from "../testing/fakeRepo";
import { applyNext, next } from "./orchestration";
import { startSession } from "./sessions";

const USER = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";

function agentOutput(overrides: Partial<SoulSeedAgentOutput> = {}): SoulSeedAgentOutput {
  return {
    message: "ok",
    insight: "an insight",
    detectedThemes: ["building"],
    coherenceDelta: 0.1,
    memoryWrites: [],
    statePatch: {},
    ...overrides,
  };
}

function freshState(): SessionState {
  return {
    currentChamber: "threshold",
    coherence: 0,
    emergencePressure: 0,
    chambersVisited: ["threshold"],
    custom: {},
  };
}

describe("next() planner", () => {
  it("walks all six chambers in manifest order, then null", () => {
    let current: ChamberKey = "threshold";
    let state = freshState();
    const visited: ChamberKey[] = [current];
    const transitions: (ChamberKey | null)[] = [];

    for (let i = 0; i < 10; i++) {
      const plan = next({
        userId: USER,
        sessionId: SESSION,
        productKey: "soulseed",
        currentChamber: current,
        state,
        agentOutput: agentOutput(),
        manifest: soulseedCompassManifest,
      });
      transitions.push(plan.nextChamber);
      state = { ...state, ...plan.statePatch };
      if (plan.nextChamber === null) break;
      current = plan.nextChamber;
      visited.push(current);
    }

    expect(visited).toEqual([
      "threshold",
      "identity-seed",
      "present-state",
      "memory-root",
      "trajectory-branch",
      "living-invitation",
    ]);
    // the transition out of the terminal chamber is null
    expect(transitions.at(-1)).toBeNull();
  });

  it("applies coherenceDelta and records a memory write in the plan", () => {
    const plan = next({
      userId: USER,
      sessionId: SESSION,
      productKey: "soulseed",
      currentChamber: "threshold",
      state: freshState(),
      agentOutput: agentOutput({
        coherenceDelta: 0.25,
        memoryWrites: [{ scope: "narrative", content: "x", importance: 0.7 }],
      }),
      manifest: soulseedCompassManifest,
    });

    expect(plan.nextChamber).toBe("identity-seed");
    expect(plan.statePatch.coherence).toBeCloseTo(0.25);
    expect(plan.statePatch.currentChamber).toBe("identity-seed");
    expect(plan.memoriesToWrite).toHaveLength(1);
    expect(plan.eventsToWrite[0]?.eventType).toBe("orchestration.advanced");
  });
});

describe("applyNext()", () => {
  it("updates session.state after each call and reaches the terminal chamber", async () => {
    const { repo, memories, events } = makeFakeRepo();
    const started = await startSession(repo, { productKey: "soulseed" });

    const seen: (ChamberKey | null)[] = [];
    for (let i = 0; i < 10; i++) {
      const res = await applyNext(repo, {
        userId: started.userId,
        sessionId: started.sessionId,
        productKey: "soulseed",
        agentOutput: agentOutput({
          memoryWrites: [{ scope: "state", content: `step ${i}`, importance: 0.5 }],
        }),
      });
      seen.push(res.nextChamber);

      // the persisted session reflects the patch immediately
      const got = await repo.getSessionById(started.sessionId);
      expect((got?.state as SessionState).currentChamber).toBe(res.state.currentChamber);
      expect(res.hurl).toMatch(/^hurl:\/\/soulseed\//);

      if (res.nextChamber === null) break;
    }

    expect(seen.at(-1)).toBeNull(); // terminated
    // a memory + an event were written on each of the 6 transitions
    expect(memories.length).toBe(6);
    expect(events.length).toBe(6);
  });
});
