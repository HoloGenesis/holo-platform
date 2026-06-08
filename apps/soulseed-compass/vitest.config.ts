import { defineConfig } from "vitest/config";

// Lightweight component testing: esbuild handles the JSX (automatic runtime),
// and we render to a static string (renderToStaticMarkup) — no jsdom needed.
export default defineConfig({
  esbuild: { jsx: "automatic", jsxImportSource: "react" },
  test: {
    environment: "node",
    include: ["components/**/*.test.{ts,tsx}", "lib/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", ".turbo"],
  },
});
