// Brand asset index (S90) — the single import surface for the brand mark.
// No string-paths scattered across components. If Brooks delivers .png/.svg
// versions, drop them in public/brand/ and update here; nothing else changes.
export const BRAND_ASSETS = {
  /** Canonical sigil — gold trefoil seed inside an iridescent pearl disc. */
  sigil: "/brand/soulseed-sigil.jpg",
  /** Wordmark + sigil on white — app-chrome variant. */
  logoLight: "/brand/soulseed-compass-logo-light.jpg",
  /** Wordmark + sigil on golden-hour sunset — marketing / hero / share-card. */
  logoHero: "/brand/soulseed-compass-logo-hero.jpg",
} as const;
