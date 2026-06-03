import type {
  MergeUserRequest,
  MergeUserResponse,
  SetEmailRequest,
  SetEmailResponse,
} from "@holo/contracts";
import { CoreError } from "../errors";
import type { CoreRepo } from "../repo";

/**
 * Capture an email onto the EXISTING anonymous user row. Anonymous-first: this
 * never creates a user or migrates rows — it only sets `email` where it was null.
 */
export async function setEmail(repo: CoreRepo, input: SetEmailRequest): Promise<SetEmailResponse> {
  const row = await repo.setUserEmail(input.userId, input.email);
  if (!row) throw new CoreError("user_not_found", 404);
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
