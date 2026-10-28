import { z } from "zod";
import { nullToUndefined, UpdatableStringArraySchema } from "@types";

export const SpotifyDataSchema = z.object({
  topArtists: nullToUndefined(UpdatableStringArraySchema),
});

export type SpotifyData = z.infer<typeof SpotifyDataSchema>;
