import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { CoheringOutputSchema } from "@holo/contracts";
import { makeFakeRepo } from "../../../testing/fakeRepo";
import { runCoheringV1 } from "./coheringV1";

const ANSWER = "I'm a builder who wants clarity before depth.";

describe("cohering-v1 (S84b) — full output shape", () => {
  it("mock produces all fields: recognition + 6 vectors + signals + next step, and writes the S86-feed memories", async () => {
    const { repo, memories } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();

    const out = await runCoheringV1(repo, { userId, sessionId, answer: ANSWER }, { mode: "mock" });

    expect(CoheringOutputSchema.safeParse(out).success).toBe(true);
    expect(Object.values(out.chamberVectors)).toHaveLength(6);
    expect(out.supportStyleSignals.length).toBeGreaterThanOrEqual(1);
    expect(out.supportStyleSignals.length).toBeLessThanOrEqual(8);
    expect(out.avoidSignals.length).toBeLessThanOrEqual(8);
    expect(out.nextCoherentStep.length).toBeGreaterThan(0);

    const byKey = (key: string) =>
      memories.filter((m) => m.scope === "state" && m.contentJson?.["key"] === key);
    expect(byKey("cohering.recognition")).toHaveLength(1);
    expect(byKey("cohering.support_style")).toHaveLength(1);
    expect(byKey("cohering.avoid")).toHaveLength(1);
    expect(byKey("cohering.next_step")).toHaveLength(1);
    expect(byKey("cohering.support_style")[0]?.importance).toBe(0.75);
    expect(byKey("cohering.next_step")[0]?.content).toBe(out.nextCoherentStep);
  });
});

describe("cohering-v1 (S89) — return mode", () => {
  it("mode 'return' yields a delta-foregrounding recognition, distinct from first-mode for the same answer", async () => {
    const { repo } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();

    const first = await runCoheringV1(repo, { userId, sessionId, answer: ANSWER }, { mode: "mock" });
    const returned = await runCoheringV1(
      repo,
      { userId, sessionId, answer: ANSWER, mode: "return" },
      { mode: "mock" }
    );

    expect(returned.recognitionLine).not.toBe(first.recognitionLine);
    expect(returned.recognitionLine).toContain("You returned");
    // vectors reflect CURRENT state — all six still populated
    expect(Object.values(returned.chamberVectors)).toHaveLength(6);
    expect(CoheringOutputSchema.safeParse(returned).success).toBe(true);
  });
});

describe("cohering-v1 (S84b) — path (b) augment vs path (c) regenerate", () => {
  it("augment (addedContext): second recognition differs from first AND draws on both the original and the addition", async () => {
    const { repo, memories } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();

    const first = await runCoheringV1(repo, { userId, sessionId, answer: ANSWER }, { mode: "mock" });
    const second = await runCoheringV1(
      repo,
      { userId, sessionId, answer: ANSWER, addedContext: "Also: I need it to feel grounded, not poetic." },
      { mode: "mock" }
    );

    expect(second.recognitionLine).not.toBe(first.recognitionLine);
    // draws on BOTH (content shape, not exact match): a fragment of the original
    // answer and a fragment of the addition both appear
    expect(second.recognitionLine).toContain("builder");
    expect(second.recognitionLine).toContain("grounded");

    // both runs deposit chamber memories (6 + 6); recognition memory stays deduped
    const narrative = memories.filter((m) => m.scope === "narrative" && m.contentJson?.["chamberKey"]);
    expect(narrative).toHaveLength(12);
    const recognition = memories.filter(
      (m) => m.scope === "state" && m.contentJson?.["key"] === "cohering.recognition"
    );
    expect(recognition).toHaveLength(1);
  });

  it("regenerate (correctionOf): second run is a regeneration with no obligation to keep prior content", async () => {
    const { repo, agentRuns } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();

    const first = await runCoheringV1(repo, { userId, sessionId, answer: ANSWER }, { mode: "mock" });
    const second = await runCoheringV1(
      repo,
      { userId, sessionId, answer: ANSWER, correctionOf: "I'm not a builder, I'm a teacher figuring out my next chapter." },
      { mode: "mock" }
    );

    expect(second.recognitionLine).not.toBe(first.recognitionLine);
    // regeneration centers the corrective signal
    expect(second.recognitionLine).toContain("teacher");
    // the run records which path produced it
    expect((agentRuns[1]?.input as { correctionOf?: string }).correctionOf).toContain("teacher");
    expect((agentRuns[1]?.input as { addedContext?: string | null }).addedContext).toBeNull();
  });
});
