"use client";

import { GhostButton } from "./GhostButton";
import { IridescentButton } from "./IridescentButton";
import { useSprint10Store } from "../../lib/sprint10Store";

// Inline optional email capture (S87) — the S60 send chain re-skinned for Dawn
// Glass. Renders inside Screen 8's card; the return link works without it.
export function EmailCaptureV2() {
  const emailDraft = useSprint10Store((s) => s.emailDraft);
  const emailStatus = useSprint10Store((s) => s.emailStatus);
  const emailError = useSprint10Store((s) => s.emailError);
  const emailSentTo = useSprint10Store((s) => s.emailSentTo);
  const setEmailDraft = useSprint10Store((s) => s.setEmailDraft);
  const sendHurlEmail = useSprint10Store((s) => s.sendHurlEmail);
  const resetEmailCapture = useSprint10Store((s) => s.resetEmailCapture);

  if (emailStatus === "sent" && emailSentTo) {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-soulseed-dawn/80">Sent to {emailSentTo}.</p>
        <GhostButton type="button" className="px-4 py-2 text-sm" onClick={resetEmailCapture}>
          Send to another?
        </GhostButton>
      </div>
    );
  }

  const valid = /.+@.+\..+/.test(emailDraft.trim());
  const busy = emailStatus === "sending";

  return (
    <div>
      <h3 className="text-xl text-soulseed-dawn">Want this in your inbox?</h3>
      <p className="mt-1 text-sm text-soulseed-dawn/62">
        Optional — your return link below works either way.
      </p>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row">
        <input
          type="email"
          value={emailDraft}
          disabled={busy}
          onChange={(event) => setEmailDraft(event.target.value)}
          placeholder="you@somewhere"
          className="flex-1 rounded-[20px] border border-white/20 bg-black/20 px-5 py-3 text-base text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60 disabled:opacity-50"
        />
        <IridescentButton
          type="button"
          className="px-6 py-3"
          disabled={!valid || busy}
          onClick={() => void sendHurlEmail()}
        >
          {busy ? "Sending…" : "Email it"}
        </IridescentButton>
      </div>
      {emailStatus === "error" && (
        <p className="mt-2 text-sm text-soulseed-coral">
          {emailError ?? "Couldn't send. Try again."}
        </p>
      )}
    </div>
  );
}
