export type MoveCategory =
  | "STRUCT"
  | "CAMERA"
  | "REVEAL"
  | "PIN"
  | "TRANS"
  | "MEDIA"
  | "DATA"
  | "INTERACT"
  | "GUIDE"
  | "ENGINE"
  | "AUTHOR"
  | "PERF"
  | "SYNC"
  | "TOPO"
  | "EDIT"
  | "HOLO";

export interface MoveParameters {
  threshold?: number;
  start?: number;
  end?: number;
  easing?: "linear" | "phi-in" | "phi-out" | "phi-in-out";
  reversible?: boolean;
  reducedMotionFallback: "cut" | "fade" | "still-frame" | "text-spine";
}

export interface ScrollyMove {
  id: string;
  category: MoveCategory;
  code: string;
  name: string;
  definition: string;
  narrativeUse: string;
  inputs: string[];
  outputs: string[];
  parameters: MoveParameters;
  compatibleWith: string[];
}
