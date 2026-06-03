import { HolonSchema } from "@holo/contracts";
import type { Holon } from "@holo/contracts";

/** Serialize an HDOM tree (a root holon) to a JSON string. */
export function serializeHDOM(rootHolon: Holon): string {
  return JSON.stringify(rootHolon);
}

/**
 * Restore an HDOM tree from a JSON string, validating it against `HolonSchema`.
 * Throws if the JSON is malformed or doesn't satisfy the Holon contract.
 */
export function restoreHDOM(json: string): Holon {
  const parsed: unknown = JSON.parse(json);
  return HolonSchema.parse(parsed);
}
