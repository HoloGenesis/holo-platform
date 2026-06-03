import { createHmac, timingSafeEqual } from "node:crypto";
import type {
  CheckoutItem,
  CheckoutRequest,
  CheckoutResponse,
  EntitlementKey,
  EntitlementsGetResponse,
  WebhookResponse,
} from "@holo/contracts";
import { WebhookTestGrantSchema } from "@holo/contracts";
import { CoreError } from "../errors";
import type { CoreRepo } from "../repo";

interface ProductDef {
  amount: number; // in cents
  label: string;
  entitlement: EntitlementKey | null;
}

const PRODUCTS: Record<CheckoutItem, ProductDef> = {
  base: { amount: 2700, label: "SoulSeed Compass", entitlement: null },
  "astro-addon": { amount: 900, label: "Deeper Trajectory add-on", entitlement: "astro-addon" },
};

/** One source of truth for the paywall flag. Off = free beta (everything open). */
export function paymentsEnabled(): boolean {
  return process.env.PAYMENTS_ENABLED === "true";
}

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

/** Create a Stripe Checkout Session (live mode). Real round-trip; webhook grants. */
async function createStripeSession(
  apiKey: string,
  input: CheckoutRequest,
  product: ProductDef
): Promise<string> {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${APP_URL}/?checkout=success`);
  form.set("cancel_url", `${APP_URL}/?checkout=cancel`);
  form.set("line_items[0][quantity]", "1");
  form.set("line_items[0][price_data][currency]", "usd");
  form.set("line_items[0][price_data][unit_amount]", String(product.amount));
  form.set("line_items[0][price_data][product_data][name]", product.label);
  form.set("metadata[userId]", input.userId);
  form.set("metadata[item]", input.item);

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  if (!res.ok) throw new CoreError("stripe_error", 502, `Stripe returned ${res.status}`);
  const session = (await res.json()) as { url?: string };
  if (!session.url) throw new CoreError("stripe_error", 502, "no checkout url");
  return session.url;
}

/**
 * Begin a purchase. Three modes:
 *  - free-beta  (PAYMENTS_ENABLED off): no charge, everything open.
 *  - mock       (on, no STRIPE_SECRET_KEY): instant test grant (dev/CI).
 *  - live       (on, key present): real Stripe Checkout Session URL.
 */
export async function createCheckout(
  repo: CoreRepo,
  input: CheckoutRequest
): Promise<CheckoutResponse> {
  const product = PRODUCTS[input.item];

  if (!paymentsEnabled()) {
    return { enabled: false, mode: "free-beta", status: "open", item: input.item, grantedEntitlement: null };
  }

  const apiKey = process.env.STRIPE_SECRET_KEY;
  if (!apiKey) {
    // mock: simulate a successful test purchase without a Stripe round-trip
    let grantedEntitlement: EntitlementKey | null = null;
    if (product.entitlement) {
      await repo.upsertEntitlement({ userId: input.userId, key: product.entitlement, source: "manual" });
      grantedEntitlement = product.entitlement;
    }
    return { enabled: true, mode: "mock", status: "granted", item: input.item, grantedEntitlement };
  }

  const checkoutUrl = await createStripeSession(apiKey, input, product);
  return { enabled: true, mode: "live", status: "redirect", item: input.item, checkoutUrl };
}

/** Verify a Stripe webhook signature (t=…,v1=… header against HMAC-SHA256). */
function verifyStripeSignature(rawBody: string, signature: string, secret: string): boolean {
  const parts = Object.fromEntries(
    signature.split(",").map((kv) => {
      const [k, v] = kv.split("=");
      return [k ?? "", v ?? ""];
    })
  );
  const timestamp = parts["t"];
  const expected = parts["v1"];
  if (!timestamp || !expected) return false;
  const digest = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest("hex");
  const a = Buffer.from(digest);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

interface StripeEvent {
  type?: string;
  data?: { object?: { id?: string; metadata?: { userId?: string; item?: string } } };
}

/**
 * Handle the Stripe webhook. With STRIPE_WEBHOOK_SECRET set, the signature is
 * verified and a completed checkout grants the item's entitlement. Without it
 * (mock/test), accepts an explicit { userId, entitlementKey, source } grant.
 */
export async function handleWebhook(
  repo: CoreRepo,
  rawBody: string,
  signature: string | null
): Promise<WebhookResponse> {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    let body: unknown;
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw new CoreError("invalid_webhook", 400, "body is not JSON");
    }
    const parsed = WebhookTestGrantSchema.safeParse(body);
    if (!parsed.success) throw new CoreError("invalid_webhook", 400, "expected a test grant");
    const { id } = await repo.upsertEntitlement({
      userId: parsed.data.userId,
      key: parsed.data.entitlementKey,
      source: parsed.data.source,
    });
    return { ok: true, entitlementId: id };
  }

  if (!signature || !verifyStripeSignature(rawBody, signature, webhookSecret)) {
    throw new CoreError("bad_signature", 400, "webhook signature verification failed");
  }

  const event = JSON.parse(rawBody) as StripeEvent;
  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const userId = session?.metadata?.userId;
    const item = session?.metadata?.item as CheckoutItem | undefined;
    const entitlement = item ? PRODUCTS[item]?.entitlement : null;
    if (userId && entitlement) {
      const { id } = await repo.upsertEntitlement({
        userId,
        key: entitlement,
        source: "stripe",
        stripeRef: session?.id ?? null,
      });
      return { ok: true, entitlementId: id };
    }
  }
  return { ok: true, note: "ignored" };
}

/** Read a user's entitlements + the paywall flag (the UI gate reads both). */
export async function getEntitlements(
  repo: CoreRepo,
  userId: string
): Promise<EntitlementsGetResponse> {
  const rows = await repo.getEntitlements(userId);
  return {
    userId,
    paymentsEnabled: paymentsEnabled(),
    entitlements: rows.map((r) => ({
      key: r.key as EntitlementKey,
      source: r.source as EntitlementsGetResponse["entitlements"][number]["source"],
      grantedAt: r.grantedAt,
    })),
  };
}
