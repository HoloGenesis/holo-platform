import type {
  MergeUserRequest,
  MergeUserResponse,
  SetEmailRequest,
  SetEmailResponse,
} from "@holo/contracts";
import { CoreError } from "../errors";
import type { CoreRepo } from "../repo";
import { sendHurlInvitation } from "./notifications/email";

/**
 * Capture an email onto the EXISTING anonymous user row. Anonymous-first: this
 * never creates a user or migrates rows — it only sets `email` where it was null.
 * After the row is updated, the user's HURL invitation is sent (mock by default).
 * The send is best-effort: any failure is swallowed so it NEVER blocks capture.
 */
export async function setEmail(repo: CoreRepo, input: SetEmailRequest): Promise<SetEmailResponse> {
  const row = await repo.setUserEmail(input.userId, input.email);
  if (!row) throw new CoreError("user_not_found", 404);

  try {
    const session = await repo.getLatestSessionForUser(input.userId);
    const hurlPath = session ? await repo.getSessionHurlPath(session.id) : null;
    if (hurlPath) {
      await sendHurlInvitation(repo, { userId: input.userId, email: input.email, hurlPath });
    }
  } catch (err) {
    // never block email capture on a notification failure
    console.error("[users.setEmail] HURL invitation send errored (ignored):", err);
  }

  return { userId: row.id, email: input.email };
}

/**
 * Merge an anonymous user into a canonical one (later cross-device login).
 * Delegates to the Postgres `merge_user()` function — re-points all dependent
 * rows and deletes the orphaned `from` user in a single transaction.
 */
export async function mergeUser(
  repo: CoreRepo,
  input: MergeUserRequest
): Promise<MergeUserResponse> {
  return repo.mergeUser(input.from, input.into);
}
