import { Suspense, lazy, useEffect, useState } from "react";
import { BookOpen, Brain, Compass, Dna, HeartPulse, Shield, Sparkles } from "lucide-react";
import { holoscrollyCanon } from "../data/canon";
import { scrollyMoves } from "../data/moves";
import { hydrateCanon } from "../data/hydrate";
import { CANONICAL_ROOT_HURL } from "../utils/hurl";
import { useHurlRoute } from "../router/useHurlRoute";
import { useReturnMemory } from "../memory/useReturnMemory";
import { warnIfIncompatible } from "../moves/validate";
import { findHolon } from "../recursion/holonicRecursion";
import { ProgressSpine } from "./ProgressSpine";
import { StickyChapter } from "./StickyChapter";
import { MoveCard } from "./MoveCard";
import { HurlPanel } from "./HurlPanel";
import { HdomNodeView } from "./HdomNodeView";
import { ReturnEvent } from "./ReturnEvent";
import { SoulSeedCompass } from "../soulseed/SoulSeedCompass";
import { HolonicRecursion } from "../recursion/RecursionPanel";

// Code-split: three.js loads only when the HOLOTORUS chamber renders.
const HoloTorusScene = lazy(() => import("./HoloTorusScene"));

/** The canonical sticky-chamber composition this demo declares it uses. */
const CANONICAL_COMPOSITION = [
  "ENGINE_INTERSECTION_SUMMONING",
  "PIN_STICKY_GRAPHIC_STEP",
  "HOLO_SOULSEED_BLOOM",
  "HOLO_RETURN_EVENT",
  "PERF_REDUCED_MOTION_MIRROR"
];

/** The HOLOTORUS chamber composition (scroll-linked 3D). */
const TORUS_COMPOSITION = [
  "ENGINE_SCROLL_LINKED_TIMELINE",
  "SYNC_SCROLL_TO_3D_SCENE",
  "PERF_REDUCED_MOTION_MIRROR"
];

/** The holonic-recursion composition (nested HOLOSCROLLY + return). */
const RECURSION_COMPOSITION = ["TOPO_HOLONIC_RECURSION", "HOLO_RETURN_EVENT"];

