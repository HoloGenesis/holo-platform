import { describe, expect, it, vi } from "vitest";
import type { SoulSeedSnapshotV2 } from "@holo/contracts";

// fetch must be stubbed BEFORE the store (→ holo SDK) loads (S87 pattern).
const events: string[] = [];
const upserts: Record<string, unknown>[] = [];
let failNext = false;

vi.stubGlobal("fetch", async (url: string, opts?: { body?: string }) => {
  if (url.includes("/v1/memory/upsert")) {
    const body = opts?.body ? (JSON.parse(opts.body) as Record<string, unknown>) : {};
    if (failNext) {
      failNext = false;
      return { ok: false, status: 500, json: async () => ({ error: "boom" }) } as unknown as Response;
    }
    events.push(`upsert:${(body.contentJson as Record<string, unknown>)?.key as string}`);
    upserts.push(body);
  }
  return { ok: true, json: async () => ({ memoryId: "33333333-3333-4333-8333-333333333333", scope: "state" }) } as unknown as Response;
});

const { useSprint10Store } = await import("./sprint10Store");

const row = (title: string) => ({ title, description: `${title}.` });
const snapshot: SoulSeedSnapshotV2 = {
  identityPattern: row("Becoming signal"),
  currentNeed: row("Clarity"),
  supportStyle: row("Direct"),
  whatAIShouldAvoid: row("Fluff"),
  nextCoherentStep: row("One priority"),
  angelHandoffSummary: "Meet them plainly.",
  hurlSeedData: { realm: "soulseed", chamber: "threshold", stage: 7, coherence: 12, branch: "becoming-signal" },
};
const USER = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";

describe("sprint10Store — S88 completion", () => {
  it("completeFlow writes flow.completed exactly once across repeated calls", async () => {
    events.length = 0;
    useSprint10Store.setState({ userId: USER, sessionId: SESSION, completionStatus: "idle", completedAt: null });

    await Promise.all([
      useSprint10Store.getState().completeFlow(), // strict-mode style double-invoke
      useSprint10Store.getState().completeFlow(),
    ]);
    await useSprint10Store.getState().completeFlow(); // and a third, post-complete

    expect(events.filter((e) => e === "upsert:flow.completed")).toHaveLength(1);
    expect(useSprint10Store.getState().completionStatus).toBe("complete");
    const completed = upserts.find(
      (u) => (u.contentJson as Record<string, unknown>)?.key === "flow.completed"
    );
    expect(completed?.importance).toBe(0.85);
    const iso = (completed?.contentJson as Record<string, unknown>)?.completedAt as string;
    expect(Number.isNaN(Date.parse(iso))).toBe(false);
    expect(useSprint10Store.getState().completedAt).toBe(iso);
  });

  it("completeFlow failure → error status; Try again (re-call) succeeds", async () => {
    events.length = 0;
    useSprint10Store.setState({ userId: USER, sessionId: SESSION, completionStatus: "idle", completedAt: null });
    failNext = true;
    await useSprint10Store.getState().completeFlow();
    expect(useSprint10Store.getState().completionStatus).toBe("error");

    await useSprint10Store.getState().completeFlow();
    expect(useSprint10Store.getState().completionStatus).toBe("complete");
    expect(events.filter((e) => e === "upsert:flow.completed")).toHaveLength(1);
  });

  it("enterMySoulSeed writes flow.entered_my_soulseed BEFORE navigating to the return URL", async () => {
    events.length = 0;
    const assigned: string[] = [];
    vi.stubGlobal("window", {
      location: {
        origin: "http://localhost:3000",
        assign: (url: string) => {
          assigned.push(url);
          events.push("assign");
        },
      },
      localStorage: { getItem: () => null, setItem: () => undefined },
    });
    useSprint10Store.setState({ snapshot, userId: USER, sessionId: SESSION });

    await useSprint10Store.getState().enterMySoulSeed();

    expect(assigned).toHaveLength(1);
    expect(assigned[0]).toBe(useSprint10Store.getState().getReturnUrl());
    expect(assigned[0]).toContain("/?hurl=hurl%3A%2F%2Fsoulseed%2Fthreshold%2Fstate-7%2Fcoherence-012");
    // ordering: the memory write fires before the navigation
    expect(events.indexOf("upsert:flow.entered_my_soulseed")).toBeLessThan(events.indexOf("assign"));
    vi.unstubAllGlobals();
  });
});
