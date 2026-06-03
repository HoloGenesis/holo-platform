import { z } from "zod";
import { ProductKeySchema, UuidSchema } from "./primitives";
import { ArtifactTypeSchema, SoulSeedSnapshotSchema } from "./artifact";
import { HurlPathSchema } from "./hurl";

// I/O for artifacts/create. The request carries no content — Core ASSEMBLES the
// Snapshot from stored memory/state (reproducible), so the client can't inject it.

export const ArtifactCreateRequestSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
});
export type ArtifactCreateRequest = z.infer<typeof ArtifactCreateRequestSchema>;

export const ArtifactCreateResponseSchema = z.object({
  artifactId: UuidSchema,
  artifactType: ArtifactTypeSchema,
  title: z.string(),
  contentJson: SoulSeedSnapshotSchema,
  hurl: HurlPathSchema,
});
export type ArtifactCreateResponse = z.infer<typeof ArtifactCreateResponseSchema>;
