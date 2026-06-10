import { describe, expect, it } from "vitest";
import { SoulSeedSnapshotV2Schema } from "@holo/contracts";
import { makeFakeRepo } from "../../testing/fakeRepo";
import { runCoheringV1 } from "../agents/recipes/coheringV1";
import { startSession } from "../sessions";
import { composeSnapshotV2, slugifyBranch } from "./snapshotV2";

const LONG_ANSWER =
  "I keep coming back to the same question about whether I should leave my job.";
const SHORT_ANSWER = "I forget things";

async function seed(answer: string) {
  const fake = makeFakeRepo();
  const session = await startSession(fake.repo, { productKey: "soulseed" });
  await runCoheringV1(
    fake.repo,
    { userId: session.userId, sessionId: session.sessionId, answer },
    { mode: "mock" }
  );
  return { fake, session };
}

describe("composeSnapshotV2 (mock)", () => {
  it("produces a valid V2 with all 5 required rows populated + non-empty handoff", async () => {
    const { fake, session } = await seed(LONG_ANSWER);
    const snap = await composeSnapshotV2(
      fake.repo,
      { userId: session.userId, sessionId: session.sessionId },
      { mode: "mock" }
    );

    expect(SoulSeedSnapshotV2Schema.safeParse(snap).success).toBe(true);
    for (const key of ["identityPattern", "currentNeed", "supportStyle", "whatAIShouldAvoid", "nextCoherentStep"] as const) {
      expect(snap[key].title.length).toBeGreaterThan(0);
      expect(snap[key].description.length).toBeGreaterThan(0);
    }
    expect(snap.angelHandoffSummary.length).toBeGreaterThan(0);
    // derives from the cohering signal, not hardcoded spec fixtures
    expect(snap.identityPattern.title).not.toBe("Curious Builder");
    expect(snap.nextCoherentStep.title).toBe("Choose one priority and define what enough looks like.");
    expect(snap.supportStyle.title).toContain("·");
  });

  it("whatMattersMost present when memoryRoot signal ≥ 60 chars, absent when shorter", async () => {
    const long = await seed(LONG_ANSWER);
    const withMatters = await composeSnapshotV2(
      long.fake.repo,
      { userId: long.session.userId, sessionId: long.session.sessionId },
      { mode: "mock" }
    );
    expect(withMatters.whatMattersMost).toBeDefined();
    // the mock clips the answer at ~70 chars; assert on a fragment inside the clip
    expect(withMatters.whatMattersMost?.description).toContain("the same question");

    const short = await seed(SHORT_ANSWER);
    const withoutMatters = await composeSnapshotV2(
      short.fake.repo,
      { userId: short.session.userId, sessionId: short.session.sessionId },
      { mode: "mock" }
    );
    expect(withoutMatters.whatMattersMost).toBeUndefined();
  });

  it("hurlSeedData mirrors the minted HURL parts (structured view, no grammar change)", async () => {
    const { fake, session } = await seed(LONG_ANSWER);
    const snap = await composeSnapshotV2(
      fake.repo,
      { userId: session.userId, sessionId: session.sessionId },
      { mode: "mock" }
    );

    const latestHurl = fake.hurls.at(-1)!;
    const m = /^hurl:\/\/soulseed\/([a-z0-9-]+)\/state-(\d+)\/coherence-(\d+)$/.exec(latestHurl.path)!;
    expect(snap.hurlSeedData.realm).toBe("soulseed");
    expect(snap.hurlSeedData.chamber).toBe(m[1]);
    expect(snap.hurlSeedData.stage).toBe(Number(m[2]));
    expect(snap.hurlSeedData.coherence).toBe(Number(m[3]));
    expect(snap.hurlSeedData.branch.length).toBeGreaterThan(0);
  });

  it("throws cohering_signal_missing when prerequisites are absent", async () => {
    const fake = makeFakeRepo();
    const session = await startSession(fake.repo, { productKey: "soulseed" });
    await expect(
      composeSnapshotV2(
        fake.repo,
        { userId: session.userId, sessionId: session.sessionId },
        { mode: "mock" }
      )
    ).rejects.toThrow();
  });
});

describe("slugifyBranch", () => {
  it("picks the first two substantial words, lowercased-hyphenated", () => {
    expect(slugifyBranch("Builder / systems thinker / meaning-driven")).toBe("builder-systems");
  });
  it("falls back when no clear slug", () => {
    expect(slugifyBranch("a b c")).toBe("first-cohering");
  });
});
