import { AccessToken } from "@types";

export async function spotifyFetchTopArtists(token: AccessToken): Promise<Response> {
  // medium_term is approximately the last 6 months
  return fetch(
    "https://api.spotify.com/v1/me/top/artists?limit=50&time_range=medium_term",
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.access_token}`,
      },
    }
  );
}
