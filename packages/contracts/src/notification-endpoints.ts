import { z } from "zod";
import { UuidSchema } from "./primitives";
import { HurlPathSchema } from "./hurl";

// I/O contract for the HURL-invitation email (S60). The send is triggered
// internally by users.setEmail; this schema types the core function boundary
// (and a future notifications route, if one is added).

export const SendHurlInvitationRequestSchema = z.object({
  userId: UuidSchema,
  email: z.string().email(),
  hurlPath: HurlPathSchema,
  snapshotSummary: z.string().optional(),
});
export type SendHurlInvitationRequest = z.infer<typeof SendHurlInvitationRequestSchema>;

export const SendHurlInvitationResponseSchema = z.object({
  ok: z.boolean(),
  mode: z.enum(["mock", "live", "skipped"]),
  providerMessageId: z.string().optional(),
});
export type SendHurlInvitationResponse = z.infer<typeof SendHurlInvitationResponseSchema>;
