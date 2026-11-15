import { z } from "zod";
import { nullToUndefined } from "@types";

export const UserSettingsSchema = z.object({
  automaticPSIEnabled: nullToUndefined(z.boolean().nullable()),

  discloseDislikesPublicDefender: nullToUndefined(z.boolean().nullable()),
  discloseDislikesPetPeeves: nullToUndefined(z.boolean().nullable()),
  discloseDislikesLoveToHate: nullToUndefined(z.boolean().nullable()),

  // NOTE: In a future PR swap tapGraphEnabled to live in settings
  // tapGraphEnabled: nullToUndefined(z.boolean().nullable()),

  // NOTE: currently dark theme lives in localstorage at `cursive-connections-theme` key -- should it be moved to settings to persist it between sessions?
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;
