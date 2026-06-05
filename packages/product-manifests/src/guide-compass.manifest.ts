import { ProductManifestSchema } from "@holo/contracts";
import type { ProductManifest } from "@holo/contracts";
import { soulseedCompassManifest } from "./soulseed-compass.manifest";

// A persona-less "Guide" skin — the SEAM TEST. Same engine, same chamber
// structure, a DIFFERENT conductor (no REZZIE), declared entirely here as data.
// If this runs end-to-end with zero engine code, the Core is truly skinnable.

const manifest: ProductManifest = {
  productKey: "guide",
  name: "SoulSeed Compass (neutral)",
  version: "1.0.0",
  theme: "gold-void",
  rootHolon: {
    ...soulseedCompassManifest.rootHolon,
    id: "guide-root",
    title: "SoulSeed Compass (neutral)",
    identity: { productKey: "guide" },
  },
  agents: {
    guide: {
      role: "Neutral conductor",
      systemPrompt:
        "You are a calm, neutral guide. One observation, one question. No persona, no flourish. Return only the structured JSON.",
      output: "agent",
      readScopes: ["profile", "state", "narrative", "trajectory"],
    },
    synthesizer: {
      role: "Neutral synthesis",
      systemPrompt:
        "Gather what was noticed and hand it back as a small, grounded map. Return only the structured JSON.",
      output: "synthesis",
      readScopes: ["profile", "narrative", "state", "trajectory", "event"],
    },
  },
  // Reuse SoulSeed's chamber flow, swapping only the conductor (data, not code).
  chambers: soulseedCompassManifest.chambers.map((chamber) => ({
    ...chamber,
    agentKey: chamber.agentKey === "coach" ? "synthesizer" : "guide",
  })),
};

export const guideCompassManifest: ProductManifest = ProductManifestSchema.parse(manifest);
