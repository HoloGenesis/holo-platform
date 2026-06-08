import { scrollyMoves } from "../data/moves";
import type { ScrollyMove } from "../types/moves";

export interface CompatibilityIssue {
  a: string;
  b: string;
  reason: "incompatible" | "unknown-move";
}

const ALL = "ALL";

function declaresCompatible(move: ScrollyMove | undefined, otherId: string): boolean {
  if (!move) return false;
  return move.compatibleWith.includes(ALL) || move.compatibleWith.includes(otherId);
}

/**
 * Validate a declared composition of move IDs. Two moves are compatible when
 * *either* declares the other (or "ALL"). Unknown move IDs are flagged too.
 * Pure function — returns issues, performs no logging.
 */
export function validateComposition(moveIds: string[]): CompatibilityIssue[] {
  const issues: CompatibilityIssue[] = [];
  const lookup = new Map(scrollyMoves.map((m) => [m.id, m] as const));

  for (let i = 0; i < moveIds.length; i++) {
    const idA = moveIds[i];
    if (!lookup.has(idA)) {
      issues.push({ a: idA, b: idA, reason: "unknown-move" });
      continue;
    }
    for (let j = i + 1; j < moveIds.length; j++) {
      const idB = moveIds[j];
      if (!lookup.has(idB)) continue; // reported on its own outer pass
      const ok = declaresCompatible(lookup.get(idA), idB) || declaresCompatible(lookup.get(idB), idA);
      if (!ok) issues.push({ a: idA, b: idB, reason: "incompatible" });
    }
  }
  return issues;
}

/**
 * Dev-only guard. Logs a console warning for each compatibility issue so an
 * author composing a HOLOSCROLLY sees the friction immediately. No-op in prod.
 */
export function warnIfIncompatible(moveIds: string[], label = "composition"): CompatibilityIssue[] {
  const issues = validateComposition(moveIds);
  const isDev =
    typeof import.meta !== "undefined" &&
    (import.meta as { env?: { DEV?: boolean } }).env?.DEV;
  if (isDev && issues.length > 0) {
    for (const issue of issues) {
      if (issue.reason === "unknown-move") {
        console.warn(`[HOLOSCROLLY:${label}] unknown move "${issue.a}" — not in the registry.`);
      } else {
        console.warn(
          `[HOLOSCROLLY:${label}] "${issue.a}" + "${issue.b}" are not declared compatible. ` +
            `Add one to the other's compatibleWith, or use "ALL".`
        );
      }
    }
  }
  return issues;
}
