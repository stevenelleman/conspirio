import { DataImportSource, OAuthAppDetails } from "@types";
import { OAUTH_APP_DETAILS, SPOTIFY_AUTHORIZE_URL } from "@/config";

// Code verifier must survive the redirect to the provider and back to /oauth/exchange_token
const pkceVerifierKey = (app: DataImportSource) => `oauth-pkce-verifier-${app}`;

function base64UrlEncode(bytes: Uint8Array): string {
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join("");
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

async function createPKCEChallenge(
  app: DataImportSource
): Promise<string> {
  // 64 random bytes -> 86 character verifier, within the 43-128 character spec range
  const verifier = base64UrlEncode(crypto.getRandomValues(new Uint8Array(64)));
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(verifier)
  );

  localStorage.setItem(pkceVerifierKey(app), verifier);
  return base64UrlEncode(new Uint8Array(digest));
}

// Verifier is single-use, remove it once read
export function consumePKCEVerifier(app: DataImportSource): string | null {
  const key = pkceVerifierKey(app);
  const verifier = localStorage.getItem(key);
  localStorage.removeItem(key);
  return verifier;
}

export async function getSpotifyAuthorizeUrl(): Promise<string> {
  const details: OAuthAppDetails = OAUTH_APP_DETAILS[DataImportSource.SPOTIFY];
  const challenge = await createPKCEChallenge(DataImportSource.SPOTIFY);

  const params = new URLSearchParams({
    client_id: details.id,
    response_type: "code",
    state: DataImportSource.SPOTIFY,
    redirect_uri: details.redirect_uri,
    scope: details.data_options.map((option) => option.scope).join(" "),
    code_challenge_method: "S256",
    code_challenge: challenge,
  });

  return `${SPOTIFY_AUTHORIZE_URL}?${params.toString()}`;
}
