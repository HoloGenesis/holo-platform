// @holo/hdom — the Holonic DOM runtime. Pure, immutable, in-memory utilities
// for representing a product as a living tree of holons. No DB, no network.

export { createHolon, updateHolonState, appendHolonEvent } from "./holon";
export type { CreateHolonInput } from "./holon";
export { getNextChamber, calculateProgress } from "./progression";
export { serializeHDOM, restoreHDOM } from "./serialize";
