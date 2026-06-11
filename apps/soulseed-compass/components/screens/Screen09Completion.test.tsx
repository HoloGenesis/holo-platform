import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// zustand v5 serves initial state to static renders — mock the hook (S87 pattern).
const mockState: Record<string, unknown> = {};
vi.mock("../../lib/sprint10Store", () => ({
  useSprint10Store: (selector: (s: Record<string, unknown>) => unknown) => selector(mockState),
}));

import { Screen09Completion } from "./Screen09Completion";

beforeEach(() => {
  for (const k of Object.keys(mockState)) delete mockState[k];
  Object.assign(mockState, {
    completionStatus: "idle",
    completeFlow: vi.fn(),
    enterMySoulSeed: vi.fn(),
  });
});

describe("Screen09Completion (static render)", () => {
  it("renders the §14 headline, the 4 quadrants, and the Octopus tease header", () => {
    const html = renderToStaticMarkup(<Screen09Completion />);

    expect(html).toContain("You&#x27;re all set.");
    expect(html).toContain("Your SoulSeed is active.");
    expect(html).toContain("Personalized first meeting");
    expect(html).toContain("Adaptive over time");
    expect(html).toContain("Guided becoming");
    expect(html).toContain("You stay in control");
    expect(html).toContain("Coming next");
    expect(html).toContain("Private by design");
  });

  it("Octopus tease carries the Q-P lock copy verbatim", () => {
    const html = renderToStaticMarkup(<Screen09Completion />);
    expect(html).toContain("Full Octopus Map");
    expect(html).toContain("Map your 8 domains of intelligence and agency.");
    expect(html).toContain("we&#x27;ll go deeper");
    // no shipping-date promises
    expect(html).not.toMatch(/v1\.1|soon|next week|coming in/i);
  });

  it("Enter My SoulSeed is disabled while idle, enabled once complete", () => {
    const idleHtml = renderToStaticMarkup(<Screen09Completion />);
    const idleButton = idleHtml.match(/<button[^>]*>Enter My SoulSeed[^<]*</)?.[0] ?? "";
    expect(idleButton).toContain("disabled");

    mockState.completionStatus = "complete";
    const readyHtml = renderToStaticMarkup(<Screen09Completion />);
    const readyButton = readyHtml.match(/<button[^>]*>Enter My SoulSeed[^<]*</)?.[0] ?? "";
    expect(readyButton).not.toContain("disabled");
  });

  it("shows the error card with Try again when completion fails", () => {
    mockState.completionStatus = "error";
    const html = renderToStaticMarkup(<Screen09Completion />);
    expect(html).toContain("Try again");
  });
});
