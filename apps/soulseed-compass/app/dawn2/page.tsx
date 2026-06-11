"use client";

import Image from "next/image";
import { useState } from "react";
import { BRAND_ASSETS } from "../../lib/brand";
import { MorphogenicMembrane } from "../../components/dawn-glass/v2/MorphogenicMembrane";
import type { HologListenState } from "../../components/dawn-glass/v2/hologListen";

// Dawn Glass v0.2 SENTINEL (S90; membrane added S91) — developer preview,
// never linked from any production page; S102 deletes it at cutover.
// (Folder is `dawn2`, not `_dawn2`: underscore-prefixed folders are PRIVATE
// in the Next App Router and don't route.)

const SWATCHES: { name: string; varName: string; hex: string }[] = [
  { name: "Nacre", varName: "--nacre", hex: "#F7F7F0" },
  { name: "Ink", varName: "--ink", hex: "#0E1A2B" },
  { name: "Gold", varName: "--gold", hex: "#D4A017" },
  { name: "Pearl White", varName: "--pearl-white", hex: "rgba(255,255,255,0.85)" },
  { name: "Opal Blue", varName: "--dawn2-opal-blue-demo", hex: "#E6F1FF" },
  { name: "Sun Honey", varName: "--dawn2-sun-honey-demo", hex: "#FFC78A" },
  { name: "Seed Umber", varName: "--dawn2-seed-umber-demo", hex: "#8A5C3B" },
  { name: "Ink Navy", varName: "--ink", hex: "#0E1A2B" },
];

const STATES: HologListenState[] = ["THINKING", "COHERING", "LOCKED"];

/** Dev-only HOLOGLISTEN switcher — mirrors the reference HTML's .controls. */
function HologListenControls({
  state,
  onChange,
}: {
  state: HologListenState;
  onChange: (s: HologListenState) => void;
}) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 30,
        right: 30,
        zIndex: 100,
        display: "flex",
        gap: 10,
      }}
    >
      {STATES.map((s) => {
        const active = s === state;
        return (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className="ss2-mono"
            style={{
              background: active ? "var(--gold)" : "white",
              color: active ? "white" : "var(--ink)",
              border: active ? "1px solid var(--gold)" : "1px solid rgba(0,0,0,0.1)",
              padding: "10px 20px",
              borderRadius: 20,
              fontSize: "0.7rem",
              cursor: "pointer",
              transition: "0.3s",
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
}

export default function Dawn2Sentinel() {
  const [hologState, setHologState] = useState<HologListenState>("LOCKED");

  return (
    <main
      style={{
        background: "var(--nacre)", // fallback color if the membrane fails
        color: "var(--ink)",
        minHeight: "100svh",
        padding: "64px 32px",
        // demo-only vars for the extended-palette chips (the canonical homes
        // are dawn2Tokens + the Tailwind `dawn` namespace)
        ["--dawn2-opal-blue-demo" as never]: "#E6F1FF",
        ["--dawn2-sun-honey-demo" as never]: "#FFC78A",
        ["--dawn2-seed-umber-demo" as never]: "#8A5C3B",
      }}
    >
      {/* TIER 3 — the membrane breathes behind everything (S91) */}
      <MorphogenicMembrane state={hologState} />
      <HologListenControls state={hologState} onChange={setHologState} />

      <div
        style={{
          position: "relative",
          zIndex: 1,
          maxWidth: 960,
          margin: "0 auto",
          display: "grid",
          gap: 48,
        }}
      >
        {/* (a) Typography panel */}
        <section>
          <p className="ss2-mono" style={{ fontSize: 12, opacity: 0.5 }}>
            [ HOLOGLISTEN_STATUS: {hologState} ]
          </p>
          <h1 className="big-epic-headline gold-metallic-simple" style={{ fontSize: 80, margin: "16px 0 0" }}>
            SOULSEED
          </h1>
          <h2 className="ss-h" style={{ fontSize: 40, margin: "20px 0 0" }}>
            Refracts like opal.
          </h2>
          <p className="ss-body" style={{ maxWidth: 560, marginTop: 16, lineHeight: 1.7 }}>
            Dawn Glass is milky blue-white opal glass with prismatic edge refraction, soft inner
            glow, and golden-hour light. It breathes with warmth, clarity, and humanity.
          </p>
          <p className="ss-accent" style={{ fontSize: 28, marginTop: 12 }}>
            becoming
          </p>
          <p className="gold-metallic big-epic-headline" style={{ fontSize: 34, marginTop: 24 }}>
            Brighten like morning, refract like opal.
          </p>
        </section>

        {/* (b) Color swatches — chips read the CSS variables, not hex literals */}
        <section>
          <h2 className="ss-h" style={{ fontSize: 24 }}>Palette</h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 16 }}>
            {SWATCHES.map((s) => (
              <div key={s.name} style={{ width: 110 }}>
                <div
                  style={{
                    height: 64,
                    borderRadius: 12,
                    background: `var(${s.varName})`,
                    border: "1px solid rgba(14,26,43,0.15)",
                  }}
                />
                <p className="ss-body" style={{ fontSize: 12, marginTop: 6 }}>{s.name}</p>
                <p className="ss2-mono" style={{ fontSize: 10, opacity: 0.55 }}>{s.hex}</p>
              </div>
            ))}
          </div>
        </section>

        {/* (c) Brand assets */}
        <section>
          <h2 className="ss-h" style={{ fontSize: 24 }}>Brand</h2>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 24, marginTop: 16 }}>
            <Image src={BRAND_ASSETS.sigil} alt="SoulSeed sigil" width={160} height={160} style={{ borderRadius: 24 }} />
            <Image src={BRAND_ASSETS.logoLight} alt="SoulSeed Compass logo (light)" width={280} height={160} style={{ objectFit: "contain" }} />
            <Image src={BRAND_ASSETS.logoHero} alt="SoulSeed Compass logo (hero)" width={280} height={160} style={{ objectFit: "contain" }} />
          </div>
        </section>
      </div>
    </main>
  );
}
