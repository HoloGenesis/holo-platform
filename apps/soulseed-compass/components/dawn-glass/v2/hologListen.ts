// HOLOGLISTEN states (spec §6) — system feedback as material. The membrane's
// breath rate + S92's SVG displacement scale both key off this one contract.
export type HologListenState = "THINKING" | "COHERING" | "LOCKED";

export const HOLOGLISTEN_CONFIG: Record<
  HologListenState,
  { shaderSpeed: number; svgRipple: number }
> = {
  THINKING: { shaderSpeed: 0.2, svgRipple: 8 }, // active interaction
  COHERING: { shaderSpeed: 0.05, svgRipple: 15 }, // snapshot composing, recognition forming
  LOCKED: { shaderSpeed: 0.01, svgRipple: 2 }, // at rest, between turns
} as const;

export const DEFAULT_HOLOGLISTEN_STATE: HologListenState = "LOCKED";
