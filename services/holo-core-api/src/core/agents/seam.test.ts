import { describe, expect, it } from "vitest";
import { SoulSeedAgentOutputSchema } from "@holo/contracts";
import { makeFakeRepo } from "../../testing/fakeRepo";
import { startSession } from "../sessions";
import { mockRouter } from "./modelRouter";
import { runAgent } from "./runAgent";

// THE SEAM TEST (docs/holocanvas-realignment.md): a second skin runs on the same
// engine, changing only a manifest — zero engine code. The "guide" skin is a
// persona-less conductor declared entirely in @holo/product-manifests.

describe("seam test — second skin on the same engine, zero engine code", () => {
  it("runs the neutral 'guide' skin (no REZZIE) through session + agent", async () => {
    const { repo, agentRuns } = makeFakeRepo();

    // Engine spins up a session for a NON-soulseed skin from its manifest alone.
    const session = await startSession(repo, { productKey: "guide" });
    expect(session.state.currentChamber).toBe("threshold");

    // The conductor "guide" exists only in the guide manifest — the engine never names it.
    const res = await runAgent(
      repo,
      {
        userId: session.userId,
        sessionId: session.sessionId,
        productKey: "guide",
        chamberKey: "identity-seed",
        agentKey: "guide",
        input: { formData: { arrivalVector: "building" } },
      },
      { router: mockRouter() }
    );

    expect(SoulSeedAgentOutputSchema.safeParse(res.output).success).toBe(true);
    expect(res.usedFallback).toBe(false);
    expect(agentRuns.at(-1)?.agentKey).toBe("guide");
  });

  it("scopes personas to the skin — REZZIE is not available in the guide skin", async () => {
    const { repo } = makeFakeRepo();
    const session = await startSession(repo, { productKey: "guide" });
    await expect(
      runAgent(
        repo,
        {
          userId: session.userId,
          sessionId: session.sessionId,
          productKey: "guide",
          chamberKey: "threshold",
          agentKey: "rezzie", // not declared by the guide skin
          input: {},
        },
        { router: mockRouter() }
      )
    ).rejects.toThrow();
  });
});
