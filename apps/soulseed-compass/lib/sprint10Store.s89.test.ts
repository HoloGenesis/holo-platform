import { describe, expect, it, vi } from "vitest";

// fetch stubbed BEFORE the store (→ holo SDK) loads (S87 pattern). A tiny
// router fakes the engine endpoints the return flow touches.
const calls: { url: string; body: Record<string, unknown> }[] = [];
let resolveFails = false;

const USER = "11111111-1111-4111-8111-111111111111";
const SESSION = "22222222-2222-4222-8222-222222222222";

vi.stubGlobal("fetch", async (url: string, opts?: { body?: string }) => {
  const body = opts?.body ? (JSON.parse(opts.body) as Record<string, unknown>) : {};
  calls.push({ url, body });
  const ok = (payload: unknown) => ({ ok: true, json: async () => payload }) as unknown as Response;
  const fail = (status: number, error: string) =>
    ({ ok: false, status, json: async () => ({ error }) }) as unknown as Response;

  if (url.includes("/v1/hurl/resolve")) {
    return resolveFails
      ? fail(404, "hurl_not_found")
      : ok({ userId: USER, sessionId: SESSION, productKey: "soulseed" });
  }
  if (url.includes("/v1/sessions/resume")) {
    return ok({
      userId: USER,
      sessionId: SESSION,
      productKey: "soulseed",
      state: {
        currentChamber: "living-invitation",
        coherence: 0.4,
        emergencePressure: 0,
        chambersVisited: ["threshold"],
        custom: { arrivalVector: "building" },
      },
      resumeContext: {
        lastChamber: "living-invitation",
        lastSnapshotSummary: "Becoming signal",
        keyMemories: [],
      },
    });
  }
  if (url.includes("/v1/agents/run")) {
    return ok({
      recognitionLine: "You returned with something moving.",
      supportingLine: "Change is signal.",
      chamberVectors: {
        threshold: "t", identitySeed: "i", presentState: "p",
        memoryRoot: "m", trajectoryBranch: "tr", livingInvitation: "l",
      },
      confidence: 0.6,
      supportStyleSignals: ["direct"],
      avoidSignals: [],
      nextCoherentStep: "One priority.",
    });
  }
  return ok({ memoryId: "33333333-3333-4333-8333-333333333333", scope: "state" });
});

const { useSprint10Store } = await import("./sprint10Store");

describe("sprint10Store — S89 return mode", () => {
  it("enterByReturnUrl resolves + resumes → RETURN_QUESTION with arrivalVector + ids", async () => {
    resolveFails = false;
    await useSprint10Store.getState().enterByReturnUrl(
      encodeURIComponent("hurl://soulseed/threshold/state-7/coherence-012")
    );
    const s = useSprint10Store.getState();
    expect(s.isReturnMode).toBe(true);
    expect(s.currentScreen).toBe("RETURN_QUESTION");
    expect(s.userId).toBe(USER);
    expect(s.sessionId).toBe(SESSION);
    expect(s.returnArrivalVector).toBe("building");
    expect(s.resumeContext?.lastSnapshotSummary).toBe("Becoming signal");
    // the resolve received the DECODED canonical (byte-identical contract)
    const resolveCall = calls.find((c) => c.url.includes("/v1/hurl/resolve"));
    expect(decodeURIComponent(resolveCall?.url ?? "")).toContain(
      "hurl://soulseed/threshold/state-7/coherence-012"
    );
  });

  it("invalid HURL → graceful first-visit fallback with the gentle notice", async () => {
    resolveFails = true;
    useSprint10Store.setState({ isReturnMode: false, currentScreen: 5, returnNotice: null });
    await useSprint10Store.getState().enterByReturnUrl("hurl%3A%2F%2Fsoulseed%2Fbogus%2Fstate-1%2Fcoherence-000");
    const s = useSprint10Store.getState();
    expect(s.isReturnMode).toBe(false);
    expect(s.currentScreen).toBe(1);
    expect(s.returnNotice).toBe("We couldn't find a SoulSeed for that link. Let's begin a new one.");
  });

  it("submitReturnAnswer → RETURN_LISTENING, cohering mode 'return', snapshot reset, then ready", async () => {
    resolveFails = false;
    calls.length = 0;
    useSprint10Store.setState({
      isReturnMode: true,
      userId: USER,
      sessionId: SESSION,
      returnAnswer: "I left my old job and started a 30-day sketch project.",
      returnRecognitionStatus: "idle",
      snapshotStatus: "ready",
    });

    const p = useSprint10Store.getState().submitReturnAnswer();
    // synchronous transition: listening + snapshot reset for the recompose
    expect(useSprint10Store.getState().currentScreen).toBe("RETURN_LISTENING");
    expect(useSprint10Store.getState().snapshotStatus).toBe("idle");
    await p;

    expect(useSprint10Store.getState().returnRecognitionStatus).toBe("ready");
    expect(useSprint10Store.getState().returnRecognition?.recognitionLine).toContain("You returned");
    const run = calls.find((c) => c.url.includes("/v1/agents/run"));
    expect(run?.body.mode).toBe("return");
    expect(run?.body.agentKey).toBe("cohering");
  });
});
