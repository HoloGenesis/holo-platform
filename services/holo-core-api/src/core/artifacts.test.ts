import { describe, expect, it } from "vitest";
import { SoulSeedSnapshotSchema } from "@holo/contracts";
import { makeFakeRepo } from "../testing/fakeRepo";
import { createArtifact } from "./artifacts";
import { upsertMemory } from "./memory";
import { startSession } from "./sessions";

async function seedMemories(repo: ReturnType<typeof makeFakeRepo>["repo"], userId: string, sessionId: string) {
  await upsertMemory(repo, {
    userId,
    sessionId,
    sourceProduct: "soulseed",
    scope: "narrative",
    content: "the late-bloomer founder",
    importance: 0.85,
  });
  await upsertMemory(repo, {
    userId,
    sessionId,
    sourceProduct: "soulseed",
    scope: "state",
    content: "currently between jobs",
    importance: 0.7,
  });
  await upsertMemory(repo, {
    userId,
    sessionId,
    sourceProduct: "soulseed",
    scope: "trajectory",
    content: "leaving consulting for music",
    importance: 0.8,
  });
}

describe("createArtifact", () => {
  it("derives the Snapshot from stored memory + mints a HURL", async () => {
    const fake = makeFakeRepo();
    const session = await startSession(fake.repo, { productKey: "soulseed" });
    await seedMemories(fake.repo, session.userId, session.sessionId);

    const result = await createArtifact(fake.repo, {
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
    });

    expect(SoulSeedSnapshotSchema.safeParse(result.contentJson).success).toBe(true);
    expect(result.contentJson.identitySignal).toBe("the late-bloomer founder");
    expect(result.contentJson.presentState).toBe("currently between jobs");
    expect(result.contentJson.emergingTrajectory).toBe("leaving consulting for music");
    expect(result.contentJson.hurl).toMatch(/^hurl:\/\/soulseed\//);
    expect(result.hurl).toBe(result.contentJson.hurl);
    expect(fake.artifacts).toHaveLength(1);
  });

  it("is reproducible and overwrites the prior row per session", async () => {
    const fake = makeFakeRepo();
    const session = await startSession(fake.repo, { productKey: "soulseed" });
    await seedMemories(fake.repo, session.userId, session.sessionId);

    const first = await createArtifact(fake.repo, {
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
    });
    const second = await createArtifact(fake.repo, {
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
    });

    expect(second.contentJson).toEqual(first.contentJson); // reproducible from stored signal
    expect(fake.artifacts).toHaveLength(1); // overwritten, not duplicated
  });

  it("falls back to grounded defaults when memory is thin", async () => {
    const fake = makeFakeRepo();
    const session = await startSession(fake.repo, { productKey: "soulseed" });

    const result = await createArtifact(fake.repo, {
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
    });

    expect(result.contentJson.identitySignal.length).toBeGreaterThan(0);
    expect(result.contentJson.deeperTrajectoryTeaser).toBeNull();
  });
});