export function HoloscrollyApp() {
  const { hurl, navigate } = useHurlRoute(holoscrollyCanon.root.hurl ?? CANONICAL_ROOT_HURL);

  // Route-driven hydration: the document reflects the active HURL's branch.
  const doc = hydrateCanon(holoscrollyCanon, hurl);
  const root = doc.root;

  const { memory, dispatch } = useReturnMemory();

  // HDOM memory write-back surface: reflections recorded back into the root node.
  const [hdomNotes, setHdomNotes] = useState<string[]>(root.memory.notes);

  // Move Compatibility Validator runs on mount; warns in dev console only.
  useEffect(() => {
    warnIfIncompatible(CANONICAL_COMPOSITION, "canonical-chamber");
    warnIfIncompatible(TORUS_COMPOSITION, "holotorus-chamber");
    warnIfIncompatible(RECURSION_COMPOSITION, "recursion-chamber");
  }, []);

  const activeChamber = root.children.find((c) => c.state === "active");
  const innerHolon = findHolon(root, "inner-orientation");

  return (
    <>
      <ProgressSpine />

      <header className="hero">
        <div className="hero__halo" />
        <div className="hero__content">
          <div className="eyebrow">HOLOSCROLLY CANON • HDOM DEMO</div>
          <h1>HOLOPEDIA of HOLOSCROLLY</h1>
          <p>
            A trajectory-aware holonic document organism where scroll becomes orientation,
            diagnosis, memory, return, and becoming.
          </p>
          <div className="hero__question">
            <Compass size={22} />
            <span>{holoscrollyCanon.canonicalQuestion}</span>
          </div>
          {activeChamber ? (
            <div className="hero__active" aria-live="polite">
              Active chamber via HURL branch <strong>{hurl.branch}</strong>: {activeChamber.title}
            </div>
          ) : null}
        </div>
      </header>

      <ReturnEvent
        memory={memory}
        onReflect={(text) => {
          dispatch({ type: "SET_ACTIVE_NODE", nodeId: root.id });
          dispatch({ type: "REFLECT", at: new Date().toISOString(), text });
          setHdomNotes((prev) => [...prev, `[return] ${text}`]);
        }}
      />

      <StickyChapter
        eyebrow="I • DISTINCTION"
        title="Not scrollytelling. Living orientation."
        body="Scrollytelling animates content. HOLOSCROLLY remembers, diagnoses, branches, returns, and evolves."
        steps={[
          { label: "PAGE", title: "Static Page", body: "The ordinary web asks: where is this content located?" },
          { label: "SCROLL", title: "Animated Scroll", body: "Scrollytelling asks: how can motion reveal the story?" },
          { label: "HDOM", title: "Holonic Document", body: "HDOM asks: what is each node becoming through identity, state, history, trajectory, relationships, and children?" },
          { label: "HURL", title: "Address of Becoming", body: "A HURL does not point to a static location. It points to a living chamber in a trajectory." }
        ]}
      />

      <StickyChapter
        eyebrow="II • ROOT PATTERN"
        title="Narrative Immunology"
        body="The ROOT pattern shows HOLOSCROLLY as an immune system for meaning."
        steps={[
          { label: "MEMBRANE", title: "Living Membrane", body: "The story breathes. It detects presence and foreshadows incoming narrative antigens." },
          { label: "LITERACY", title: "Self / Non-Self Gate", body: "Language fragments are dragged into the field and differentiated: mine, not mine, useful, toxic." },
          { label: "DOJO", title: "HOLOAIKIDO Dojo", body: "Attack is not mirrored as attack. It is detected, disarmed, reframed, and returned as coherence." },
          { label: "MEMORY", title: "Memory Lattice", body: "Every attack becomes memory. The system learns how to neutralize similar patterns later." },
          { label: "INVITE", title: "Visible Invitation", body: "The journey ends not in content consumption, but in a choice: converse, pilot, architect." }
        ]}
      />

      <section className="canon-grid-section">
        <div className="section-heading">
          <div className="eyebrow">III • HDOM TREE</div>
          <h2>The page as living forest</h2>
          <p>Every visible section is an HdomNode: self-aware, stateful, historical, relational, and trajectory-aware.</p>
        </div>
        <div className="canon-grid">
          {root.children.map((node) => (
            <HdomNodeView key={node.id} node={node} />
          ))}
        </div>
      </section>

      <Suspense fallback={<div className="torus-fallback">Summoning the HOLOTORUS…</div>}>
        <HoloTorusScene
          coherence={hurl.coherence}
          eyebrow="VI • HOLOTORUS"
          title="Scroll-to-3D scene sync"
          body="SYNC_SCROLL_TO_3D_SCENE: scroll progress drives camera travel, rotation, and coherence-tuned material. Reduced motion renders a calm still frame. The scene (and three.js) load lazily only when you reach this chamber."
        />
      </Suspense>

      <section className="becoming-section">
        <div className="becoming-card">
          <div className="icon-row">
            <Sparkles /><Dna /><HeartPulse /><Brain /><Shield /><BookOpen />
          </div>
          <div className="eyebrow">IV • PERSONAL DASHBOARD OF BECOMING</div>
          <h2>SoulSeed Compass → HURL → Identity Graph → HOLOBAGUA → Return Event</h2>
          <p>
            The canonical flow starts with orientation. The user arrives. REZZIE notices.
            The between-place opens. A SoulSeed emerges. A HURL is minted. Return creates evolution.
          </p>

          <SoulSeedCompass
            hurl={hurl}
            onSeed={(next, trunk, branch) => {
              navigate(next);
              dispatch({ type: "SET_ACTIVE_NODE", nodeId: "soulseed-compass" });
              setHdomNotes((prev) => [...prev, `[soulseed:${branch.id}] ${trunk}`]);
            }}
          />

          {innerHolon ? (
            <HolonicRecursion
              holon={innerHolon}
              parentHurl={hurl}
              onReturn={(event) => {
                dispatch({ type: "SET_ACTIVE_NODE", nodeId: event.childId });
                setHdomNotes((prev) => [
                  ...prev,
                  event.carried
                    ? `[recursion] returned from ${event.childId} carrying: ${event.carried}`
                    : `[recursion] returned from ${event.childId}`
                ]);
              }}
            />
          ) : null}

          <HurlPanel hurl={hurl} />

          {hdomNotes.length > root.memory.notes.length ? (
            <div className="hdom-memory" aria-label="HDOM memory">
              <div className="eyebrow">HDOM MEMORY • WRITTEN BACK</div>
              <ul>
                {hdomNotes.slice(root.memory.notes.length).map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </section>

      <section className="moves-section">
        <div className="section-heading">
          <div className="eyebrow">V • MOVE REGISTRY</div>
          <h2>Composable scroll grammar</h2>
          <p>
            These are the first engine-ready primitives. Every future HOLOSCROLLY can declare
            which moves it uses, how they compose, and what reduced-motion path preserves the essence.
          </p>
        </div>
        <div className="move-grid">
          {scrollyMoves.map((move) => (
            <MoveCard key={move.id} move={move} />
          ))}
        </div>
      </section>

      <footer className="footer">
        <div className="eyebrow">CARRY-FORWARD</div>
        <h2>A HOLOSCROLLY is a relationship container.</h2>
        <p>
          Not a landing page. Not a dashboard. Not a static story. A living chamber where
          identity, memory, trajectory, and invitation unfold in one coherent HURL.
        </p>
      </footer>
    </>
  );
}
