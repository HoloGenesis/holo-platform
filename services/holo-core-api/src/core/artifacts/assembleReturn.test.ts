import { describe, expect, it } from "vitest";
import type { SoulSeedSnapshot } from "@holo/contracts";
import { makeFakeRepo } from "../../testing/fakeRepo";
import { assembleReturnView } from "./assembleReturn";

const HURL = "hurl://soulseed/living-invitation/state-1/coherence-050";

const snap = (overrides: Partial<SoulSeedSnapshot> = {}): SoulSeedSnapshot => ({
  identitySignal: "Left a job that was quietly killing her.",
  presentState: "Terror and aliveness, trading places.",
  returningPattern: "Waiting for permission she doesn't need.",
  emergingTrajectory: "Less proving, more building.",
  firstInvitation: "Ship one unpolished thing this week.",
  hurl: HURL,
  deeperTrajectoryTeaser: null,
  ...overrides,
});

describe("assembleReturnView", () => {
  it("returns null when there is no prior snapshot (first visit)", async () => {
    const { repo } = makeFakeRepo();
    const { id: userId } = await repo.createAnonUser();

    const view = await assembleReturnView(repo, { userId, sessionId: "s1", snapshot: snap() });
    expect(view).toBeNull();
  });

  it("builds a ReturnView from the prior snapshot + the return-delta memory", async () => {
    const { repo } = makeFakeRepo();
    const { id: userId } = await repo.createAnonUser();
    const sessionId = "session-1";

    // a prior snapshot already stored for this user/session
    const previous = snap();
    await repo.upsertArtifact({
      userId,
      sessionId,
      productKey: "soulseed",
      artifactType: "soulseed-snapshot",
      title: previous.identitySignal,
      contentJson: previous,
      fileUrl: null,
    });

    // the return-delta memory (the user's "what changed" answer)
    await repo.insertMemory({
      userId,
      sessionId,
      sourceProduct: "soulseed",
      scope: "narrative",
      content: "Since last time: I finally shipped the thing.",
      contentJson: { key: "return-delta" },
      importance: 0.9,
    });

    const current = snap({
      presentState: "Steadier. The swing narrowed.",
      firstInvitation: "Tell one person what you built.",
    });

    const view = await assembleReturnView(repo, { userId, sessionId, snapshot: current });

    expect(view).not.toBeNull();
    expect(view?.previousSnapshot.presentState).toBe(previous.presentState);
    expect(view?.currentSnapshot.presentState).toBe(current.presentState);
    expect(view?.diff.whatChangedLine).toBe("I finally shipped the thing."); // prefix stripped
    const changed = view?.diff.perField.filter((f) => !f.unchanged) ?? [];
    expect(changed.map((f) => f.field).sort()).toEqual(["firstInvitation", "presentState"]);
    expect(view?.diff.perField.find((f) => f.field === "identitySignal")?.unchanged).toBe(true);
  });
});
