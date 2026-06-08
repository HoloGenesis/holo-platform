import type {
  SendHurlInvitationRequest,
  SendHurlInvitationResponse,
} from "@holo/contracts";
import type { CoreRepo } from "../../repo";
import { upsertMemory } from "../memory";

// HURL-invitation email. Mirrors the commerce.ts mock|live env switch:
//  - mock (default): log + write an event-scope memory, no network.
//  - live (EMAIL_MODE=live + RESEND_API_KEY): render the React Email template
//    and send via Resend.
// Provider imports are dynamic so mock mode (and tests) never load Resend /
// React Email at runtime. A send is idempotent within one hour and NEVER throws.

const APP_URL = process.env.APP_URL ?? "http://localhost:3000";
const ONE_HOUR_MS = 60 * 60 * 1000;

/** "live" only when explicitly enabled AND a key is present; "mock" otherwise. */
export function emailMode(): "mock" | "live" {
  return process.env.EMAIL_MODE === "live" && Boolean(process.env.RESEND_API_KEY) ? "live" : "mock";
}

/** Canonical return link: APP_URL + ?hurl=<4-part HURL>. (HURL is the auth token.) */
export function returnUrlFor(hurlPath: string): string {
  return `${APP_URL}/?hurl=${encodeURIComponent(hurlPath)}`;
}

/** A live-send function returning the provider message id. Injectable for tests. */
export type HurlSender = (
  input: SendHurlInvitationRequest,
  returnUrl: string
) => Promise<string | undefined>;

export interface SendHurlInvitationOptions {
  /** Override the resolved mode (tests). */
  mode?: "mock" | "live";
  /** Override the live sender (tests / alternate providers). */
  sender?: HurlSender;
}

/** The product owning this HURL (first path segment of hurl://<product>/…). */
const sourceProductOf = (hurlPath: string): string => hurlPath.split("/")[2] ?? "soulseed";

/** Analytics + audit: write an event-scope memory (importance 0.05). */
async function recordEvent(
  repo: CoreRepo,
  input: SendHurlInvitationRequest,
  content: string,
  detail: Record<string, unknown>
): Promise<void> {
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: null,
    sourceProduct: sourceProductOf(input.hurlPath),
    scope: "event",
    content,
    contentJson: detail,
    importance: 0.05,
  });
}

/** Default live sender: render the React Email template + send via Resend. */
const resendSender: HurlSender = async (input, returnUrl) => {
  const [{ Resend }, { render }, tpl] = await Promise.all([
    import("resend"),
    import("@react-email/render"),
    import("./templates/HurlInvitation"),
  ]);
  const html = await render(
    tpl.HurlInvitation({
      returnUrl,
      hurlPath: input.hurlPath,
      snapshotSummary: input.snapshotSummary,
    })
  );
  const resend = new Resend(process.env.RESEND_API_KEY);
  const from = process.env.RESEND_FROM_ADDRESS ?? "soulseed@soulseed-compass.app";
  const { data, error } = await resend.emails.send({
    from,
    to: input.email,
    subject: tpl.HURL_INVITATION_SUBJECT,
    html,
  });
  if (error) throw new Error(error.message ?? "Resend send failed");
  return data?.id;
};

/**
 * Send the HURL invitation. Idempotent (a send within the last hour is skipped),
 * mock by default, and NEVER throws — a live-send failure is captured as an
 * event-scope memory and returned as `{ ok: false }`, so email capture is never
 * blocked.
 */
export async function sendHurlInvitation(
  repo: CoreRepo,
  input: SendHurlInvitationRequest,
  options: SendHurlInvitationOptions = {}
): Promise<SendHurlInvitationResponse> {
  // Idempotence: don't re-send if a send happened within the last hour.
  const lastSent = await repo.getUserEmailSentAt(input.userId);
  if (lastSent && Date.now() - Date.parse(lastSent) < ONE_HOUR_MS) {
    return { ok: true, mode: "skipped" };
  }

  const mode = options.mode ?? emailMode();
  const sentAt = new Date().toISOString();

  if (mode === "mock") {
    console.log(`[notifications] hurl_email_sent (mock): HURL → ${input.email}`);
    await recordEvent(repo, input, `Email mocked: HURL sent to ${input.email}.`, {
      event: "hurl_email_sent",
      mode: "mock",
    });
    await repo.markUserEmailSent(input.userId, sentAt);
    return { ok: true, mode: "mock" };
  }

  const send = options.sender ?? resendSender;
  try {
    const providerMessageId = await send(input, returnUrlFor(input.hurlPath));
    await recordEvent(repo, input, `Email sent: HURL delivered to ${input.email}.`, {
      event: "hurl_email_sent",
      mode: "live",
      providerMessageId: providerMessageId ?? null,
    });
    await repo.markUserEmailSent(input.userId, sentAt);
    return { ok: true, mode: "live", providerMessageId };
  } catch (err) {
    console.error(`[notifications] hurl_email_failed for ${input.email}:`, err);
    await recordEvent(repo, input, `Email failed: HURL not delivered to ${input.email}.`, {
      event: "hurl_email_failed",
      mode: "live",
      error: err instanceof Error ? err.message : String(err),
    });
    return { ok: false, mode: "live" };
  }
}
