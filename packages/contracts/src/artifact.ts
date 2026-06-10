import { z } from "zod";
import { IsoDateTimeSchema, ProductKeySchema, UuidSchema } from "./primitives";
import { HurlPathSchema } from "./hurl";

export const ARTIFACT_TYPES = ["soulseed-snapshot", "soulseed-snapshot-v2"] as const;
export const ArtifactTypeSchema = z.enum(ARTIFACT_TYPES);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

/**
 * The SoulSeed Snapshot payload (`artifactType: "soulseed-snapshot"`).
 * Every field is derived from stored memories — the LLM formats, it is not the
 * source of truth.
 */
export const SoulSeedSnapshotSchema = z.object({
  identitySignal: z.string(),
  presentState: z.string(),
  returningPattern: z.string(),
  emergingTrajectory: z.string(),
  firstInvitation: z.string(),
  hurl: HurlPathSchema,
  /** Placeholder in v1, gated by the `astro-addon` entitlement; real layer in v1.1. */
  deeperTrajectoryTeaser: z.string().nullable().optional(),
});
export type SoulSeedSnapshot = z.infer<typeof SoulSeedSnapshotSchema>;

/** A typed Snapshot row: short label + one-sentence elaboration. */
export const SnapshotRowSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});
export type SnapshotRow = z.infer<typeof SnapshotRowSchema>;

/**
 * SoulSeed Snapshot v2 (S86, Brooks's 9-Jun spec — audit item 4). ADDITIVE:
 * v1 above stays untouched until the S89 cutover. Every row derives
 * deterministically from cohering memories; angelHandoffSummary is the one
 * LLM-composed field (no fabrication beyond the structured input).
 * hurlSeedData is a structured VIEW of the existing 4-part HURL — no grammar change.
 */
export const SoulSeedSnapshotV2Schema = z.object({
  identityPattern: SnapshotRowSchema,
  currentNeed: SnapshotRowSchema,
  supportStyle: SnapshotRowSchema,
  whatAIShouldAvoid: SnapshotRowSchema,
  whatMattersMost: SnapshotRowSchema.optional(),
  nextCoherentStep: SnapshotRowSchema,
  angelHandoffSummary: z.string().min(1),
  hurlSeedData: z.object({
    realm: z.literal("soulseed"),
    chamber: z.string().min(1),
    stage: z.number().int().nonnegative(),
    branch: z.string().min(1),
    coherence: z.number().int().nonnegative(),
  }),
});
export type SoulSeedSnapshotV2 = z.infer<typeof SoulSeedSnapshotV2Schema>;

export const ArtifactRecordSchema = z.object({
  id: UuidSchema.optional(),
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  artifactType: ArtifactTypeSchema,
  title: z.string(),
  contentJson: z.record(z.unknown()),
  fileUrl: z.string().url().optional(),
  createdAt: IsoDateTimeSchema.optional(),
});
export type ArtifactRecord = z.infer<typeof ArtifactRecordSchema>;
