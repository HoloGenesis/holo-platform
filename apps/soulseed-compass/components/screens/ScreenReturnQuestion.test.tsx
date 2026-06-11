import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

// mocked-hook pattern (zustand v5 serves initial state to static renders)
const mockState: Record<string, unknown> = {};
vi.mock("../../lib/sprint10Store", () => ({
  useSprint10Store: (selector: (s: Record<string, unknown>) => unknown) => selector(mockState),
}));

import { ScreenReturnQuestion } from "./ScreenReturnQuestion";

beforeEach(() => {
  for (const k of Object.keys(mockState)) delete mockState[k];
  Object.assign(mockState, {
    returnArrivalVector: null,
    returnAnswer: "",
    setReturnAnswer: vi.fn(),
    submitReturnAnswer: vi.fn(),
  });
});

describe("ScreenReturnQuestion — REZZIE return openers (doctrine, verbatim)", () => {
  const cases: [string | null, string][] = [
    ["lost", "Last time, you were carrying something you hadn&#x27;t put down. What&#x27;s different now?"],
    ["building", "Last time, you were building. What did the build teach you?"],
    ["becoming", "Last time, you were becoming someone. Who showed up since?"],
    ["unknown", "Last time, you didn&#x27;t know yet. Has anything quieted?"],
    [null, "Last time you were between worlds. What changed?"], // fallback
    ["something-else", "Last time you were between worlds. What changed?"], // unknown vector → fallback
  ];

  for (const [vector, expected] of cases) {
    it(`arrivalVector=${vector ?? "none"} → correct opener`, () => {
      mockState.returnArrivalVector = vector;
      const html = renderToStaticMarkup(<ScreenReturnQuestion />);
      expect(html).toContain(expected);
      expect(html.toLowerCase()).not.toContain("welcome back"); // doctrine
    });
  }

  it("binds the textarea to returnAnswer and never shows a 9-dot rail", () => {
    mockState.returnAnswer = "I left my old job.";
    const html = renderToStaticMarkup(<ScreenReturnQuestion />);
    expect(html).toContain("I left my old job.");
    // 3-dot return rail: exactly 3 rail dots render
    const dots = html.match(/h-2\.5 w-2\.5 rounded-full/g) ?? [];
    expect(dots).toHaveLength(3);
  });
});
