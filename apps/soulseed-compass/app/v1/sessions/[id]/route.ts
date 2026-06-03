import { NextResponse } from "next/server";
import { SessionGetResponseSchema, UuidSchema } from "@holo/contracts";
import { CoreError, getRepo, getSession } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const parsedId = UuidSchema.safeParse(id);
  if (!parsedId.success) {
    return NextResponse.json({ error: "invalid_session_id" }, { status: 400 });
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    const result = await getSession(getRepo(), parsedId.data);
    if (!result) {
      return NextResponse.json({ error: "session_not_found" }, { status: 404 });
    }
    return NextResponse.json(SessionGetResponseSchema.parse(result));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
