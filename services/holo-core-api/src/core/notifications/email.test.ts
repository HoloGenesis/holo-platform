import { describe, expect, it } from "vitest";
import { makeFakeRepo } from "../../testing/fakeRepo";
import { setEmail } from "../users";
import { sendHurlInvitation } from "./email";

const HURL = "hurl://soulseed/living-invitation/state-1/coherence-050";
const EMAIL = "maya@example.com";

const byEvent = <T extends { contentJson?: Record<string, unknown> }>(mems: T[], event: string): T[] =>
  mems.filter((m) => m.contentJson?.["event"] === event);
const sentMemories = <T extends { contentJson?: Record<string, unknown> }>(mems: T[]): T[] =>
  byEvent(mems, "hurl_email_sent");
const failedMemories = <T extends { contentJson?: Record<string, unknown> }>(mems: T[]): T[] =>
  byEvent(mems, "hurl_email_failed");

describe("sendHurlInvitation — mock mode", () => {
  it("logs + writes an event-scope memory and stamps email_sent_at", async () => {
    const { repo, memories } = makeFakeRepo();
    const { id: userId } = await repo.createAnonUser();

    const res = await sendHurlInvitation(repo, { userId, email: EMAIL, hurlPath: HURL }, { mode: "mock" });

    expect(res).toEqual({ ok: true, mode: "mock" });
    const sends = sentMemories(memories);
    expect(sends).toHaveLength(1);
    expect(sends[0]?.scope).toBe("event");
    expect(sends[0]?.importance).toBe(0.05);
    expect(sends[0]?.content).toContain(EMAIL);
    expect(await repo.getUserEmailSentAt(userId)).not.toBeNull();
  });
});

describe("sendHurlInvitation — idempotence", () => {
  it("a second send within the hour returns ok+skipped without sending again", async () => {
    const { repo, memories } = makeFakeRepo();
    const { id: userId } = await repo.createAnonUser();

    const first = await sendHurlInvitation(repo, { userId, email: EMAIL, hurlPath: HURL }, { mode: "mock" });
    const second = await sendHurlInvitation(repo, { userId, email: EMAIL, hurlPath: HURL }, { mode: "mock" });

    expect(first.mode).toBe("mock");
    expect(second).toEqual({ ok: true, mode: "skipped" });
    expect(sentMemories(memories)).toHaveLength(1); // not re-sent
  });
});

describe("sendHurlInvitation — failure path", () => {
  it("captures a live-send failure as an event memory and never throws", async () => {
    const { repo, memories } = makeFakeRepo();
    const { id: userId } = await repo.createAnonUser();
    const throwingSender = () => Promise.reject(new Error("provider down"));

    const res = await sendHurlInvitation(
      repo,
      { userId, email: EMAIL, hurlPath: HURL },
      { mode: "live", sender: throwingSender }
    );

    expect(res).toEqual({ ok: false, mode: "live" });
    expect(failedMemories(memories)).toHaveLength(1);
    // a failed send is NOT stamped — so a later attempt can retry
    expect(await repo.getUserEmailSentAt(userId)).toBeNull();
  });
});

describe("setEmail — never blocks capture on a send error", () => {
  it("resolves normally even when the notification path throws", async () => {
    const fake = makeFakeRepo();
    const { id: userId } = await fake.repo.createAnonUser();
    // force the HURL lookup to throw, exercising setEmail's best-effort catch
    fake.repo.getLatestSessionForUser = () => Promise.reject(new Error("boom"));

    await expect(setEmail(fake.repo, { userId, email: EMAIL })).resolves.toMatchObject({
      userId,
      email: EMAIL,
    });
  });
});
