import { describe, expect, it } from "vitest";
import { makeFakeRepo } from "../testing/fakeRepo";
import { mintAndPersistHurl, resolveHurl } from "./hurl";
import { runAgent } from "./agents/runAgent";
import { mockRouter } from "./agents/modelRouter";
import { startSession } from "./sessions";

describe("resolveHurl", () => {
  it("resolves a minted HURL back to its user + session", async () => {
    const { repo } = makeFakeRepo();
    const session = await startSession(repo, { productKey: "soulseed" });
    const path = await mintAndPersistHurl(repo, session.sessionId);

    const resolved = await resolveHurl(repo, path);
    expect(resolved.userId).toBe(session.userId);
    expect(resolved.sessionId).toBe(session.sessionId);
    expect(resolved.productKey).toBe("soulseed");
  });

  it("throws on an unknown HURL", async () => {
    const { repo } = makeFakeRepo();
    await expect(
      resolveHurl(repo, "hurl://soulseed/threshold/state-1/coherence-000")
    ).rejects.toThrow();
  });
});

describe("REZZIE return mode (mock)", () => {
  it("opener references the prior arrivalVector and asks what changed", async () => {
    const { repo } = makeFakeRepo();
    const session = await startSession(repo, { productKey: "soulseed" });

    const res = await runAgent(
      repo,
      {
        userId: session.userId,
        sessionId: session.sessionId,
        productKey: "soulseed",
        chamberKey: "threshold",
        agentKey: "rezzie",
        input: {},
        context: { returnContext: { arrivalVector: "building" } },
      },
      { router: mockRouter() }
    );
    expect(res.output.message).toContain("building");
    expect(res.output.message.toLowerCase()).toContain("what changed");
  });

  it("the answer produces a high-importance delta memory", async () => {
    const { repo } = makeFakeRepo();
    const session = await startSession(repo, { productKey: "soulseed" });

    const res = await runAgent(
      repo,
      {
        userId: session.userId,
        sessionId: session.sessionId,
        productKey: "soulseed",
        chamberKey: "threshold",
        agentKey: "rezzie",
        input: { message: "I left the job." },
        context: { returnContext: { arrivalVector: "building" } },
      },
      { router: mockRouter() }
    );
    const delta = res.output.memoryWrites[0];
    expect(delta?.scope).toBe("narrative");
    expect(delta?.content).toContain("I left the job.");
    expect(delta?.importance).toBeGreaterThanOrEqual(0.85);
  });
});
