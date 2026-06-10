import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { SoulSeedSnapshotV2 } from "@holo/contracts";

// zustand v5 serves the store's INITIAL state during SSR/static render
// (getServerSnapshot), so we mock the hook with a controllable plain object.
const mockState: Record<string, unknown> = {};
vi.mock("../../lib/sprint10Store", () => ({
  useSprint10Store: (selector: (s: Record<string, unknown>) => unknown) => selector(mockState),
}));

import { Screen08Hurl } from "./Screen08Hurl";

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

beforeEach(() => {
  for (const k of Object.keys(mockState)) delete mockState[k];
  Object.assign(mockState, {
    snapshot,
    getReturnUrl: () => "http://localhost:3000/?hurl=hurl%3A%2F%2Fsoulseed%2Fthreshold%2Fstate-7%2Fcoherence-012",
    openMyHurl: vi.fn(),
    goTo: vi.fn(),
    emailDraft: "",
    emailStatus: "idle",
    emailError: null,
    emailSentTo: null,
    setEmailDraft: vi.fn(),
    sendHurlEmail: vi.fn(),
    resetEmailCapture: vi.fn(),
  });
});

describe("Screen08Hurl (static render)", () => {
  it("renders headline, badges, Copy, email capture and the advance CTA; never the raw hurl://", () => {
    const html = renderToStaticMarkup(<Screen08Hurl />);

    expect(html).toContain("Your Return Link is ready.");
    expect(html).toContain("🔒 Encrypted");
    expect(html).toContain("Private");
    expect(html).toContain("Yours alone");
    expect(html).toContain("Copy");
    expect(html).toContain("Want this in your inbox?");
    expect(html).toContain("Open My HURL");
    // SSR guard: pre-mount the URL is a placeholder; the canonical never leaks
    expect(html).not.toContain("hurl://");
  });

  it("renders nothing when the snapshot is missing (redirect guard)", () => {
    mockState.snapshot = null;
    expect(renderToStaticMarkup(<Screen08Hurl />)).toBe("");
  });

  it("collapses the email form into the sent confirmation", () => {
    mockState.emailStatus = "sent";
    mockState.emailSentTo = "maya@example.com";
    const html = renderToStaticMarkup(<Screen08Hurl />);
    expect(html).toContain("Sent to maya@example.com.");
    expect(html).toContain("Send to another?");
    expect(html).not.toContain("Want this in your inbox?");
  });
});
