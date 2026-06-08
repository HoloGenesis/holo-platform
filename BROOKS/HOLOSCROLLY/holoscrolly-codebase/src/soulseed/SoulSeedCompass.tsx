import { useState } from "react";
import { Compass, Sprout } from "lucide-react";
import type { Hurl } from "../types/hdom";
import { SOULSEED_BRANCHES, SOULSEED_QUESTION, type SoulSeedBranch } from "./branches";
import { bumpRevision } from "../utils/hurl";

interface SoulSeedCompassProps {
  hurl: Hurl;
  /** Called with the branch-tuned, revision-bumped HURL when the user commits. */
  onSeed: (next: Hurl, trunkSignal: string, branch: SoulSeedBranch) => void;
}

/**
 * SoulSeed Compass — the first orientation layer. The trunk signal is named,
 * then grown into one of three branches. Committing mints a new HURL revision:
 * the address-of-becoming literally advances.
 */
export function SoulSeedCompass({ hurl, onSeed }: SoulSeedCompassProps) {
  const [trunk, setTrunk] = useState("");
  const [chosen, setChosen] = useState<SoulSeedBranch | null>(null);
  const [seeded, setSeeded] = useState(false);

  const canSeed = trunk.trim().length > 0 && chosen !== null;

  const commit = () => {
    if (!canSeed || !chosen) return;
    const next = bumpRevision({ ...hurl, branch: chosen.branchSlug });
    onSeed(next, trunk.trim(), chosen);
    setSeeded(true);
  };

  return (
    <section className="soulseed" aria-label="SoulSeed Compass">
      <div className="soulseed__card">
        <div className="eyebrow"><Compass size={16} /> SOULSEED COMPASS • TRUNK SIGNAL</div>
        <h2>{SOULSEED_QUESTION}</h2>

        <textarea
          className="soulseed__trunk"
          value={trunk}
          onChange={(e) => setTrunk(e.target.value)}
          rows={2}
          placeholder="Say the true thing — the one underneath the plan…"
          aria-label={SOULSEED_QUESTION}
          disabled={seeded}
        />

        <div className="soulseed__branches" role="radiogroup" aria-label="Choose a branch">
          {SOULSEED_BRANCHES.map((branch) => (
            <button
              key={branch.id}
              type="button"
              role="radio"
              aria-checked={chosen?.id === branch.id}
              className={`soulseed__branch${chosen?.id === branch.id ? " is-chosen" : ""}`}
              onClick={() => !seeded && setChosen(branch)}
              disabled={seeded}
            >
              <span className="soulseed__branch-title">{branch.title}</span>
              <span className="soulseed__branch-invite">{branch.invitation}</span>
            </button>
          ))}
        </div>

        {seeded && chosen ? (
          <p className="soulseed__ack">
            <Sprout size={16} /> Seeded into <strong>{chosen.title}</strong>. HURL advanced to revision {hurl.revision + 1}.
          </p>
        ) : (
          <button type="button" className="soulseed__commit" onClick={commit} disabled={!canSeed}>
            Mint my HURL
          </button>
        )}
      </div>
    </section>
  );
}
