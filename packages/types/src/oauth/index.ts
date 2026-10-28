import { z } from "zod";
import { StravaBearerTokenSchema, GithubBearerTokenSchema, SpotifyBearerTokenSchema } from "../imports";

import { DataImportSource, DataImportSourceSchema } from "../imports";

export const AccessTokenSchema = z.object({
  access_token: z.string(),
  scope: z.string(),
  token_type: z.string(),
  refresh_token: z.string(),
  user_id: z.number(),
  expires_at: z.number(),
});

export type AccessToken = z.infer<typeof AccessTokenSchema>;

export const OAuthExchangeTokensRequestSchema = z.object({
  code: z.string(),
  state: DataImportSourceSchema,
});

export type OAuthExchangeTokensRequest = z.infer<
  typeof OAuthExchangeTokensRequestSchema
>;

// Mapping access token types
export async function stravaMapResponseToAccessToken(
  data: any,
  oldAccessToken: AccessToken | null,
): Promise<AccessToken> {
  // Convert StravaBearerToken into generic AuthToken
  const parsedData = StravaBearerTokenSchema.parse(data);
  const { access_token, refresh_token, expires_at, athlete } = parsedData;

  let id: number = 0;
  if (!athlete && oldAccessToken) {
    // Athlete not available, means we're in the refresh flow. Use existing value.
    id = oldAccessToken.user_id;
  } else if (athlete) {
    // Athlete available, use it
    id = athlete.id;
  } else {
    throw new Error("Required user Id output is missing.")
  }

  return {
    access_token,
    refresh_token,
    expires_at,
    user_id: id,

    // Unused for now, should probably add them
    scope: "",
    token_type: "",
  };
}

export async function githubMapResponseToAccessToken(
  data: any
): Promise<AccessToken> {
  // Convert StravaBearerToken into generic AuthToken
  const parsedData = GithubBearerTokenSchema.parse(data);
  const { access_token, scope, token_type } = parsedData;

  return {
    access_token,
    scope,
    token_type,

    // Unused for now, should probably add them
    refresh_token: "",
    expires_at: 0,
    user_id: 0,
  };
}

export async function spotifyMapResponseToAccessToken(
  data: any,
  oldAccessToken: AccessToken | null,
): Promise<AccessToken> {
  // Convert SpotifyBearerToken into generic AuthToken
  const parsedData = SpotifyBearerTokenSchema.parse(data);
  const { access_token, scope, token_type, expires_in } = parsedData;

  // Refresh flow may not rotate the refresh token, if so keep existing value.
  const refresh_token = parsedData.refresh_token || oldAccessToken?.refresh_token;
  if (!refresh_token) {
    throw new Error("Required refresh token output is missing.")
  }

  return {
    access_token,
    refresh_token,
    scope,
    token_type,
    // Store in seconds, matching Strava
    expires_at: Math.floor(Date.now() / 1000) + expires_in,

    // Spotify user ids are strings and unused for now
    user_id: 0,
  };
}

export async function mapResponseToAccessToken(
  app: DataImportSource,
  oldAccessToken: AccessToken | null, // Used in refresh case
  data: any
): Promise<AccessToken | null> {
  switch (app) {
    case DataImportSource.STRAVA:
      return await stravaMapResponseToAccessToken(data, oldAccessToken);
    case DataImportSource.GITHUB:
      return await githubMapResponseToAccessToken(data);
    case DataImportSource.SPOTIFY:
      return await spotifyMapResponseToAccessToken(data, oldAccessToken);
    default:
      return null;
  }
}
