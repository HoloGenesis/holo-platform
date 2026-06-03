/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Linting is run once for the whole repo via the root `pnpm -w lint`
  // (ESLint flat config). Skip Next's redundant build-time lint pass.
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Workspace packages ship TypeScript source; let Next transpile them.
  transpilePackages: [
    "@holo/contracts",
    "@holo/sdk",
    "@holo/hdom",
    "@holo/product-manifests",
    "@holo/agent-prompts",
    "@holo/ui",
    "@holo/core-api",
  ],
  // pg is a Node-only library; keep it external (required at runtime, not bundled).
  serverExternalPackages: ["pg"],
};

export default nextConfig;
