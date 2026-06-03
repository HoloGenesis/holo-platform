import { NextResponse } from "next/server";
import { WebhookResponseSchema } from "@holo/contracts";
import { CoreError, getRepo, handleWebhook } from "@holo/core-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Thin handler. Reads the RAW body (signature verification needs the exact
// bytes) and delegates to core. No logic here.
export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("stripe-signature");

  try {
    const result = await handleWebhook(getRepo(), rawBody, signature);
    return NextResponse.json(WebhookResponseSchema.parse(result));
  } catch (err) {
    if (err instanceof CoreError) {
      return NextResponse.json({ error: err.code }, { status: err.status });
    }
    throw err;
  }
}
