import type { HdomNode, Hurl } from "../types/hdom";

/**
 * TOPO_HOLONIC_RECURSION
 *
 * A step opens a *smaller complete HOLOSCROLLY* (a child holon), the visitor
 * traverses it, and on return the parent timeline is updated with a return
 * event. These pure helpers carry the logic so the component stays thin and the
 * behavior stays testable.
 */
export interface HolonReturnEvent {
  childId: string;
  parentHurl: Hurl;
  depth: number;
  enteredAt: string;
  returnedAt: string;
  carried: string | null; // the "next true step" carried back up, if any
}

export function createReturnEvent(
  parentHurl: Hurl,
  child: HdomNode,
  enteredAt: string,
  returnedAt: string,
  carried: string | null = null,
  depth = 1
): HolonReturnEvent {
  return { childId: child.id, parentHurl, depth, enteredAt, returnedAt, carried };
}

/**
 * Apply a return to a parent node: mark the named child `remembered`, increment
 * the child's visit count, and append a note to the parent's memory. Pure — a
 * new parent tree is returned and the input is never mutated.
 */
export function applyReturn(parent: HdomNode, event: HolonReturnEvent): HdomNode {
  const note = event.carried
    ? `[recursion] returned from ${event.childId} carrying: ${event.carried}`
    : `[recursion] returned from ${event.childId}`;

  return {
    ...parent,
    memory: { ...parent.memory, notes: [...parent.memory.notes, note] },
    children: parent.children.map((child) =>
      child.id === event.childId
        ? {
            ...child,
            state: "remembered",
            memory: { ...child.memory, visits: child.memory.visits + 1 }
          }
        : child
    )
  };
}

/** Find a holon by id anywhere in a tree (used to locate the nested HOLOSCROLLY). */
export function findHolon(root: HdomNode, id: string): HdomNode | undefined {
  if (root.id === id) return root;
  for (const child of root.children) {
    const hit = findHolon(child, id);
    if (hit) return hit;
  }
  return undefined;
}
