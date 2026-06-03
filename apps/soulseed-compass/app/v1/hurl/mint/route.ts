import { NextResponse } from "next/server";
import { HurlMintRequestSchema, HurlMintResponseSchema } from "@holo/contracts";
import { CoreError, getRepo, mintAndPersistHurl } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = HurlMintRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    const hurl = await mintAndPersistHurl(getRepo(), parsed.data.sessionId);
    return NextResponse.json(HurlMintResponseSchema.parse({ hurl }));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
