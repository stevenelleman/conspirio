import {z} from "zod";

/*
{
access_token:"***"
token_type:"Bearer"
scope:"user-top-read"
expires_in:3600
refresh_token:"***"
}
 */

export const SpotifyBearerTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  // Seconds until expiration, typically 3600
  expires_in: z.number(),
  // Refresh responses may omit refresh_token, in which case the existing one stays valid
  refresh_token: z.string().optional(),
});

export type SpotifyBearerToken = z.infer<typeof SpotifyBearerTokenSchema>;

/*
{
"items": [
  {
    "id": "0TnOYISbd1XYRBk9myaseg",
    "name": "Pitbull",
    "genres": ["dance pop", "miami hip hop", "pop"],
    "popularity": 80,
    ...
  }
],
"total": 50,
"limit": 50,
...
}
*/

export const SpotifyArtistSchema = z.object({
  id: z.string(),
  name: z.string(),
});

export type SpotifyArtist = z.infer<typeof SpotifyArtistSchema>;

export const SpotifyTopArtistsResponseSchema = z.object({
  items: z.array(SpotifyArtistSchema),
});

export type SpotifyTopArtistsResponse = z.infer<typeof SpotifyTopArtistsResponseSchema>;
