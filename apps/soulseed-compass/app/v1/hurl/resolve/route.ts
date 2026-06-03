import { NextResponse } from "next/server";
import { HurlPathSchema, HurlResolveResponseSchema } from "@holo/contracts";
import { CoreError, getRepo, resolveHurl } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function GET(request: Request) {
  const path = new URL(request.url).searchParams.get("path");

  const parsed = HurlPathSchema.safeParse(path);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_hurl" }, { status: 400 });
  }

  try {
    const result = await resolveHurl(getRepo(), parsed.data);
    return NextResponse.json(HurlResolveResponseSchema.parse(result));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
