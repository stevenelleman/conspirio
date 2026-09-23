import { z } from "zod";
import { nullToUndefined } from "@types";


export const SubstackDataSchema = z.object({
  handle: nullToUndefined(z.string()),
});

export type SubstackData = z.infer<typeof SubstackDataSchema>;

export const PersonalWebsitesSchema = z.object({
  websites: nullToUndefined(z.array(z.string())),
});

export type PersonalWebsites = z.infer<typeof PersonalWebsitesSchema>;