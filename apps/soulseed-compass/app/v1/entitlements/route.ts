import { NextResponse } from "next/server";
import { EntitlementsGetResponseSchema, UuidSchema } from "@holo/contracts";
import { CoreError, getEntitlements, getRepo } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function GET(request: Request) {
  const userId = new URL(request.url).searchParams.get("userId");

  const parsed = UuidSchema.safeParse(userId);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_user_id" }, { status: 400 });
  }

  try {
    const result = await getEntitlements(getRepo(), parsed.data);
    return NextResponse.json(EntitlementsGetResponseSchema.parse(result));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
