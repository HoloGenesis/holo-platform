# Dawn Glass v0.2 — Design Spec (canonical material + typography + composition)

*Authored by Brooks Cole · Delivered 10 Jun 2026 (4 messages: typography canon, font fallback ruling, material physics HTML, composition canva).*

This document is the canonical Dawn Glass v0.2 specification. v0.1 (saved at `docs/dawn-glass-design-assets-v0.1.md`) was the working-title aesthetic that Sprint 10 built against — dark cosmic glass with honey accents. **v0.2 is the actual Dawn Glass: light, opal, sunrise — *"Brighten like morning, refract like opal."***

Brooks's framing: *"This looks like the day is ending. The new look will be like the day is beginning. Important psychological change."*

The implementation reference HTML — with full WebGL fragment shader + SVG filter + CSS backdrop-filter composition — is saved verbatim at `docs/dawn-glass-v0.2-material-physics.html`. That HTML is the source-of-truth for the Sprint 11 component ports.

---

## 1. The Material Law

Every surface is **milky blue-white opal glass** with:

- **Prismatic edge refraction** (structural iridescence — color emerges from phase, not pigment)
- **Soft inner glow** (volumetric luminance)
- **Golden-hour environmental light** (warmth around and through the surface)
- **Warm shadows** (umber depth)
- **Crisp specular highlights**

The 5-layer Glass Stratum (Body + Environment + Refraction + Glow + Shadow) composes into one continuous material reading.

Brooks's key insight: *"This is not Glassmorphism. It is Morphogenesis. A visual physics system where color emerges from phase relationships and geometry is grown, not engineered."*

---

## 2. The Three Tiers of Material Composition

Per the reference HTML, the material is rendered in three composed tiers:

### TIER 3 — The Membrane (WebGL fragment shader)

Background layer. Fragment shader does:

1. **Nested Domain Warping** with Simplex noise (`snoise()`) for biological morphology — color fields that flow like cell cytoplasm
2. **Nacreous Palette** — base `vec3(0.97, 0.97, 0.94)` (luminous white)
3. **Structural Iridescence** — `0.5 + 0.5*cos(6.28*(uv.xyx + vec3(0,2,4) + f))` — prismatic color from cosine phase, not from a palette gradient
4. **Volumetric Glisten / Caustics** — `pow(snoise(uv * 10.0 + r), 10.0)` driving honey-warm highlights

Z-index: 0 (fixed background). Opacity 0.7. Pointer-events: none.

### TIER 2 — Osmotic Refraction (SVG filter)

Middle layer. SVG `<filter>` with `feTurbulence` (fractal noise) → `feDisplacementMap` applied to the glass card stack. This is the **biological refraction** — the slight wobble of light through living glass.

```svg
<filter id="biologicalRefraction">
  <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" seed="5" result="noise">
      <animate attributeName="baseFrequency" values="0.015;0.018;0.015" dur="10s" repeatCount="indefinite" />
  </feTurbulence>
  <feDisplacementMap in="SourceGraphic" in2="noise" scale="8" xChannelSelector="R" yChannelSelector="G" />
</filter>
```

Applied via `filter: url(#biologicalRefraction)` on the `.osmotic-manifold` wrapper.

### TIER 1 — Pearlescent Glass Cards (CSS)

Surface layer. CSS backdrop-filter pearl card:

```css
.pearl-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px) saturate(180%) brightness(1.02);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50px;
  box-shadow:
    0 30px 90px rgba(84, 50, 24, 0.1),
    inset 0 1px 2px rgba(255, 255, 255, 0.9),
    inset 0 -1px 10px rgba(103, 220, 255, 0.1);
}
```

---

## 3. Color Palette

| Token | Value | Use |
|---|---|---|
| `--nacre` | `#F7F7F0` | Background body — luminous cream-white |
| `--ink` | `#0E1A2B` | Primary text (ink navy) |
| `--gold` | `#D4A017` | Brand gold (used in gradients) |
| `--pearl-white` | `rgba(255, 255, 255, 0.85)` | Card highlights, edges |
| `--glass-blur` | `40px` | Standard backdrop-filter blur |

Additional palette from v0.2 design system mockup:

