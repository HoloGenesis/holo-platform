export type HoloBaguaDomain =
  | "mental"
  | "emotional"
  | "relational"
  | "spiritual"
  | "professional"
  | "financial"
  | "ecological"
  | "physical";

export type HdomNodeKind =
  | "root"
  | "chapter"
  | "scene"
  | "step"
  | "move"
  | "memory"
  | "diagnosis"
  | "invitation"
  | "return-event";

export type HdomState =
  | "latent"
  | "revealed"
  | "active"
  | "integrating"
  | "remembered"
  | "evolving";

export interface Hurl {
  protocol: "hurl";
  realm: string;
  chamber: string;
  stage: number;
  branch: string;
  coherence: number;
  revision: number;
}

export interface HdomTrajectory {
  from: string;
  through: string[];
  toward: string;
  nextBestStep: string;
}

export interface HdomMemory {
  createdAt: string;
  updatedAt: string;
  visits: number;
  lastReturnPrompt?: string;
  notes: string[];
}

export interface HdomNode {
  id: string;
  kind: HdomNodeKind;
  title: string;
  state: HdomState;
  domain?: HoloBaguaDomain;
  hurl?: Hurl;
  summary: string;
  history: string[];
  trajectory: HdomTrajectory;
  relationships: string[];
  children: HdomNode[];
  memory: HdomMemory;
}

export interface HdomDocument {
  id: string;
  title: string;
  canonicalQuestion: "Where am I in becoming?";
  root: HdomNode;
}
