import { ProductManifestSchema } from "@holo/contracts";
import type { Holon, ProductManifest } from "@holo/contracts";

// The SoulSeed Compass manifest — chamber flow as DATA, not code.
// Content is drafted in docs/product-one-soulseed.md (S4a) and wired here (S4b).
// Validated against ProductManifestSchema at module load, so an invalid manifest
// fails fast on import rather than somewhere downstream.

const rootHolon: Holon = {
  id: "soulseed-root",
  type: "product",
  title: "SoulSeed Compass",
  identity: { productKey: "soulseed" },
  state: {},
  history: [],
  trajectory: {},
  relationships: [],
  children: [],
};

const manifest: ProductManifest = {
  productKey: "soulseed",
  version: "1.0.0",
  rootHolon,
  chambers: [
    {
      key: "threshold",
      title: "Threshold",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "trajectory", "artifact"],
      memoryWriteScopes: ["profile", "event"],
      next: "identity-seed",
      prompts: {
        intro: "You look like you're between worlds.",
        questions: ["What should I call you?"],
      },
    },
    {
      key: "identity-seed",
      title: "Identity Seed",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative"],
      memoryWriteScopes: ["narrative", "state"],
      next: "present-state",
      prompts: {
        intro: "Pick the one that's closest, even if none of them is exactly right.",
        questions: [
          "I lost something.",
          "I'm building something.",
          "I'm becoming someone.",
          "I don't know yet.",
        ],
      },
    },
    {
      key: "present-state",
      title: "Present State",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state"],
      memoryWriteScopes: ["state", "narrative"],
      next: "memory-root",
      prompts: {
        intro: "What's alive right now?",
        questions: [], // agent fills based on arrival vector
      },
    },
    {
      key: "memory-root",
      title: "Memory Root",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state"],
      memoryWriteScopes: ["narrative"],
      next: "trajectory-branch",
      prompts: {
        intro: "What keeps coming back?",
        questions: [
          "What is the thing that keeps coming back to you — not the loudest, the most repeated?",
        ],
      },
    },
    {
      key: "trajectory-branch",
      title: "Trajectory Branch",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state", "trajectory"],
      memoryWriteScopes: ["trajectory"],
      next: "living-invitation",
      prompts: {
        intro: "Where's the becoming pointing?",
        questions: [
          "If this next year went better than you expect, what would be different — not in what you have, but in who you've become?",
        ],
      },
      // Base layer is always shown; the deeper layer is entitlement-gated.
      addOns: [{ entitlementKey: "astro-addon", slot: "deeperTrajectoryLayer" }],
    },
    {
      key: "living-invitation",
      title: "Living Invitation",
      agentKey: "coach",
      memoryReadScopes: ["profile", "narrative", "state", "trajectory", "event"],
      memoryWriteScopes: ["narrative", "artifact"],
      next: null,
      prompts: {
        intro: "Here's what I'm seeing.",
        questions: [], // COACH generates the Snapshot, then asks for email
      },
    },
  ],
};

/** The validated SoulSeed Compass product manifest. */
export const soulseedCompassManifest: ProductManifest = ProductManifestSchema.parse(manifest);
