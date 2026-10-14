/**
 * Returns the server-provided message for client errors (4xx) so users see
 * actionable feedback; falls back for network, timeout, auth, and server errors.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const { status, detail } = (error ?? {}) as { status?: unknown; detail?: unknown };
  if (
    typeof status === "number" &&
    status >= 400 &&
    status < 500 &&
    status !== 401 &&
    typeof detail === "string" &&
    detail.trim()
  ) {
    return detail;
  }
  return fallback;
}