| Token | Value | Use |
|---|---|---|
| Dawn White | `#FFFFFF` | Pure highlight |
| Opal Blue | `#E6F1FF` | Cool prismatic accent |
| Sky Mist | `#C9E3FF` | Background mist |
| Soft Lavender | `#D7C6FF` | Violet prismatic |
| Rose Blush | `#FFC1CC` | Rose prismatic |
| Sun Honey | `#FFC78A` | Honey prismatic |
| Seed Umber | `#8A5C3B` | Earth shadow accent |
| Ink Navy | `#0E1A2B` | Primary text (same as `--ink`) |

**The Material Law as token snapshot (from the system mockup):**

```css
--ss-opal-body:        rgba(225, 248, 255, 0.34);
--ss-prism-cyan:       rgba(87, 218, 255, 0.55);
--ss-prism-violet:     rgba(176, 120, 255, 0.42);
--ss-prism-rose:       rgba(255, 142, 196, 0.36);
--ss-prism-honey:      rgba(255, 190, 96, 0.58);
--ss-text-espresso:    #241a14;
--ss-glass-shadow-warm: rgba(84, 50, 24, 0.22);
```

---

## 4. Typography Canon

**Hierarchy:**

| Tier | Family | Style | Color |
|---|---|---|---|
| Big Epic Headlines | **CIZNEL Regular** (fallback Cinzel) | Regular, uppercase | Metallic gold gradient only |
| H1 / H2 | **Libre Baskerville** | Primary editorial voice | Ink |
| H3 / H4 / Body | **Montserrat** family | Clear, modern, readable | Ink |
| Accents | **Playfair Display Italic** | Italic | Metallic gold gradient only |
| Mono / system labels | Geist Mono | Status / topology indicators | Ink with low opacity |

### CIZNEL Font File Status (Q-W)

**Brooks's ruling 10 Jun:** *"CIZNEL Regular is the canon, but if the file isn't available, fall back to Cinzel and keep the design token name CIZNEL."*

The reference HTML uses `font-family: 'Cinzel', serif;` because the CIZNEL `.woff2` file isn't in the repo. **Two valid paths:**

1. Brooks provides `CIZNEL-Regular.woff2` → place in `apps/soulseed-compass/public/fonts/` → load via `@font-face`.
2. Use Cinzel via Google Fonts, name the token `--font-epic` with stack `"CIZNEL", "Cinzel", "Trajan Pro", "Cormorant Garamond", serif` so the token name carries the canon, the fallback carries the implementation.

