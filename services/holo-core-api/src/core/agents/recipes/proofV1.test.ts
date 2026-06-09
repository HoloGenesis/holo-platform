import { randomUUID } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProofOutputSchema } from "@holo/contracts";
import { makeFakeRepo } from "../../../testing/fakeRepo";
import { runCoheringV1 } from "./coheringV1";
import { runProofV1 } from "./proofV1";

// Seed the cohering memories proof-v1 reads, by running cohering-v1 (mock).
async function seedCohering(repo: ReturnType<typeof makeFakeRepo>["repo"], userId: string, sessionId: string) {
  await runCoheringV1(repo, { userId, sessionId, answer: "I want clarity before depth." }, { mode: "mock" });
}

afterEach(() => {
  vi.unstubAllGlobals();
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.AGENT_MODE;
});

describe("proof-v1 (mock)", () => {
  it("returns generic + attuned responses, citation appears verbatim, writes proof.shown", async () => {
    const { repo, memories } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();
    await seedCohering(repo, userId, sessionId);

    const out = await runProofV1(repo, { userId, sessionId }, { mode: "mock" });

    expect(ProofOutputSchema.safeParse(out).success).toBe(true);
    expect(out.genericResponse.length).toBeGreaterThan(0);
    expect(out.attunedResponse.length).toBeGreaterThan(0);
    // the proof: attuned cites the user verbatim, generic does not reference them
    expect(out.attunedResponse).toContain(out.attunedCitation);
    expect(out.genericResponse).not.toContain(out.attunedCitation);

    const proofMem = memories.filter(
      (m) => m.scope === "state" && m.contentJson?.["key"] === "proof.shown"
    );
    expect(proofMem).toHaveLength(1);
    expect(proofMem[0]?.contentJson?.["attunedCitation"]).toBe(out.attunedCitation);
  });

  it("throws cohering_signal_missing when no cohering memory exists", async () => {
    const { repo } = makeFakeRepo();
    await expect(
      runProofV1(repo, { userId: randomUUID(), sessionId: randomUUID() }, { mode: "mock" })
    ).rejects.toThrow();
  });
});

describe("proof-v1 (live — both calls fire in parallel)", () => {
  it("issues two model calls (generic + attuned) and validates the combined output", async () => {
    const { repo } = makeFakeRepo();
    const userId = randomUUID();
    const sessionId = randomUUID();
    await seedCohering(repo, userId, sessionId);

    const seen: string[] = [];
    const fetchMock = vi.fn(async (_url: string, opts: { body: string }) => {
      const sentBody = JSON.parse(opts.body) as { system: string };
      const isAttuned = sentBody.system.includes("SoulSeed-attuned");
      seen.push(isAttuned ? "attuned" : "generic");
      const text = isAttuned
        ? JSON.stringify({
            response: "Because you value clarity before depth, focus on one priority this week.",
            citation: "you value clarity before depth",
          })
        : "Here are some general tips that might help you.";
      return { ok: true, json: async () => ({ content: [{ text }] }) } as unknown as Response;
    });
    vi.stubGlobal("fetch", fetchMock);
    process.env.ANTHROPIC_API_KEY = "test-key";
    process.env.AGENT_MODE = "live";

    const out = await runProofV1(repo, { userId, sessionId }, { mode: "live" });

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(seen.sort()).toEqual(["attuned", "generic"]);
    expect(ProofOutputSchema.safeParse(out).success).toBe(true);
    expect(out.attunedResponse).toContain(out.attunedCitation);
    expect(out.genericResponse).toContain("general tips");
  });
});
