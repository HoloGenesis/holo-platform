import { describe, expect, it, vi } from "vitest";
import type { SoulSeedSnapshotV2 } from "@holo/contracts";

// The holo SDK captures global fetch at module init, so the stub must be in
// place BEFORE the store (→ holo) module loads. Stub first, then dynamic-import.
type Call = { url: string; body: Record<string, unknown> };
const calls: Call[] = [];
let handler: (url: string) => { ok: boolean; status?: number; payload: unknown } = () => ({
  ok: true,
  payload: {},
});

vi.stubGlobal("fetch", async (url: string, opts?: { body?: string }) => {
  calls.push({ url, body: opts?.body ? (JSON.parse(opts.body) as Record<string, unknown>) : {} });
  const res = handler(url);
  return {
    ok: res.ok,
    status: res.status ?? (res.ok ? 200 : 500),
    json: async () => res.payload,
  } as unknown as Response;
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

describe("sprint10Store — S87 actions", () => {
  it("getReturnUrl derives the shareable URL from the snapshot (null without one)", () => {
    useSprint10Store.setState({ snapshot: null });
    expect(useSprint10Store.getState().getReturnUrl()).toBeNull();
    useSprint10Store.setState({ snapshot });
    expect(useSprint10Store.getState().getReturnUrl()).toContain(
      "/?hurl=hurl%3A%2F%2Fsoulseed%2Fthreshold%2Fstate-7%2Fcoherence-012"
    );
  });

  it("openMyHurl writes the hurl.opened memory (0.20) and advances to Screen 9", async () => {
    calls.length = 0;
    handler = () => ({ ok: true, payload: { memoryId: "m1", scope: "state" } });
    useSprint10Store.setState({ snapshot, currentScreen: 8, userId: USER, sessionId: SESSION });

    await useSprint10Store.getState().openMyHurl();

    expect(useSprint10Store.getState().currentScreen).toBe(9);
    const upsert = calls.find((c) => c.url.includes("/v1/memory/upsert"));
    expect(upsert).toBeDefined();
    expect((upsert?.body.contentJson as Record<string, unknown>).key).toBe("hurl.opened");
    expect(upsert?.body.importance).toBe(0.2);
    expect(upsert?.body.scope).toBe("state");
  });

  it("sendHurlEmail: success → sent + sticky address + cleared draft", async () => {
    calls.length = 0;
    handler = () => ({ ok: true, payload: { userId: USER, email: "maya@example.com" } });
    useSprint10Store.setState({ userId: USER, emailDraft: "maya@example.com", emailStatus: "idle", emailSentTo: null });

    await useSprint10Store.getState().sendHurlEmail();

    expect(useSprint10Store.getState().emailStatus).toBe("sent");
    expect(useSprint10Store.getState().emailSentTo).toBe("maya@example.com");
    expect(useSprint10Store.getState().emailDraft).toBe("");
    expect(calls.find((c) => c.url.includes("/v1/users/email"))).toBeDefined();
  });

  it("sendHurlEmail: failure → error state; advancement is never blocked", async () => {
    handler = () => ({ ok: false, status: 500, payload: { error: "boom" } });
    useSprint10Store.setState({ userId: USER, emailDraft: "maya@example.com", emailStatus: "idle" });

    await useSprint10Store.getState().sendHurlEmail();
    expect(useSprint10Store.getState().emailStatus).toBe("error");

    // openMyHurl still advances even while email is in error state
    handler = () => ({ ok: false, status: 500, payload: { error: "boom" } });
    useSprint10Store.setState({ currentScreen: 8, userId: USER, sessionId: SESSION });
    await useSprint10Store.getState().openMyHurl();
    expect(useSprint10Store.getState().currentScreen).toBe(9);
  });
});
