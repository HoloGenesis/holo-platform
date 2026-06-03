import { NextResponse } from "next/server";
import { AgentRunRequestSchema } from "@holo/contracts";
import { CoreError, getRepo, runAgent } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
// Output is validated against the agent's schema inside runAgent (with retry +
// safe fallback), so the structured response is always well-formed.
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = AgentRunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    const result = await runAgent(getRepo(), parsed.data);
    return NextResponse.json(result.output, {
      headers: { "x-holo-agent-model": result.model, "x-holo-agent-fallback": String(result.usedFallback) },
    });
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
