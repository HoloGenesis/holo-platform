import type { HdomDocument, HdomNode, Hurl } from "../types/hdom";

/**
 * Map a HURL branch slug to the HDOM chamber it should activate.
 * SoulSeed branches steer toward the orientation chamber; the canonical
 * branch leaves the tree in its seeded state.
 */
export const BRANCH_TO_CHAMBER: Record<string, string> = {
  canon: "root-holoscrolly",
  "brand-tree": "soulseed-compass",
  "wholeness-journey": "soulseed-compass",
  "leadership-journey": "soulseed-compass"
};

export function resolveChamberId(branch: string): string {
  return BRANCH_TO_CHAMBER[branch] ?? "root-holoscrolly";
}

function setActive(node: HdomNode, activeId: string): HdomNode {
  const isActive = node.id === activeId;
  return {
    ...node,
    state: isActive ? "active" : node.state === "active" ? "revealed" : node.state,
    children: node.children.map((child) => setActive(child, activeId))
  };
}

/**
 * Route-driven hydration. Returns a *new* document whose root carries the
 * route's HURL and whose branch-resolved chamber is marked `active`. Pure:
 * the seed canon in `canon.ts` is never mutated, so deep-links and the
 * canonical root stay independent.
 */
export function hydrateCanon(doc: HdomDocument, hurl: Hurl): HdomDocument {
  const activeId = resolveChamberId(hurl.branch);
  const root = setActive({ ...doc.root, hurl }, activeId);
  return { ...doc, root };
}

/** Convenience: the chamber id a given HURL would activate. */
export function activeChamberFor(hurl: Hurl): string {
  return resolveChamberId(hurl.branch);
}