**Forbidden fallbacks (Brooks's hard rule):** Never Times. Never browser default serif. Never bold Montserrat for epic titles. Never flat gold.

### Canonical font stack

```css
:root {
  --font-epic:   "CIZNEL", "Cinzel", "Trajan Pro", "Cormorant Garamond", serif;
  --font-h:      "Libre Baskerville", Georgia, serif;
  --font-body:   "Montserrat", Inter, system-ui, sans-serif;
  --font-accent: "Playfair Display", Georgia, serif;
  --font-mono:   "Geist Mono", ui-monospace, monospace;
}
```

### Canonical typography classes

```css
.big-epic-headline {
  font-family: var(--font-epic);
  font-weight: 400;
  text-transform: uppercase;
  letter-spacing: 0.015em;
  line-height: 0.9;
}

h1, h2 {
  font-family: var(--font-h);
  font-weight: 400;
  line-height: 1.08;
}

h3, h4, p, button, label, input, textarea, small, li {
  font-family: var(--font-body);
}

.accent-text {
  font-family: var(--font-accent);
  font-style: italic;
  font-weight: 500;
}
```

---

## 5. The Metallic Gold Gradient (non-negotiable)

Gold is never flat. Always a gradient with depth and luminance:

```css
.gold-metallic {
  color: transparent;
  background:
    linear-gradient(
      115deg,
      #6f4312 0%,
      #a96d16 16%,
      #f7d56a 32%,
      #fff4b8 45%,
      #c8891c 58%,
      #7a4a12 72%,
      #f4c65d 88%,
      #9b6115 100%
    );
  -webkit-background-clip: text;
  background-clip: text;
  text-shadow:
    0 1px 0 rgba(255, 255, 255, 0.35),
    0 2px 6px rgba(92, 52, 10, 0.22),
    0 12px 28px rgba(176, 111, 22, 0.24);
  filter: drop-shadow(0 1px 0 rgba(255, 246, 180, 0.25));
}
```

The reference HTML uses a simpler 5-stop version with a slow `goldSweep` animation (`background-size: 200% auto; animation: goldSweep 10s linear infinite`) — both are valid; the simpler version is good for animated epic headlines, the richer version is good for static accents.

---

## 6. HOLOGLISTEN States (system feedback as material)

The shader has three driven states. They map to UI affordances — the material itself signals what the system is doing.

| State | Shader speed | SVG displacement scale | When |
|---|---|---|---|
| `THINKING` | 0.2 | 8 | User is interacting / mid-turn / agent processing |
| `COHERING` | 0.05 | 15 | Snapshot is composing / recognition is forming |
| `LOCKED` | 0.01 | 2 | At rest / on landing / between turns |

The reference HTML wires these via small buttons (`.controls`) for testing. In production, the Sprint 11 implementation should drive them from the existing `sprint10Store` states (proof-running → THINKING; snapshot-composing → COHERING; idle → LOCKED).

---

## 7. Brand Pillars + Canonical Copy

From Brooks's design system board:

**Pillars (hero/promise band):**
- **REMEMBERED · RESPECTED · RECIPROCATED**

**Hero / Promise:**
- *"The living profile that teaches AI how to meet you."*

**Primary hero headline:**
- *"Brighten like morning, refract like opal."* (with "opal" in metallic gold + italic Playfair Display accent)

**Subhead:**
- *"The living design language for SoulSeed Compass."*

**Body voice:**
- *"Dawn Glass is milky blue-white opal glass with prismatic edge refraction, soft inner glow, and golden-hour light. It breathes with warmth, clarity, and humanity."*

**Hierarchy mantra (one-liner):**
- *"Hierarchy is read through refraction intensity. The more important the component, the more spectrum it carries."*

**Layer formula:**
- *"Golden-hour reality · Milky opal body · Prismatic edge light · HOLO whorl particles"*

**Visual Principles (4):**
- Human First (empathy leads, technology serves)
- Warmth & Clarity (light guides attention and emotion)
- Living Organic Geometry (shapes grow from nature and spirit)
- Depth on Demand (information reveals with intention)
- Yours to Evolve (a living system that grows with you)

---

## 8. Composition Rules (Brooks's "less window-on-window")

Brooks said: *"I also want to control the composition of the screens some more because there are so many windows on top of the backgrounds that you don't even see what's going on in the background."*

Sprint 10's `SoulSeedScreenShell` rendered a dark cinematic background, then put a full Dawn Glass card on top, occluding most of the background. **v0.2 corrects this:**

- The background (TIER 3 WebGL membrane) is meant to be FELT, not hidden.
- Glass cards (TIER 1) sit lightly on top with high backdrop-filter blur — the membrane shows through.
- Cards are NOT full-viewport. They occupy a centered, bounded region so the membrane breathes around them.
- Iridescent edge highlights are the cue that "there's a surface here." The card itself is mostly transparent.

The reference HTML demonstrates this: the `.pearl-card` is `rgba(255, 255, 255, 0.1)` background (90% transparent) with `backdrop-filter: blur(40px) saturate(180%) brightness(1.02)`. The card reads as glass *because* you can see the membrane through it.

---

## 9. Component Mapping (Sprint 11 ports)

Each existing Dawn Glass v0.1 component gets a v0.2 counterpart:

| v0.1 (Sprint 10) | v0.2 (Sprint 11) | Approach |
|---|---|---|
| `DawnGlass` (dark) | `PearlCard` | Drop in the TIER 1 CSS verbatim; the v0.1 honey-tinted edge becomes the prismatic iridescent edge from the spec |
| `IridescentButton` | `PrismButton` | Keep the iridescent edge but lighten ground; the reference HTML's `.prism-btn` is the target |
| `GhostButton` | (lighten) | White background instead of glass-light; same shape |
| `Whorl` | Keep | Whorl already breathes; recolor to opal/honey instead of pure gold |
| `SoulSeedScreenShell` | `MorphogenicShell` | New: mount the `<MembraneMembrane />` WebGL canvas + the `<BiologicalRefraction />` SVG filter once at the root |
| `HolotorusVisual` | `OrbContainer` | The reference HTML's `.orb-container` (radial gradient + golden inner ring) is the v0.2 cognition orb |

---

## 10. The Implementation Reference HTML

The complete working reference is at `docs/dawn-glass-v0.2-material-physics.html`. Open it in any modern browser (Chrome / Safari / Firefox — needs WebGL + CSS backdrop-filter) to feel what we're building toward.

It includes:
- The full fragment shader (Simplex noise, nested domain warping, iridescence, caustics)
- The SVG filter with animation
- The pearl card CSS
- The metallic gold Cinzel headline with sweep animation
- The HOLOGLISTEN state controls (THINKING / COHERING / LOCKED)
- A working cognition orb

**Sprint 11's job is to port this HTML into React components in our existing Next.js app while preserving the engine layer (cohering, snapshot V2, return loop, HURL, agent doctrine) unchanged.**

---

## 10B. Brand Assets (delivered 10 Jun PM)

Located at `BROOKS/HOLOSCROLLY/DAWN_GLASS_UI/`:

| File | What | Where it lives in app |
|---|---|---|
| `7C0D7603-B151-42C9-A517-49CC3912B999.jpg` | **Canonical sigil** — gold trefoil seed inside iridescent pearl disc (no wordmark). 1280×1280-ish. Used as the standalone brand mark / app favicon / cognition orb centerpiece. | `apps/soulseed-compass/public/brand/soulseed-sigil.jpg` (later `.png` or `.svg` if Brooks provides) |
| `SOULSEED COMPASS LOGO - 1.png.jpg` | Wordmark + sigil, white background. "SoulSeed" in metallic gold serif, "COMPASS" in lighter spaced caps. App-chrome variant. | `apps/soulseed-compass/public/brand/soulseed-compass-logo-light.jpg` |
| `SOULSEED COMPASS LOGO - 2.png.jpg` | Wordmark + sigil, **sunset/golden-hour background** — the canonical "golden hour reality" the spec keeps naming. Marketing / hero / share-card variant. | `apps/soulseed-compass/public/brand/soulseed-compass-logo-hero.jpg` |
| `SOULSEED COMPASS LOGO - 3.png.jpg` | Wordmark + sigil, white background. Functional duplicate of #1; keep one or the other. | (skip — duplicate of -1) |
| `signal-2026-06-11-135225.jpeg` | **Canonical PrismButton photo reference.** Iridescent pill with full prismatic gradient fill + lens-flare bleed. Photo, not exportable; reference only. | `BROOKS/HOLOSCROLLY/DAWN_GLASS_UI/` (reference) — *implementation* goes in `<PrismButton />` per §10C |
| `SOULSEED COMPASS DESIGN LANGUAGE.svg` | Canva canvas export — 54 MB, mostly embedded raster. Reference for composition only; not directly used in build. | (keep in BROOKS/ for reference) |

The sigil is the seed motif: **three golden leaves growing from a single stem inside an iridescent pearl bubble.** The pearl has rainbow refraction on the upper-right rim, warm honey bleed on the lower-left. This is what `<HolotorusVisual />` becomes — the central cognition orb on screens where one is rendered (Screen 4 Listening / Screen 7 Snapshot side panel / Screen 9 Completion).

---

## 10C. PrismButton — concrete spec from the photo reference

Sprint 10's `IridescentButton` was a quiet pastel hint of this. The actual canonical is much more material. From the photo:

```css
.prism-button {
  /* Pill geometry */
  border-radius: 999px;
  padding: 1.4rem 3.2rem;
  border: 1px solid rgba(255, 255, 255, 0.7);

  /* Prismatic fill (the key change vs Sprint 10) */
  background:
    /* outer warm bleed → cool bleed → warm bleed (left to right) */
    linear-gradient(
      90deg,
      rgba(123, 195, 255, 0.85) 0%,    /* cyan, full saturation at the left */
      rgba(176, 120, 255, 0.78) 25%,   /* violet */
      rgba(255, 142, 196, 0.75) 50%,   /* rose */
      rgba(255, 190, 96, 0.85) 100%    /* honey at the right */
    ),
    /* glass underlay */
    rgba(255, 255, 255, 0.18);

  /* Lens-flare / light-leak — soft pearl glow spilling outside the pill */
  box-shadow:
    /* inner highlight */
    inset 0 1px 2px rgba(255, 255, 255, 0.9),
    inset 0 -1px 8px rgba(255, 255, 255, 0.5),
    /* outer warm pearl bleed */
    0 0 60px 8px rgba(255, 190, 96, 0.35),
    0 0 100px 16px rgba(123, 195, 255, 0.18),
    0 24px 60px rgba(84, 50, 24, 0.18);

  /* Dark ink text — readable on the bright gradient */
  color: var(--ink);     /* #0E1A2B */
  font-family: var(--font-body);
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0.005em;

  /* Refraction artifact: button slightly distorts what's behind it */
  backdrop-filter: blur(8px) saturate(140%);
  -webkit-backdrop-filter: blur(8px) saturate(140%);
}

.prism-button:hover {
  transform: translateY(-1px) scale(1.02);
  box-shadow:
    inset 0 1px 2px rgba(255, 255, 255, 1),
    inset 0 -1px 8px rgba(255, 255, 255, 0.7),
    0 0 80px 12px rgba(255, 190, 96, 0.5),
    0 0 140px 20px rgba(123, 195, 255, 0.25),
    0 28px 70px rgba(84, 50, 24, 0.22);
}
```

Notes:

- The text is **ink (dark), not white** — the gradient is bright enough that white text would disappear.
- The `box-shadow` lens-flare layers do the "light leak" effect; they bleed outside the button's geometric pill shape.
- `backdrop-filter: blur(8px)` makes the button visibly refract its background (subtle but felt). It's a glass button, not a plastic chip.
- Sprint 10's `IridescentButton` ships an interpolated pastel; the photo is a **fully saturated prismatic CYV/RGB sweep** with translucent overlay. The visual jump from Sprint 10 → Sprint 11's PrismButton is large.

This component lives in `apps/soulseed-compass/components/dawn-glass/v2/PrismButton.tsx` and replaces every `IridescentButton` invocation across the 9+3 screens.

---

## 10D. Golden Hour Membrane (shader tuning from Logo 2 reference)

The sunset photo behind Logo 2 is the canonical mood. The existing fragment shader in `dawn-glass-v0.2-material-physics.html` is *close* but tunes need adjustment to match the photo:

**Current shader base:** `vec3(0.97, 0.97, 0.94)` (cool cream)
**Caustic tint:** `vec3(1.0, 0.9, 0.7)` (warm honey)

**Tune toward the photo:**

- Make the base color *position-dependent*: cool/blue near top-right of viewport, warm/pink near bottom-left. Add a UV-based mix in the fragment shader:
  ```glsl
  vec3 baseTopRight = vec3(0.92, 0.94, 1.00);  // cool morning blue
  vec3 baseBotLeft  = vec3(1.00, 0.92, 0.86);  // warm sunrise pink
  vec3 col = mix(baseBotLeft, baseTopRight, uv.x * 0.5 + uv.y * 0.5);
  ```
- Strengthen the caustics in the warm zone:
  ```glsl
  float warmZone = clamp(1.0 - (uv.x + uv.y) * 0.5, 0.0, 1.0);
  col += caust * vec3(1.0, 0.85, 0.55) * (0.35 + warmZone * 0.25);
  ```
- Cool the iridescence in the cool zone (keep the cosine phase but shift hue):
  ```glsl
  vec3 prism = 0.5 + 0.5*cos(6.28*(uv.xyx + vec3(0.0, 1.8, 4.2) + f));
  col = mix(col, prism, clamp(f*0.18, 0.0, 0.22));
  ```

Result: the membrane reads as **morning sky** (cool blue top-right) over **sunrise horizon** (warm pink-honey bottom-left) — exactly the Logo 2 photo's color story.

---

## 11. What This Does NOT Cover

- The PRD-HOLOSCROLLY v0.3 build spec (saved separately at `docs/prd-holoscrolly-v0.3-build-spec.md`). That document describes a canonical *HOLOSCROLLY pattern architecture* with file paths and packages that don't match our codebase. It's broader context. Sprint 11 applies the **visual / typography / copy** from v0.2 Dawn Glass; the v0.3 PRD's architecture (HURL grammar versioning, Pattern Intelligence, `@holo/sacred-geometry` packages) is a separate conversation requiring Brooks clarification.
- The composition examples Brooks said are coming ("I'm going to give you some very specific examples and coding approaches to compose each viewport"). Those should land soon; when they do, this doc gains a §12 with per-viewport composition rules.

---

*Brooks: "The system's job is to remember the thread and place it gently back in their hands."*
