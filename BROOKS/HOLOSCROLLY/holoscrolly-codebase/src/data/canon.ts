import type { HdomDocument } from "../types/hdom";
import { createHurl } from "../utils/hurl";

const now = new Date().toISOString();

export const holoscrollyCanon: HdomDocument = {
  id: "holopedia-of-holoscrolly",
  title: "HOLOPEDIA of HOLOSCROLLY",
  canonicalQuestion: "Where am I in becoming?",
  root: {
    id: "root-holoscrolly",
    kind: "root",
    title: "HOLOSCROLLY: The Personal Dashboard of Becoming",
    state: "active",
    domain: "spiritual",
    hurl: createHurl({
      realm: "holopedia",
      chamber: "scrollytelling-to-holoscrolly",
      stage: 1.0,
      branch: "canon",
      coherence: 91,
      revision: 1
    }),
    summary:
      "A trajectory-aware holonic document organism that uses scroll, interaction, memory, and return events to orient a person, brand, community, or field inside its own becoming.",
    history: [
      "Scrollytelling move-set established.",
      "Canonical ROOT, HDOM, and Personal Dashboard references integrated.",
      "HOLOSCROLLY distinguished from ordinary animated scroll."
    ],
    trajectory: {
      from: "static page / animated scroll",
      through: ["HDOM", "HURL", "SoulSeed Compass", "Living Identity Graph", "Return Event"],
      toward: "living relationship container",
      nextBestStep: "Prototype HDOM-driven chambers with canonical move codes."
    },
    relationships: ["narrative-immunology", "hdom", "soulseed-compass"],
    memory: {
      createdAt: now,
      updatedAt: now,
      visits: 1,
      lastReturnPrompt: "What changed since the last time you arrived here?",
      notes: ["Not a dashboard. Not a landing page. A living orientation layer."]
    },
    children: [
      {
        id: "narrative-immunology",
        kind: "chapter",
        title: "Narrative Immunology",
        state: "revealed",
        domain: "mental",
        summary:
          "HOLOAIKIDO applied to meaning-threats: Living Membrane, attack vectors, self/non-self literacy, immune stack, dojo, memory lattice, allies, diagnosis, invitation.",
        history: ["Derived from ROOT client-specific flow diagrams."],
        trajectory: {
          from: "attack and confusion",
          through: ["detect", "disarm", "reframe", "remember", "diagnose"],
          toward: "coherence increase",
          nextBestStep: "Map each attack vector to a HOLOAIKIDO move."
        },
        relationships: ["root-holoscrolly", "memory-lattice", "visible-invitation"],
        memory: { createdAt: now, updatedAt: now, visits: 1, notes: [] },
        children: []
      },
      {
        id: "hdom",
        kind: "chapter",
        title: "HDOM: Holonic Document Object Model",
        state: "revealed",
        domain: "professional",
        summary:
          "The page is a living forest of holons. Each node has identity, state, history, trajectory, relationships, children, and memory.",
        history: ["Derived from HDOM v0.1 canonical infographic."],
        trajectory: {
          from: "DOM snapshot",
          through: ["state", "history", "trajectory", "relationships", "children"],
          toward: "living document organism",
          nextBestStep: "Represent every visible section as an HdomNode."
        },
        relationships: ["root-holoscrolly", "hurl-grammar"],
        memory: { createdAt: now, updatedAt: now, visits: 1, notes: [] },
        children: []
      },
      {
        id: "soulseed-compass",
        kind: "chapter",
        title: "SoulSeed Compass",
        state: "revealed",
        domain: "emotional",
        summary:
          "The first orientation layer. The user arrives, REZZIE notices, the between-place opens, SoulSeed emerges, and a HURL is minted.",
        history: ["Derived from Personal Dashboard of Becoming canonical infographic."],
        trajectory: {
          from: "arrival",
          through: ["orientation", "reflection", "HURL issue", "identity graph", "HOLOBAGUA map"],
          toward: "return and becoming",
          nextBestStep: "Ask: What is trying to emerge through you right now?"
        },
        relationships: ["root-holoscrolly", "return-event"],
        memory: { createdAt: now, updatedAt: now, visits: 1, notes: [] },
        children: [
          {
            id: "inner-orientation",
            kind: "scene",
            title: "Inner Orientation (nested HOLOSCROLLY)",
            state: "latent",
            domain: "emotional",
            summary:
              "A smaller complete HOLOSCROLLY. Enter, traverse three inner steps, and return to the parent timeline carrying one true step.",
            history: ["Spawned by TOPO_HOLONIC_RECURSION from the SoulSeed Compass."],
            trajectory: {
              from: "surface arrival",
              through: ["notice", "name", "choose"],
              toward: "return with coherence",
              nextBestStep: "Enter the chamber and traverse."
            },
            relationships: ["soulseed-compass"],
            memory: { createdAt: now, updatedAt: now, visits: 0, notes: [] },
            children: [
              {
                id: "inner-notice",
                kind: "step",
                title: "Notice",
                state: "latent",
                domain: "mental",
                summary: "What has your attention right now, beneath the task?",
                history: [],
                trajectory: { from: "distraction", through: ["pause"], toward: "presence", nextBestStep: "Name it." },
                relationships: ["inner-orientation"],
                memory: { createdAt: now, updatedAt: now, visits: 0, notes: [] },
                children: []
              },
              {
                id: "inner-name",
                kind: "step",
                title: "Name",
                state: "latent",
                domain: "emotional",
                summary: "Give the felt sense a single word.",
                history: [],
                trajectory: { from: "vagueness", through: ["language"], toward: "clarity", nextBestStep: "Choose a direction." },
                relationships: ["inner-orientation"],
                memory: { createdAt: now, updatedAt: now, visits: 0, notes: [] },
                children: []
              },
              {
                id: "inner-choose",
                kind: "step",
                title: "Choose",
                state: "latent",
                domain: "spiritual",
                summary: "Pick the next true step and carry it back up.",
                history: [],
                trajectory: { from: "clarity", through: ["commitment"], toward: "return", nextBestStep: "Return to parent." },
                relationships: ["inner-orientation"],
                memory: { createdAt: now, updatedAt: now, visits: 0, notes: [] },
                children: []
              }
            ]
          }
        ]
      }
    ]
  }
};
