import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { makeFakeRepo } from "../testing/fakeRepo";
import { createCheckout, getEntitlements, handleWebhook } from "./commerce";

const ORIGINAL = process.env.PAYMENTS_ENABLED;
afterEach(() => {
  process.env.PAYMENTS_ENABLED = ORIGINAL;
  delete process.env.STRIPE_SECRET_KEY;
  delete process.env.STRIPE_WEBHOOK_SECRET;
});

describe("createCheckout — PAYMENTS_ENABLED off (free beta)", () => {
  beforeEach(() => {
    process.env.PAYMENTS_ENABLED = "false";
  });
  it("returns an open, no-charge result and grants nothing", async () => {
    const { repo, entitlements } = makeFakeRepo();
    const res = await createCheckout(repo, { userId: randomUUID(), item: "astro-addon" });
    expect(res.enabled).toBe(false);
    expect(res.mode).toBe("free-beta");
    expect(res.status).toBe("open");
    expect(entitlements).toHaveLength(0);
  });
});

describe("createCheckout — PAYMENTS_ENABLED on, no Stripe key (mock)", () => {
  beforeEach(() => {
    process.env.PAYMENTS_ENABLED = "true";
  });
  it("instantly grants the astro-addon entitlement (test purchase)", async () => {
    const { repo, entitlements } = makeFakeRepo();
    const userId = randomUUID();
    const res = await createCheckout(repo, { userId, item: "astro-addon" });
    expect(res.mode).toBe("mock");
    expect(res.status).toBe("granted");
    expect(res.grantedEntitlement).toBe("astro-addon");
    expect(entitlements.find((e) => e.userId === userId && e.key === "astro-addon")).toBeTruthy();
  });
  it("base purchase grants no entitlement", async () => {
    const { repo, entitlements } = makeFakeRepo();
    const res = await createCheckout(repo, { userId: randomUUID(), item: "base" });
    expect(res.status).toBe("granted");
    expect(res.grantedEntitlement).toBeNull();
    expect(entitlements).toHaveLength(0);
  });
});

describe("handleWebhook (mock test-grant) + getEntitlements", () => {
  beforeEach(() => {
    process.env.PAYMENTS_ENABLED = "true";
  });
  it("writes an entitlement and entitlements.check reflects it", async () => {
    const { repo } = makeFakeRepo();
    const userId = randomUUID();

    const before = await getEntitlements(repo, userId);
    expect(before.entitlements).toHaveLength(0);
    expect(before.paymentsEnabled).toBe(true);

    const res = await handleWebhook(
      repo,
      JSON.stringify({ userId, entitlementKey: "astro-addon", source: "stripe" }),
      null
    );
    expect(res.ok).toBe(true);
    expect(res.entitlementId).toBeTypeOf("string");

    const after = await getEntitlements(repo, userId);
    expect(after.entitlements.map((e) => e.key)).toContain("astro-addon");
  });

  it("rejects a malformed webhook body", async () => {
    const { repo } = makeFakeRepo();
    await expect(handleWebhook(repo, "not json", null)).rejects.toThrow();
  });
});
