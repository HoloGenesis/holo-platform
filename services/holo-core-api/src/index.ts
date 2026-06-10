// @holo/core-api — HOLO Core. The importable brain: thin route handlers (hosted
// in the product app for v1) delegate to these functions. When Core is extracted
// to a standalone service later, the same functions are served over HTTP with
// zero frontend edits.

export const HOLO_CORE_API_VERSION = "0.0.0" as const;
export type HoloCoreApiVersion = typeof HOLO_CORE_API_VERSION;

export { CoreError } from "./errors";
export type {
  CoreRepo,
  SessionRow,
  CreateSessionInput,
  InsertHurlInput,
} from "./repo";
export { createPgRepo, getRepo } from "./pgRepo";
export { startSession, getSession, resumeSession } from "./core/sessions";
export { writeEvent } from "./core/events";
export { upsertMemory, getContext } from "./core/memory";
export { createArtifact, createSoulSeedSnapshotV2, getArtifact } from "./core/artifacts";
export { composeSnapshotV2 } from "./core/artifacts/snapshotV2";
export { diffSnapshots } from "./core/artifacts/diff";
export { assembleReturnView } from "./core/artifacts/assembleReturn";
export { setEmail, mergeUser } from "./core/users";
export { sendHurlInvitation, emailMode, returnUrlFor } from "./core/notifications/email";
export type { HurlSender, SendHurlInvitationOptions } from "./core/notifications/email";
export { createCheckout, handleWebhook, getEntitlements, paymentsEnabled } from "./core/commerce";
export { getManifest } from "./core/manifests";
export { mintHurl, mintAndPersistHurl, resolveHurl } from "./core/hurl";
export { next, applyNext } from "./core/orchestration";
export type {
  OrchestrationNextArgs,
  OrchestrationPlan,
  ArtifactDraft,
} from "./core/orchestration";
export { runAgent } from "./core/agents/runAgent";
export { runCoheringV1 } from "./core/agents/recipes/coheringV1";
export { runProofV1 } from "./core/agents/recipes/proofV1";
export { COHERING_RECIPE, PROOF_RECIPE } from "./core/agents/registry";
export type { AgentOutput, RunAgentResult, RunAgentOptions } from "./core/agents/runAgent";
export { getAgent } from "./core/agents/registry";
export { createModelRouter, mockRouter } from "./core/agents/modelRouter";
export type { ModelRouter, GenerateInput } from "./core/agents/modelRouter";
