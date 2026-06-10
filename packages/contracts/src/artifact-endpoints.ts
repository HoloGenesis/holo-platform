import { z } from "zod";
import { ProductKeySchema, UuidSchema } from "./primitives";
import { ArtifactTypeSchema, SoulSeedSnapshotSchema, SoulSeedSnapshotV2Schema } from "./artifact";
import { HurlPathSchema } from "./hurl";

// I/O for artifacts/create. The request carries no content — Core ASSEMBLES the
// Snapshot from stored memory/state (reproducible), so the client can't inject it.

export const ArtifactCreateRequestSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  /** Discriminator (S86): omitted/"soulseed-snapshot" → v1; "soulseed-snapshot-v2" → v2. */
  artifactType: ArtifactTypeSchema.optional(),
});
export type ArtifactCreateRequest = z.infer<typeof ArtifactCreateRequestSchema>;

/** Response for the v2 path of artifacts/create (S86). */
export const SnapshotV2CreateResponseSchema = z.object({
  artifactId: UuidSchema,
  artifactType: z.literal("soulseed-snapshot-v2"),
  contentJson: SoulSeedSnapshotV2Schema,
});
export type SnapshotV2CreateResponse = z.infer<typeof SnapshotV2CreateResponseSchema>;

// --- return delta (S61) ----------------------------------------------------
// The visible "what moved since last time" view. Every line is reproducible:
// it traces to the user's verbatim answer (whatChangedLine) or a deterministic
// diff between two stored Snapshots — never an LLM invention.

export const SnapshotFieldSchema = z.enum([
  "identitySignal",
  "presentState",
  "returningPattern",
  "emergingTrajectory",
  "firstInvitation",
]);
export type SnapshotField = z.infer<typeof SnapshotFieldSchema>;

export const SoulSeedSnapshotFieldDiffSchema = z.object({
  field: SnapshotFieldSchema,
  unchanged: z.boolean(),
  prior: z.string(),
  current: z.string(),
  /** Deterministic one-line summary of the change (only when changed). */
  oneLineDelta: z.string().optional(),
});
export type SoulSeedSnapshotFieldDiff = z.infer<typeof SoulSeedSnapshotFieldDiffSchema>;

export const SoulSeedSnapshotDiffSchema = z.object({
  perField: z.array(SoulSeedSnapshotFieldDiffSchema),
  /** The user's verbatim return-mode answer. */
  whatChangedLine: z.string(),
  priorSnapshotAt: z.string(),
  currentSnapshotAt: z.string(),
});
export type SoulSeedSnapshotDiff = z.infer<typeof SoulSeedSnapshotDiffSchema>;

export const ReturnViewSchema = z.object({
  previousSnapshot: SoulSeedSnapshotSchema,
  currentSnapshot: SoulSeedSnapshotSchema,
  diff: SoulSeedSnapshotDiffSchema,
});
export type ReturnView = z.infer<typeof ReturnViewSchema>;

export const ArtifactCreateResponseSchema = z.object({
  artifactId: UuidSchema,
  artifactType: ArtifactTypeSchema,
  title: z.string(),
  contentJson: SoulSeedSnapshotSchema,
  hurl: HurlPathSchema,
  /** Present only on a return visit with a prior Snapshot to diff against. */
  returnView: ReturnViewSchema.optional(),
});
export type ArtifactCreateResponse = z.infer<typeof ArtifactCreateResponseSchema>;
