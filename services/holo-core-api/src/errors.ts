/**
 * A domain error raised by core/ functions. Carries an HTTP status so thin
 * route handlers can map it without knowing any business logic.
 */
export class CoreError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(code: string, status = 400, message?: string) {
    super(message ?? code);
    this.name = "CoreError";
    this.code = code;
    this.status = status;
  }
}
