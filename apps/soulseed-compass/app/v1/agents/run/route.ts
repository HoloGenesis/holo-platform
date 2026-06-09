import { NextResponse } from "next/server";
import { AgentRunRequestSchema, CoheringInputSchema } from "@holo/contracts";
import { CoreError, getRepo, runAgent, runCoheringV1 } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
// Two recipes share this endpoint (no new route per Engineering Addendum §3):
//  - agentKey "cohering" → cohering-v1 (one answer → recognition + 6 vectors)
//  - everything else      → the manifest-driven persona flow (runAgent)
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  // authorize: anonymous-first — no per-session auth in v1.

  // --- cohering-v1 branch ---------------------------------------------------
  if (typeof body === "object" && body !== null && (body as { agentKey?: unknown }).agentKey === "cohering") {
    const parsed = CoheringInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", issues: parsed.error.issues },
        { status: 400 }
      );
    }
    try {
      const output = await runCoheringV1(getRepo(), parsed.data);
      return NextResponse.json(output);
    } catch (err) {
      if (err instanceof CoreError) {
        return NextResponse.json({ error: err.code }, { status: err.status });
      }
      throw err;
    }
  }

  // --- persona flow ---------------------------------------------------------
  const parsed = AgentRunRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const result = await runAgent(getRepo(), parsed.data);
    return NextResponse.json(result.output, {
      headers: {
        "x-holo-agent-model": result.model,
        "x-holo-agent-fallback": String(result.usedFallback),
      },
    });
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
