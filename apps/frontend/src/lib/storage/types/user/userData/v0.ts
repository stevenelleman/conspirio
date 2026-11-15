import { z } from "zod";
import { nullToUndefined } from "@types";

import { HotTakesRatingSchema, LannaDataSchema, TensionsRatingSchema } from "./lannaData";
import { StravaDataSchema } from "./stravaData";
import { GithubDataSchema } from "./githubData";
import { LannaHalloweenDataSchema } from "./lannaHalloweenData";
import { DevconSchema } from "./devconData";
import { ConnectionPSISizeSchema } from "./psiSizeData";
import {
  EmailDataSchema,
  SMSDataSchema,
  WhatsappDataSchema,
  TwitterDataSchema,
  TelegramDataSchema,
  SignalDataSchema,
  InstagramDataSchema,
  FarcasterDataSchema,
} from "./socials";
import { PersonalWebsitesSchema, SubstackDataSchema } from "./portfolio";
import { InterestsSchema } from "@/lib/storage/types/user/interests";
import { DislikesSchema } from "@/lib/storage/types/user/dislikes";
import { UserSettingsSchema } from "./settings";

// FROZEN: V0 is the flat UserData shape stored before versioning. Backup logs keep V0 entries forever, so this schema
// must not change. It has no version property; a missing version means V0.
export const UserDataV0Schema = z.object({
  // Bio
  username: z.string(),
  displayName: z.string(),
  bio: z.string(),
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
  psiPublicKeyLink: nullToUndefined(z.string()),
  pronouns: nullToUndefined(z.string()),

  // Socials
  twitter: nullToUndefined(TwitterDataSchema),
  telegram: nullToUndefined(TelegramDataSchema),
  signal: nullToUndefined(SignalDataSchema),
  instagram: nullToUndefined(InstagramDataSchema),
  farcaster: nullToUndefined(FarcasterDataSchema),
  whatsapp: nullToUndefined(WhatsappDataSchema),
  sms: nullToUndefined(SMSDataSchema),
  email: nullToUndefined(EmailDataSchema),

  // Portfolio
  substack: nullToUndefined(SubstackDataSchema),
  personalWebsites: nullToUndefined(PersonalWebsitesSchema),

  // Integrations
  strava: nullToUndefined(StravaDataSchema),
  github: nullToUndefined(GithubDataSchema),

  // Templates
  tensionsRating: nullToUndefined(TensionsRatingSchema),
  hotTakesRating: nullToUndefined(HotTakesRatingSchema),

  // -- Vanilla & Spicy
  publicInterests: nullToUndefined(InterestsSchema),
  privateInterests: nullToUndefined(InterestsSchema),

  // -- Lets Shit Talk
  dislikesPublicDefender: nullToUndefined(DislikesSchema),
  dislikesPetPeeves: nullToUndefined(DislikesSchema),
  dislikesLoveToHate: nullToUndefined(DislikesSchema),

  // Settings
  settings: nullToUndefined(UserSettingsSchema),

  // WIP: Migration in progress to ConnectionSchema
  connectionPSISize: nullToUndefined(ConnectionPSISizeSchema),

  // Deprecated
  lanna: nullToUndefined(LannaDataSchema),
  lannaHalloween: nullToUndefined(LannaHalloweenDataSchema),
  devcon: nullToUndefined(DevconSchema),
});

export type UserDataV0Type = z.infer<typeof UserDataV0Schema>;

// Changes between V0 and V1:
// - Group properties into bio, socials, portfolio, templates, integrations objects
// - Add version
// - Drop the deprecated lanna, lannaHalloween, devcon properties
// - Keep connectionPSISize: replaying MIGRATION_MOVE_PSISIZE_TO_CONNECTION reads it after this upgrade has run
export const upgradeUserDataV0ToV1 = (raw: unknown): unknown => {
  const v0 = UserDataV0Schema.parse(raw);

  return {
    version: 1,
    bio: {
      username: v0.username,
      displayName: v0.displayName,
      bio: v0.bio,
      signaturePublicKey: v0.signaturePublicKey,
      encryptionPublicKey: v0.encryptionPublicKey,
      psiPublicKeyLink: v0.psiPublicKeyLink,
      pronouns: v0.pronouns,
    },
    socials: {
      twitter: v0.twitter,
      telegram: v0.telegram,
      signal: v0.signal,
      instagram: v0.instagram,
      farcaster: v0.farcaster,
      whatsapp: v0.whatsapp,
      sms: v0.sms,
      email: v0.email,
    },
    portfolio: {
      substack: v0.substack,
      personalWebsites: v0.personalWebsites,
    },
    templates: {
      tensionsRating: v0.tensionsRating,
      hotTakesRating: v0.hotTakesRating,
      publicInterests: v0.publicInterests,
      privateInterests: v0.privateInterests,
      dislikesPublicDefender: v0.dislikesPublicDefender,
      dislikesPetPeeves: v0.dislikesPetPeeves,
      dislikesLoveToHate: v0.dislikesLoveToHate,
    },
    integrations: {
      strava: v0.strava,
      github: v0.github,
    },
    settings: v0.settings,
    connectionPSISize: v0.connectionPSISize,
  };
};
