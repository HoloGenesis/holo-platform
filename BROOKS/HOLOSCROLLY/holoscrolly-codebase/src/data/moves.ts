import type { ScrollyMove } from "../types/moves";

export const scrollyMoves: ScrollyMove[] = [
  {
    id: "ENGINE_INTERSECTION_SUMMONING",
    category: "ENGINE",
    code: "INTERSECTION_SUMMONING",
    name: "Intersection Summoning",
    definition: "A viewport intersection threshold summons a holon into active state.",
    narrativeUse: "Discrete chapter activation, low-jank ritual thresholds, memory-safe step changes.",
    inputs: ["viewport", "threshold", "nodeId"],
    outputs: ["activeNode", "stateTransition"],
    parameters: { threshold: 0.55, easing: "phi-out", reversible: true, reducedMotionFallback: "cut" },
    compatibleWith: ["PIN_STICKY_GRAPHIC_STEP", "HOLO_SOULSEED_BLOOM", "GUIDE_PROGRESS_SPINE"]
  },
  {
    id: "ENGINE_SCROLL_LINKED_TIMELINE",
    category: "ENGINE",
    code: "SCROLL_LINKED_TIMELINE",
    name: "Scroll-Linked Timeline",
    definition: "Continuous scroll progress maps to animation frames, camera positions, or field parameters.",
    narrativeUse: "Cinematic scrubbing, HOLOTORUS camera travel, shader and coherence modulation.",
    inputs: ["scrollProgress", "range"],
    outputs: ["timelineProgress"],
    parameters: { start: 0, end: 1, easing: "phi-in-out", reversible: true, reducedMotionFallback: "still-frame" },
    compatibleWith: ["SYNC_SCROLL_TO_3D_SCENE", "MEDIA_SCROLL_SCRUBBED_VIDEO"]
  },
  {
    id: "PIN_STICKY_GRAPHIC_STEP",
    category: "PIN",
    code: "STICKY_GRAPHIC_STEP",
    name: "Sticky Graphic / Step Pattern",
    definition: "A pinned visual altar updates as scrolling text steps cross thresholds.",
    narrativeUse: "The canonical editorial atom and the base HOLOSCROLLY chamber pattern.",
    inputs: ["steps", "visualState"],
    outputs: ["pinnedVisualUpdate"],
    parameters: { threshold: 0.6, easing: "phi-out", reversible: true, reducedMotionFallback: "fade" },
    compatibleWith: ["ENGINE_INTERSECTION_SUMMONING", "REVEAL_LAYER_PEEL"]
  },
  {
    id: "REVEAL_LAYER_PEEL",
    category: "REVEAL",
    code: "LAYER_PEEL",
    name: "Layer Peel",
    definition: "Scroll reveals surface, structure, skeleton, field lines, and memory in ordered layers.",
    narrativeUse: "Exegesis, diagnosis, sacred geometry, technical architecture, and inner-holon reveal.",
    inputs: ["layerStack", "scrollStep"],
    outputs: ["visibleLayers"],
    parameters: { threshold: 0.5, easing: "phi-out", reversible: true, reducedMotionFallback: "text-spine" },
    compatibleWith: ["AUTHOR_CLOSEREAD_GLYPH", "DATA_NARRATED_CHART_BUILD"]
  },
  {
    id: "AUTHOR_CLOSEREAD_GLYPH",
    category: "AUTHOR",
    code: "CLOSEREAD_GLYPH",
    name: "Close-Read Glyph",
    definition: "Scroll highlights and annotates a text, image, symbol, diagram, or sacred geometry object.",
    narrativeUse: "Gene Keys style exegesis, HOLOBAGUA explanation, HURL grammar, and symbolic teaching.",
    inputs: ["artifact", "annotations"],
    outputs: ["activeAnnotation"],
    parameters: { threshold: 0.55, easing: "phi-out", reversible: true, reducedMotionFallback: "text-spine" },
    compatibleWith: ["REVEAL_LAYER_PEEL", "PIN_STICKY_GRAPHIC_STEP"]
  },
  {
    id: "SYNC_SCROLL_TO_3D_SCENE",
    category: "SYNC",
    code: "SCROLL_TO_3D_SCENE",
    name: "Scroll to 3D Scene",
    definition: "Scroll drives scene graph state: camera, lights, materials, object transforms, and labels.",
    narrativeUse: "HOLOTORUS, SoulSeed Compass, morphic maps, and living identity graph navigation.",
    inputs: ["scrollProgress", "sceneGraph"],
    outputs: ["cameraState", "materialState"],
    parameters: { start: 0, end: 1, easing: "phi-in-out", reversible: true, reducedMotionFallback: "still-frame" },
    compatibleWith: ["ENGINE_SCROLL_LINKED_TIMELINE", "HOLO_SOULSEED_BLOOM"]
  },
  {
    id: "PERF_REDUCED_MOTION_MIRROR",
    category: "PERF",
    code: "REDUCED_MOTION_MIRROR",
    name: "Reduced Motion Mirror",
    definition: "The full saga is available as a calm still-frame and caption path.",
    narrativeUse: "Accessibility, polyvagal safety, reader sovereignty, and contemplative stillness.",
    inputs: ["motionPreference", "sceneSummary"],
    outputs: ["stillnessPath"],
    parameters: { threshold: 1, easing: "linear", reversible: true, reducedMotionFallback: "still-frame" },
    compatibleWith: ["ALL"]
  },
  {
    id: "TOPO_HOLONIC_RECURSION",
    category: "TOPO",
    code: "HOLONIC_RECURSION",
    name: "Holonic Recursion",
    definition: "A step opens a smaller complete HOLOSCROLLY that returns to the parent timeline.",
    narrativeUse: "Nested journeys, product pathways, identity branches, and chambered learning.",
    inputs: ["parentHurl", "childHdom"],
    outputs: ["returnEvent", "parentStateUpdate"],
    parameters: { threshold: 0.65, easing: "phi-in-out", reversible: false, reducedMotionFallback: "text-spine" },
    compatibleWith: ["HOLO_RETURN_EVENT", "HOLO_SOULSEED_BLOOM"]
  },
  {
    id: "HOLO_SOULSEED_BLOOM",
    category: "HOLO",
    code: "SOULSEED_BLOOM",
    name: "SoulSeed Bloom",
    definition: "A central glyph blooms into identity branches, coherence fields, and product pathways.",
    narrativeUse: "First orientation layer, onboarding, personal dashboard of becoming, and brand emergence.",
    inputs: ["soulseed", "identityGraph", "holoBaguaScores"],
    outputs: ["visibleTrajectory", "branchOptions"],
    parameters: { threshold: 0.55, easing: "phi-out", reversible: true, reducedMotionFallback: "still-frame" },
    compatibleWith: ["SYNC_SCROLL_TO_3D_SCENE", "GUIDE_PROGRESS_SPINE"]
  },
  {
    id: "HOLO_RESONANCE_LOCK_IN",
    category: "HOLO",
    code: "RESONANCE_LOCK_IN",
    name: "Resonance Lock-In",
    definition: "Dwell time and return behavior subtly tune copy, visuals, and coherence prompts.",
    narrativeUse: "Attunement, ritual pacing, anti-skim design, and living relationship continuity.",
    inputs: ["dwellTime", "returnCount", "activeNode"],
    outputs: ["coherencePrompt", "stateTuning"],
    parameters: { threshold: 0.7, easing: "phi-in", reversible: false, reducedMotionFallback: "text-spine" },
    compatibleWith: ["HOLO_RETURN_EVENT", "ENGINE_INTERSECTION_SUMMONING"]
  },
  {
    id: "HOLO_RETURN_EVENT",
    category: "HOLO",
    code: "RETURN_EVENT",
    name: "Return Event",
    definition: "A repeat visit compares prior state to current signal and updates the HURL trajectory.",
    narrativeUse: "The moment a static page becomes a living relationship container.",
    inputs: ["priorMemory", "currentResponse", "hurl"],
    outputs: ["stateDiff", "updatedHurl", "nextPrompt"],
    parameters: { threshold: 1, easing: "phi-out", reversible: false, reducedMotionFallback: "text-spine" },
    compatibleWith: ["TOPO_HOLONIC_RECURSION", "HOLO_RESONANCE_LOCK_IN"]
  }
];

export function getMove(id: string): ScrollyMove | undefined {
  return scrollyMoves.find((move) => move.id === id);
}
