import { OAuthAppDetails, DataImportSource } from "@types";

export async function stravaFetchToken(
  mapping: OAuthAppDetails,
  code: string
): Promise<globalThis.Response> {
  const { id, secret, token_url } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: id,
      client_secret: secret,
      code: code,
      grant_type: "authorization_code",
    }),
  });
}

export async function ghFetchToken(
  mapping: OAuthAppDetails,
  code: string
): Promise<globalThis.Response> {
  const { id, secret, token_url, redirect_uri } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: id,
      client_secret: secret,
      code: code,
      redirect_uri: redirect_uri,
    }),
  });
}

export async function googleCalendarFetchToken(
  mapping: OAuthAppDetails,
  code: string
): Promise<globalThis.Response> {
  const { id, secret, token_url, redirect_uri } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      code: code,
      redirect_uri: redirect_uri,
      grant_type: "authorization_code",
    }),
  });
}

export async function fetchToken(
  app: DataImportSource,
  mapping: OAuthAppDetails,
  code: string
): Promise<globalThis.Response | null> {
  // Apps that can use server-side fetching
  switch (app) {
    case DataImportSource.STRAVA:
      return await stravaFetchToken(mapping, code);
    case DataImportSource.GITHUB:
      return await ghFetchToken(mapping, code);
    case DataImportSource.GOOGLE_CALENDAR:
      return await googleCalendarFetchToken(mapping, code);
    default:
      return null;
  }
}

export async function googleCalendarRefreshToken(
  mapping: OAuthAppDetails,
  refreshToken: string
): Promise<globalThis.Response> {
  const { id, secret, token_url } = mapping;

  return fetch(token_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: id,
      client_secret: secret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
}

export async function refreshToken(
  app: DataImportSource,
  mapping: OAuthAppDetails,
  refreshToken: string
): Promise<globalThis.Response | null> {
  // Apps whose refresh requires the client secret
  switch (app) {
    case DataImportSource.GOOGLE_CALENDAR:
      return await googleCalendarRefreshToken(mapping, refreshToken);
    default:
      return null;
  }
}
