import { describe, expect, it } from "vitest";
import type { SessionState } from "@holo/contracts";
import { makeFakeRepo } from "../testing/fakeRepo";
import { mintAndPersistHurl, mintHurl } from "./hurl";
import { startSession } from "./sessions";

const state = (overrides: Partial<SessionState> = {}): SessionState => ({
  currentChamber: "identity-seed",
  coherence: 0.82,
  emergencePressure: 0.1,
  chambersVisited: ["threshold", "identity-seed"],
  custom: {},
  ...overrides,
});

const USER = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";

describe("mintHurl", () => {
  it("is deterministic — identical inputs yield the identical path", () => {
    const a = mintHurl(USER, SESSION, "soulseed", "identity-seed", state());
    const b = mintHurl(USER, SESSION, "soulseed", "identity-seed", state());
    expect(a).toBe(b);
  });

  it("matches the HURL format and encodes coherence as a 3-digit triplet", () => {
    const path = mintHurl(USER, SESSION, "soulseed", "identity-seed", state({ coherence: 0.82 }));
    expect(path).toMatch(/^hurl:\/\/soulseed\/identity-seed\/state-\d+\/coherence-\d{3}$/);
    expect(path.endsWith("/coherence-082")).toBe(true);
  });

  it("changes when the state changes", () => {
    const a = mintHurl(USER, SESSION, "soulseed", "identity-seed", state({ coherence: 0.2 }));
    const b = mintHurl(USER, SESSION, "soulseed", "identity-seed", state({ coherence: 0.9 }));
    expect(a).not.toBe(b);
  });
});

describe("mintAndPersistHurl", () => {
  it("mints from session state and persists a hurl row", async () => {
    const { repo, hurls } = makeFakeRepo();
    const started = await startSession(repo, { productKey: "soulseed" });

    const path = await mintAndPersistHurl(repo, started.sessionId);
    expect(path).toMatch(/^hurl:\/\/soulseed\/threshold\/state-\d+\/coherence-\d{3}$/);
    // one HURL from startSession (placeholder) + one from mint
    expect(hurls.at(-1)?.path).toBe(path);
  });
});
