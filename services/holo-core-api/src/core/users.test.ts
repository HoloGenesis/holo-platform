import { describe, expect, it } from "vitest";
import { makeFakeRepo } from "../testing/fakeRepo";
import { writeEvent } from "./events";
import { upsertMemory } from "./memory";
import { startSession } from "./sessions";
import { mergeUser, setEmail } from "./users";

describe("setEmail", () => {
  it("sets email on the existing user — same userId, no new row", async () => {
    const { repo, users } = makeFakeRepo();
    const session = await startSession(repo, { productKey: "soulseed" });
    expect(users.get(session.userId)?.email).toBeNull();

    const res = await setEmail(repo, { userId: session.userId, email: "wren@example.com" });
    expect(res.userId).toBe(session.userId); // unchanged
    expect(res.email).toBe("wren@example.com");
    expect(users.get(session.userId)?.email).toBe("wren@example.com");
    expect(users.size).toBe(1); // no new user created
  });

  it("throws for an unknown user", async () => {
    const { repo } = makeFakeRepo();
    await expect(
      setEmail(repo, { userId: "11111111-1111-4111-8111-111111111111", email: "x@y.com" })
    ).rejects.toThrow();
  });
});

describe("mergeUser", () => {
  it("re-points all child rows from anon → canonical and deletes anon", async () => {
    const { repo, users, sessions } = makeFakeRepo();

    // anonymous user with a full journey
    const anon = await startSession(repo, { productKey: "soulseed" });
    await writeEvent(repo, {
      userId: anon.userId,
      sessionId: anon.sessionId,
      productKey: "soulseed",
      chamberKey: "threshold",
      eventType: "chamber.entered",
      payload: {},
    });
    await upsertMemory(repo, {
      userId: anon.userId,
      sessionId: anon.sessionId,
      sourceProduct: "soulseed",
      scope: "narrative",
      content: "the builder",
      importance: 0.85,
    });

    // canonical user (e.g. from a later login)
    const canonical = await startSession(repo, { productKey: "soulseed" });

    const result = await mergeUser(repo, { from: anon.userId, into: canonical.userId });
    expect(result.ok).toBe(true);
    expect(result.merged?.sessions).toBe(1);
    expect(result.merged?.events).toBe(1);
    expect(result.merged?.memories).toBe(1);

    // anon user gone; its rows now belong to canonical
    expect(users.has(anon.userId)).toBe(false);
    expect([...sessions.values()].filter((s) => s.userId === anon.userId)).toHaveLength(0);
    expect([...sessions.values()].filter((s) => s.userId === canonical.userId).length).toBe(2);
  });

  it("is a no-op when from === into", async () => {
    const { repo } = makeFakeRepo();
    const u = await startSession(repo, { productKey: "soulseed" });
    const result = await mergeUser(repo, { from: u.userId, into: u.userId });
    expect(result.ok).toBe(true);
    expect(result.note).toBe("noop");
  });
});
