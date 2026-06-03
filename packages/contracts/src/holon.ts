import { z } from "zod";

export const HolonHistoryEntrySchema = z.object({
  /** ISO timestamp of the change. */
  at: z.string(),
  event: z.string(),
  data: z.record(z.unknown()).optional(),
});
export type HolonHistoryEntry = z.infer<typeof HolonHistoryEntrySchema>;

export const HolonRelationshipSchema = z.object({
  /** e.g. "child-of", "derived-from", "sibling". */
  type: z.string(),
  targetId: z.string(),
  note: z.string().optional(),
});
export type HolonRelationship = z.infer<typeof HolonRelationshipSchema>;

export const HolonTrajectorySchema = z.object({
  current: z.string().optional(),
  next: z.string().optional(),
  branches: z.array(z.string()).optional(),
});
export type HolonTrajectory = z.infer<typeof HolonTrajectorySchema>;

/**
 * A node in the Holonic DOM. One chamber = one holon. Recursive via `children`.
 *
 * Because the schema is recursive, the type is declared explicitly and the
 * schema is annotated with `z.ZodType<Holon>` (the canonical Zod pattern) rather
 * than inferred — `z.infer<typeof HolonSchema>` still resolves to `Holon`.
 */
export interface Holon {
  id: string;
  type: string;
  title: string;
  identity: Record<string, unknown>;
  state: Record<string, unknown>;
  history: HolonHistoryEntry[];
  trajectory: HolonTrajectory;
  relationships: HolonRelationship[];
  children: Holon[];
}

export const HolonSchema: z.ZodType<Holon> = z.lazy(() =>
  z.object({
    id: z.string(),
    type: z.string(),
    title: z.string(),
    identity: z.record(z.unknown()),
    state: z.record(z.unknown()),
    history: z.array(HolonHistoryEntrySchema),
    trajectory: HolonTrajectorySchema,
    relationships: z.array(HolonRelationshipSchema),
    children: z.array(HolonSchema),
  })
);
