import { z } from "zod";
import { nullToUndefined } from "@types";

import {
  HotTakesRating,
  HotTakesRatingSchema, LannaData,
  LannaDataSchema, TensionsRating,
  TensionsRatingSchema
} from "./lannaData";
import { StravaData, StravaDataSchema } from "./stravaData";
import { GithubData, GithubDataSchema } from "./githubData";
import { LannaHalloweenData, LannaHalloweenDataSchema } from "./lannaHalloweenData";
import { DevconData, DevconSchema } from "./devconData";
import {
  ConnectionPSISize,
  ConnectionPSISizeSchema,
} from "@/lib/storage/types/user/userData/psiSizeData";
import {
  EmailDataSchema,
  SMSDataSchema,
  WhatsappDataSchema,
  TwitterDataSchema,
  TelegramDataSchema,
  SignalDataSchema,
  InstagramDataSchema,
  FarcasterDataSchema, TwitterData, TelegramData, SignalData, InstagramData, FarcasterData, WhatsappData, SMSData,
  EmailData
} from "@/lib/storage/types/user/userData/socials";
import {
  PersonalWebsites,
  PersonalWebsitesSchema,
  SubstackData,
  SubstackDataSchema
} from "@/lib/storage/types/user/userData/portfolio";

import { interests, InterestsSchema } from "@/lib/storage/types/user/interests";
import { dislikes, DislikesSchema } from "@/lib/storage/types/user/dislikes";

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

// TODO: Consider using zod getter / setter pattern for migrations, and z.output instead of z.infer
export const UserDataSchema = z.object({
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

export type UserDataType = z.infer<typeof UserDataSchema>;

// NOTE: Runtime Serialization. Calling JSON.stringify(instance) converts the object's enumerable properties into
// a raw JSON text string. Functions, methods, and private fields are stripped out during this process. "implements"
// should ensure UserData properties are kept in line with UserDataType, which is the UserData object stored in
// local storage.

export class UserData implements UserDataType {
  // Bio
  username: string;
  displayName: string;
  bio: string;
  signaturePublicKey: string;
  encryptionPublicKey: string;
  psiPublicKeyLink: string | undefined;
  pronouns: string | undefined;

  // Socials
  twitter: TwitterData | undefined;
  telegram: TelegramData | undefined;
  signal: SignalData | undefined;
  instagram: InstagramData | undefined;
  farcaster: FarcasterData | undefined;
  whatsapp: WhatsappData | undefined;
  sms: SMSData | undefined;
  email: EmailData | undefined;

  // Portfolio
  substack: SubstackData | undefined;
  personalWebsites: PersonalWebsites | undefined;

  // Integrations
  strava: StravaData | undefined;
  github: GithubData | undefined;

  // Templates
  tensionsRating: TensionsRating | undefined;
  hotTakesRating: HotTakesRating | undefined;

  // -- Vanilla & Spicy
  publicInterests: interests | undefined;
  privateInterests: interests | undefined;

  // -- Lets Shit Talk
  dislikesPublicDefender: dislikes | undefined;
  dislikesPetPeeves: dislikes | undefined;
  dislikesLoveToHate: dislikes | undefined;

  // Settings
  settings: UserSettings | undefined;

  // WIP: Migration in progress to ConnectionSchema
  connectionPSISize: ConnectionPSISize | undefined;

  // Deprecated
  lanna: LannaData | undefined;
  lannaHalloween: LannaHalloweenData | undefined;
  devcon: DevconData | undefined;

  constructor(data: unknown) {
    // Validate incoming data at runtime during instantiation
    const validated = UserDataSchema.parse(data);

    // Bio
    this.username = validated.username;
    this.displayName = validated.displayName;
    this.bio = validated.bio;
    this.signaturePublicKey = validated.signaturePublicKey;
    this.encryptionPublicKey = validated.encryptionPublicKey;
    this.psiPublicKeyLink = validated.psiPublicKeyLink;
    this.pronouns = validated.pronouns;

    // Socials
    this.twitter = validated.twitter;
    this.telegram = validated.telegram;
    this.signal = validated.signal;
    this.instagram = validated.instagram;
    this.farcaster = validated.farcaster;
    this.whatsapp = validated.whatsapp;
    this.sms = validated.sms;
    this.email = validated.email;

    // Portfolio
    this.substack = validated.substack;
    this.personalWebsites = validated.personalWebsites;

    // Integrations
    this.strava = validated.strava;
    this.github = validated.github;

    // Templates
    this.tensionsRating = validated.tensionsRating;
    this.hotTakesRating = validated.hotTakesRating;

    // -- Vanilla & Spicy
    this.publicInterests = validated.publicInterests;
    this.privateInterests = validated.privateInterests;

    // -- Lets Shit Talk
    this.dislikesPublicDefender = validated.dislikesPublicDefender;
    this.dislikesPetPeeves = validated.dislikesPetPeeves;
    this.dislikesLoveToHate = validated.dislikesLoveToHate;

    // Settings
    this.settings = validated.settings;

    // WIP: Migration in progress to ConnectionSchema
    this.connectionPSISize = validated.connectionPSISize;

    // Deprecated
    this.lanna = validated.lanna;
    this.lannaHalloween = validated.lannaHalloween;
    this.devcon = validated.devcon;
  }
}

export const UnregisteredUserDataSchema = z.object({
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
});

export type UnregisteredUserData = z.infer<typeof UnregisteredUserDataSchema>;

export const FlattenedUserDataSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  bio: z.string(),
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
  twitterHandle: z.string().optional(),
  telegramHandle: z.string().optional(),
  signalHandle: z.string().optional(),
  instagramHandle: z.string().optional(),
  farcasterHandle: z.string().optional(),
  pronouns: z.string().optional(),
  note: z.string().optional(),
  emoji: z.string().optional(),
  // interests
});

export type FlattenedUserData = z.infer<typeof FlattenedUserDataSchema>;

export {
  type TwitterData, TwitterDataSchema,
  type TelegramData, TelegramDataSchema,
  type SignalData, SignalDataSchema,
  type InstagramData, InstagramDataSchema,
  type FarcasterData, FarcasterDataSchema,
  type WhatsappData, WhatsappDataSchema,
  type SMSData, SMSDataSchema,
  type EmailData, EmailDataSchema,

} from "@/lib/storage/types/user/userData/socials";

export {
  type LannaDesiredConnections,
  LannaDesiredConnectionsSchema,
  type LannaData,
  LannaDataSchema,
} from "./lannaData";
export { type GithubData, GithubDataSchema } from "./githubData";
export { type StravaData, StravaDataSchema } from "./stravaData";
