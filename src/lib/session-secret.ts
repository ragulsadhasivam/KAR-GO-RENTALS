// Resolved per call (not at import) so builds without the variable still work.
// Production refuses to run with a guessable secret.
const DEV_ONLY_SECRET = "kargo-dev-only-secret";

export function getSessionSecret() {
  const value = process.env.SESSION_SECRET;
  if (value) return new TextEncoder().encode(value);
  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET is not set.");
  }
  return new TextEncoder().encode(DEV_ONLY_SECRET);
}
