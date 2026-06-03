import type { EventWriteRequest, EventWriteResponse } from "@holo/contracts";
import type { CoreRepo } from "../repo";

/**
 * Record a single event. Every meaningful interaction writes one — cheap,
 * additive, never updated.
 */
export async function writeEvent(
  repo: CoreRepo,
  input: EventWriteRequest
): Promise<EventWriteResponse> {
  const { id, createdAt } = await repo.insertEvent({
    userId: input.userId,
    sessionId: input.sessionId,
    productKey: input.productKey,
    chamberKey: input.chamberKey,
    eventType: input.eventType,
    payload: input.payload,
  });
  return { eventId: id, createdAt };
}
