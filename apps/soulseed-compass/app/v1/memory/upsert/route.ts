import { NextResponse } from "next/server";
import { MemoryUpsertRequestSchema, MemoryUpsertResponseSchema } from "@holo/contracts";
import { CoreError, getRepo, upsertMemory } from "@holo/core-api";

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

  const parsed = MemoryUpsertRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    const result = await upsertMemory(getRepo(), parsed.data);
    return NextResponse.json(MemoryUpsertResponseSchema.parse(result), { status: 201 });
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
