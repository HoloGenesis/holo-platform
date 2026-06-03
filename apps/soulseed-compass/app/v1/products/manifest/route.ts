import { NextResponse } from "next/server";
import { ProductKeySchema, ProductManifestSchema } from "@holo/contracts";
import { CoreError, getManifest } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler: parse → authorize → delegate to core → return. No logic here.
export async function GET(request: Request) {
  const productKey = new URL(request.url).searchParams.get("productKey");

  const parsed = ProductKeySchema.safeParse(productKey);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_product_key" }, { status: 400 });
  }

  try {
    const manifest = getManifest(parsed.data);
    return NextResponse.json(ProductManifestSchema.parse(manifest));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
