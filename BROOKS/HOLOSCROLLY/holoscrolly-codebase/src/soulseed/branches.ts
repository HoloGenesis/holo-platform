import type { HoloBaguaDomain } from "../types/hdom";

export interface SoulSeedBranch {
  id: string;
  title: string;
  invitation: string;
  domain: HoloBaguaDomain;
  branchSlug: string;
}

/** The three canonical branches a trunk signal can grow into. */
export const SOULSEED_BRANCHES: SoulSeedBranch[] = [
  {
    id: "brand-tree",
    title: "Brand Tree",
    invitation: "Grow the outward-facing form — voice, mark, and resonant signal.",
    domain: "professional",
    branchSlug: "brand-tree"
  },
  {
    id: "wholeness-journey",
    title: "Wholeness Journey",
    invitation: "Map the eight HOLOBAGUA domains and tend where coherence is thin.",
    domain: "spiritual",
    branchSlug: "wholeness-journey"
  },
  {
    id: "leadership-journey",
    title: "Leadership Journey",
    invitation: "Forge the capacity to carry others through their own becoming.",
    domain: "relational",
    branchSlug: "leadership-journey"
  }
];

export const SOULSEED_QUESTION = "What is trying to emerge through you right now?";
