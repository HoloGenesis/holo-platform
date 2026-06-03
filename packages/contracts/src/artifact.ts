import { z } from "zod";
import { IsoDateTimeSchema, ProductKeySchema, UuidSchema } from "./primitives";
import { HurlPathSchema } from "./hurl";

export const ARTIFACT_TYPES = ["soulseed-snapshot"] as const;
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
