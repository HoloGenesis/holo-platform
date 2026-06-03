import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { makeFakeRepo } from "../testing/fakeRepo";
import { writeEvent } from "./events";
import { getContext, upsertMemory } from "./memory";

const userId = () => randomUUID();
const sessionId = () => randomUUID();

describe("writeEvent", () => {
  it("records an event with session + chamber", async () => {
    const { repo, events } = makeFakeRepo();
    const u = userId();
    const s = sessionId();

    const res = await writeEvent(repo, {
      userId: u,
      sessionId: s,
      productKey: "soulseed",
      chamberKey: "identity-seed",
      eventType: "choice.selected",
      payload: { choice: "I'm building something." },
    });

    expect(res.eventId).toBeTypeOf("string");
    expect(res.createdAt).toBeTypeOf("string");
    expect(events.at(-1)?.sessionId).toBe(s);
    expect(events.at(-1)?.chamberKey).toBe("identity-seed");
  });
});

describe("upsertMemory + getContext", () => {
  it("stores two memories in different scopes and groups them", async () => {
    const { repo } = makeFakeRepo();
    const u = userId();
    const s = sessionId();

    await upsertMemory(repo, {
      userId: u,
      sessionId: s,
      sourceProduct: "soulseed",
      scope: "narrative",
      content: "the late-bloomer founder",
      importance: 0.85,
    });
    await upsertMemory(repo, {
      userId: u,
      sessionId: s,
      sourceProduct: "soulseed",
      scope: "state",
      content: "currently between jobs",
      importance: 0.6,
    });

    const ctx = await getContext(repo, { userId: u, productKey: "soulseed" });
    expect(ctx.narrative).toHaveLength(1);
    expect(ctx.state).toHaveLength(1);
    expect(ctx.narrative[0]?.content).toBe("the late-bloomer founder");
    expect(ctx.state[0]?.content).toBe("currently between jobs");
    expect(ctx.profile).toEqual([]);
  });

  it("dedupes by contentJson.key (upsert updates in place)", async () => {
    const { repo, memories } = makeFakeRepo();
    const u = userId();

    const first = await upsertMemory(repo, {
      userId: u,
      sessionId: null,
      sourceProduct: "soulseed",
      scope: "profile",
      content: "name: Wren",
      contentJson: { key: "name", value: "Wren" },
      importance: 0.9,
    });
    const second = await upsertMemory(repo, {
      userId: u,
      sessionId: null,
      sourceProduct: "soulseed",
      scope: "profile",
      content: "name: Wren Adesina",
      contentJson: { key: "name", value: "Wren Adesina" },
      importance: 0.95,
    });

    expect(second.memoryId).toBe(first.memoryId); // updated, not duplicated
    expect(memories.filter((m) => m.userId === u)).toHaveLength(1);
    expect(memories[0]?.content).toBe("name: Wren Adesina");
  });

  it("CROSS-PRODUCT: getContext from soulseed sees a holobook-written memory", async () => {
    const { repo } = makeFakeRepo();
    const u = userId();

    // a *different* product writes a memory for the same user
    await upsertMemory(repo, {
      userId: u,
      sessionId: null,
      sourceProduct: "holobook",
      scope: "narrative",
      content: "wants to write a memoir",
      importance: 0.8,
    });

    // soulseed reads context and still sees it
    const ctx = await getContext(repo, { userId: u, productKey: "soulseed" });
    expect(ctx.narrative).toHaveLength(1);
    expect(ctx.narrative[0]?.sourceProduct).toBe("holobook");
  });
});
