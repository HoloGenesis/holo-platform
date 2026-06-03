import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { makeFakeRepo } from "../testing/fakeRepo";
import { getSession, resumeSession, startSession } from "./sessions";

describe("startSession", () => {
  it("mints an anonymous user (email null) + session at the initial chamber", async () => {
    const { repo, users, hurls } = makeFakeRepo();
    const res = await startSession(repo, { productKey: "soulseed" });

    expect(res.isReturning).toBe(false);
    expect(res.state.currentChamber).toBe("threshold");
    expect(res.state.chambersVisited).toEqual(["threshold"]);

    expect(users.get(res.userId)?.email).toBeNull();
    expect(hurls.at(-1)?.sessionId).toBe(res.sessionId);
    expect(hurls.at(-1)?.path).toMatch(/^hurl:\/\/soulseed\/threshold\//);
  });

  it("reuses an existing user and flags isReturning", async () => {
    const { repo } = makeFakeRepo();
    const first = await startSession(repo, { productKey: "soulseed" });
    const again = await startSession(repo, { productKey: "soulseed", userId: first.userId });

    expect(again.isReturning).toBe(true);
    expect(again.userId).toBe(first.userId);
    expect(again.sessionId).not.toBe(first.sessionId);
  });

  it("rejects an unknown product", async () => {
    const { repo } = makeFakeRepo();
    // @ts-expect-error — exercising a runtime guard with an invalid product key
    await expect(startSession(repo, { productKey: "nope" })).rejects.toThrow();
  });
});

describe("getSession", () => {
  it("returns the persisted session, or null when missing", async () => {
    const { repo } = makeFakeRepo();
    const started = await startSession(repo, { productKey: "soulseed" });

    const got = await getSession(repo, started.sessionId);
    expect(got?.sessionId).toBe(started.sessionId);
    expect(got?.userId).toBe(started.userId);
    expect(got?.state.currentChamber).toBe("threshold");
    expect(got?.hurl).toMatch(/^hurl:\/\/soulseed\//);

    expect(await getSession(repo, randomUUID())).toBeNull();
  });
});

describe("resumeSession", () => {
  it("rebuilds resume context from the latest session", async () => {
    const { repo } = makeFakeRepo();
    const started = await startSession(repo, { productKey: "soulseed" });

    const resumed = await resumeSession(repo, { userId: started.userId });
    expect(resumed.sessionId).toBe(started.sessionId);
    expect(resumed.resumeContext.lastChamber).toBe("threshold");
    expect(resumed.resumeContext.lastSnapshotSummary).toBe("No prior snapshot yet.");
    expect(resumed.resumeContext.keyMemories).toEqual([]);
  });
});
