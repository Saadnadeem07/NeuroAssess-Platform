import { appUrl } from "./env";

/**
 * Minimal Google OAuth 2.0 (authorization-code) helper.
 *
 * The token exchange happens server-to-server over TLS, so the returned
 * id_token can be trusted and its payload decoded directly (no extra signature
 * verification needed for this confidential-client flow).
 *
 * Requires GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET. Configure the redirect URI
 * `${APP_URL}/api/auth/google/callback` in the Google Cloud console.
 */

export function googleConfigured(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

export function googleRedirectUri(): string {
  return `${appUrl()}/api/auth/google/callback`;
}

export function googleAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID as string,
    redirect_uri: googleRedirectUri(),
    response_type: "code",
    scope: "openid email profile",
    state,
    access_type: "online",
    prompt: "select_account",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export type GoogleProfile = { email: string; name: string; picture?: string; emailVerified: boolean };

export async function exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID as string,
      client_secret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirect_uri: googleRedirectUri(),
      grant_type: "authorization_code",
    }),
  });
  if (!res.ok) throw new Error("Failed to exchange Google authorization code");

  const tokens = (await res.json()) as { id_token?: string };
  if (!tokens.id_token) throw new Error("No id_token returned from Google");

  const payload = decodeJwtPayload(tokens.id_token);
  if (!payload.email) throw new Error("Google profile has no email");

  return {
    email: String(payload.email),
    name: String(payload.name || payload.email),
    picture: payload.picture ? String(payload.picture) : undefined,
    emailVerified: Boolean(payload.email_verified),
  };
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const part = jwt.split(".")[1];
  const json = Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8");
  return JSON.parse(json) as Record<string, unknown>;
}
