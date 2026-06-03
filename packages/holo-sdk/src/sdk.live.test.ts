import { describe, expect, it } from "vitest";
import { createHoloClient } from "./index";

// Live end-to-end chain through the SDK. Runs only when HOLO_BASE_URL points at
// a running Core (skipped otherwise, so `pnpm -w test` stays green offline).
const BASE_URL = process.env.HOLO_BASE_URL;
const suite = BASE_URL ? describe : describe.skip;

suite("holo-sdk live chain", () => {
  it("start → event → memory upsert/context → orchestration → hurl, all via the SDK", async () => {
    const holo = createHoloClient({ baseUrl: BASE_URL as string });

    const session = await holo.sessions.start({ productKey: "soulseed" });
    console.log("[1] sessions.start →", {
      userId: session.userId,
      sessionId: session.sessionId,
      chamber: session.state.currentChamber,
      isReturning: session.isReturning,
    });
    expect(session.state.currentChamber).toBe("threshold");

    const got = await holo.sessions.get(session.sessionId);
    console.log("[2] sessions.get →", { chamber: got.state.currentChamber, hurl: got.hurl });
    expect(got.sessionId).toBe(session.sessionId);

    const ev = await holo.events.write({
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
      chamberKey: "threshold",
      eventType: "chamber.entered",
      payload: { ts: "now" },
    });
    console.log("[3] events.write →", { eventId: ev.eventId });
    expect(ev.eventId).toBeTypeOf("string");

    const up = await holo.memory.upsert({
      userId: session.userId,
      sessionId: session.sessionId,
      sourceProduct: "soulseed",
      scope: "narrative",
      content: "the late-bloomer founder",
      importance: 0.85,
    });
    console.log("[4] memory.upsert →", { memoryId: up.memoryId, scope: up.scope });

    const ctx = await holo.memory.context({ userId: session.userId, productKey: "soulseed" });
    console.log("[5] memory.context → narrative:", ctx.narrative.map((m) => m.content));
    expect(ctx.narrative.length).toBeGreaterThan(0);

    const orch = await holo.orchestration.next({
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
      agentOutput: {
        message: "m",
        insight: "i",
        detectedThemes: ["building"],
        coherenceDelta: 0.2,
        memoryWrites: [],
        statePatch: {},
      },
    });
    console.log("[6] orchestration.next →", {
      nextChamber: orch.nextChamber,
      chamber: orch.state.currentChamber,
      coherence: orch.state.coherence,
      hurl: orch.hurl,
    });
    expect(orch.state.currentChamber).toBe("identity-seed");

    const minted = await holo.hurl.mint({ sessionId: session.sessionId });
    console.log("[7] hurl.mint →", minted.hurl);
    expect(minted.hurl).toMatch(/^hurl:\/\/soulseed\//);

    const manifest = await holo.products.manifest("soulseed");
    console.log("[8] products.manifest →", {
      productKey: manifest.productKey,
      version: manifest.version,
      chambers: manifest.chambers.length,
    });
    expect(manifest.chambers).toHaveLength(6);

    // stubs (clearly marked)
    const agent = await holo.agents.run({
      userId: session.userId,
      sessionId: session.sessionId,
      productKey: "soulseed",
      chamberKey: "threshold",
      agentKey: "rezzie",
      input: { message: "hi" },
    });
    console.log("[stub] agents.run →", agent.message);

    const ents = await holo.entitlements.check(session.userId);
    console.log("entitlements.check →", JSON.stringify(ents));
    expect(Array.isArray(ents.entitlements)).toBe(true);
    expect(typeof ents.paymentsEnabled).toBe("boolean");
  });
});
