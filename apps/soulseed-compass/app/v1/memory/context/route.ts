import { NextResponse } from "next/server";
import { MemoryContextRequestSchema, MemoryContextResponseSchema } from "@holo/contracts";
import { CoreError, getContext, getRepo } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function GET(request: Request) {
  const url = new URL(request.url);
  const scopesParam = url.searchParams.get("scopes");

  const raw = {
    userId: url.searchParams.get("userId") ?? undefined,
    productKey: url.searchParams.get("productKey") ?? undefined,
    chamberKey: url.searchParams.get("chamberKey") ?? undefined,
    scopes: scopesParam
      ? scopesParam.split(",").map((s) => s.trim()).filter(Boolean)
      : undefined,
  };

  const parsed = MemoryContextRequestSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_request", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  // authorize: anonymous-first — no per-session auth in v1.

  try {
    const result = await getContext(getRepo(), parsed.data);
    return NextResponse.json(MemoryContextResponseSchema.parse(result));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
