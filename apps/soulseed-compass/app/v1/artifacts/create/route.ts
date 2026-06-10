import { NextResponse } from "next/server";
import {
  ArtifactCreateRequestSchema,
  ArtifactCreateResponseSchema,
  SnapshotV2CreateResponseSchema,
} from "@holo/contracts";
import { CoreError, createArtifact, createSoulSeedSnapshotV2, getRepo } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
// One route, two artifact types (Engineering Addendum §3 — no new endpoint):
//   artifactType "soulseed-snapshot-v2" → v2 synthesis (S86)
//   omitted / "soulseed-snapshot"       → the original v1 path (unchanged)
export async function POST(request: Request) {
  let body: unknown = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const parsed = ArtifactCreateRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    if (parsed.data.artifactType === "soulseed-snapshot-v2") {
      const result = await createSoulSeedSnapshotV2(getRepo(), parsed.data);
      return NextResponse.json(SnapshotV2CreateResponseSchema.parse(result), { status: 201 });
    }
    const result = await createArtifact(getRepo(), parsed.data);
    return NextResponse.json(ArtifactCreateResponseSchema.parse(result), { status: 201 });
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
