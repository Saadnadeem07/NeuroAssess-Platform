/**
 * Centralised, lazy access to environment variables.
 * We read lazily (not at module load) so that importing a model in a build
 * step doesn't crash when an env var is only needed at request time.
 */

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

export function optionalEnv(name: string, fallback = ""): string {
  return process.env[name] ?? fallback;
}

export const isProd = () => process.env.NODE_ENV === "production";

export const appUrl = () =>
  process.env.APP_URL || "http://localhost:3000";
