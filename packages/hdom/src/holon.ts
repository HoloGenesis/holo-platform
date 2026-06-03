import { HolonSchema } from "@holo/contracts";
import type { Holon, HolonHistoryEntry } from "@holo/contracts";

/** Input for {@link createHolon} — id/type/title required, everything else defaulted. */
export interface CreateHolonInput {
  id: string;
  type: string;
  title: string;
  identity?: Record<string, unknown>;
  state?: Record<string, unknown>;
  history?: HolonHistoryEntry[];
  trajectory?: Holon["trajectory"];
  relationships?: Holon["relationships"];
  children?: Holon[];
}

/**
 * Build a valid {@link Holon}, filling sensible empty defaults. The result is
 * validated against `HolonSchema`, so a created holon is always well-formed.
 */
export function createHolon(input: CreateHolonInput): Holon {
  const holon: Holon = {
    id: input.id,
    type: input.type,
    title: input.title,
    identity: input.identity ?? {},
    state: input.state ?? {},
    history: input.history ?? [],
    trajectory: input.trajectory ?? {},
    relationships: input.relationships ?? [],
    children: input.children ?? [],
  };
  return HolonSchema.parse(holon);
}

/**
 * Return a new holon with `patch` merged into its `state`. The original holon
 * (and its `state` object) is never mutated.
 */
export function updateHolonState(holon: Holon, patch: Record<string, unknown>): Holon {
  return {
    ...holon,
    state: { ...holon.state, ...patch },
  };
}

/**
 * Return a new holon with `event` appended to its `history`. The original
 * holon (and its `history` array) is never mutated.
 */
export function appendHolonEvent(holon: Holon, event: HolonHistoryEntry): Holon {
  return {
    ...holon,
    history: [...holon.history, event],
  };
}
