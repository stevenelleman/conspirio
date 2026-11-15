import {
  z
} from "zod";
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

export const UserBioSchema = z.object({
  username: z.string(),
  displayName: z.string(),
  bio: z.string(),
  signaturePublicKey: z.string(),
  encryptionPublicKey: z.string(),
  psiPublicKeyLink: nullToUndefined(z.string()),
  pronouns: nullToUndefined(z.string()),
});

export type UserBio = z.infer<typeof UserBioSchema>;

export const UserSocialsSchema = z.object({
  twitter: nullToUndefined(TwitterDataSchema),
  telegram: nullToUndefined(TelegramDataSchema),
  signal: nullToUndefined(SignalDataSchema),
  instagram: nullToUndefined(InstagramDataSchema),
  farcaster: nullToUndefined(FarcasterDataSchema),
  whatsapp: nullToUndefined(WhatsappDataSchema),
  sms: nullToUndefined(SMSDataSchema),
  email: nullToUndefined(EmailDataSchema),
});

export type UserSocials = z.infer<typeof UserSocialsSchema>;

export const UserPortfolioSchema = z.object({
  substack: nullToUndefined(SubstackDataSchema),
  personalWebsites: nullToUndefined(PersonalWebsitesSchema),
});

export type UserPortfolio = z.infer<typeof UserPortfolioSchema>;


export const UserTemplatesSchema = z.object({
  tensionsRating: nullToUndefined(TensionsRatingSchema),
  hotTakesRating: nullToUndefined(HotTakesRatingSchema),

  // -- Vanilla & Spicy
  publicInterests: nullToUndefined(InterestsSchema),
  privateInterests: nullToUndefined(InterestsSchema),

  // -- Lets Shit Talk
  dislikesPublicDefender: nullToUndefined(DislikesSchema),
  dislikesPetPeeves: nullToUndefined(DislikesSchema),
  dislikesLoveToHate: nullToUndefined(DislikesSchema),
});

export type UserTemplates = z.infer<typeof UserTemplatesSchema>;

export const UserIntegrationsSchema = z.object({
  strava: nullToUndefined(StravaDataSchema),
  github: nullToUndefined(GithubDataSchema),
});

export type UserIntegrations = z.infer<typeof UserIntegrationsSchema>;

export const UserDataSchema = z.object({
  bio: UserBioSchema,
  socials: nullToUndefined(UserSocialsSchema),
  portfolio: nullToUndefined(UserPortfolioSchema),
  templates: nullToUndefined(UserTemplatesSchema),
  integrations: nullToUndefined(UserIntegrationsSchema),
  settings: nullToUndefined(UserSettingsSchema),
});

export type UserDataType = z.infer<typeof UserDataSchema>;

// NOTE: Runtime Serialization. Calling JSON.stringify(instance) converts the object's enumerable properties into
// a raw JSON text string. Functions, methods, and private fields are stripped out during this process. "implements"
// should ensure UserData properties are kept in line with UserDataType, which is the UserData object stored in
// local storage.

// Changes between V0 and V1:
// - [x] Add Bio object
// - [x] Add Socials object
// - [x] Add Portfolio object
// - [x] Add Integrations object
// - [x] Add Templates object
// - [x] Remove connectionPSISize (to get to this migration implies you've already gone through the last one)
// - [x] Remove deprecated properties

// How to remove Lanna, LannaHalloween, Devcon code? May have to remove references from it first (done).

export class UserData implements UserDataType {
  bio: UserBio;
  socials: UserSocials | undefined;
  portfolio: UserPortfolio | undefined;
  templates: UserTemplates | undefined;
  integrations: UserIntegrations | undefined;
  settings: UserSettings | undefined;

  constructor(data: unknown) {
    // Validate incoming data at runtime during instantiation
    const validated = UserDataSchema.parse(data);

    this.bio = validated.bio;
    this.socials = validated.socials;
    this.portfolio = validated.portfolio;
    this.templates = validated.templates;
    this.integrations = validated.integrations;
    this.settings = validated.settings;
  }

  // Bio
  get getUsername(): string {
    return this.bio.username;
  }

  get getDisplayName(): string {
    return this.bio.displayName;
  }

  get getBio(): string {
    return this.bio.bio;
  }

  get getSignaturePublicKey(): string {
    return this.bio.signaturePublicKey;
  }

  get getEncryptionPublicKey(): string {
    return this.bio.encryptionPublicKey;
  }

  get getPsiPublicKeyLink(): string | undefined {
    return this.bio.psiPublicKeyLink;
  }

  get getPronouns(): string | undefined {
    return this.bio.pronouns;
  }

  // Socials
  get getTwitter(): TwitterData | undefined {
    return this.socials?.twitter;
  }

  get getTelegram(): TelegramData | undefined {
    return this.socials?.telegram;
  }

  get getSignal(): SignalData | undefined {
    return this.socials?.signal;
  }

  get getInstagram(): InstagramData | undefined {
    return this.socials?.instagram;
  }

  get getFarcaster(): FarcasterData | undefined {
    return this.socials?.farcaster;
  }

  get getWhatsapp(): WhatsappData | undefined {
    return this.socials?.whatsapp;
  }

  get getSms(): SMSData | undefined {
    return this.socials?.sms;
  }

  get getEmail(): EmailData | undefined {
    return this.socials?.email;
  }

  // Portfolio
  get getSubstack(): SubstackData | undefined {
    return this.portfolio?.substack;
  }

  get getPersonalWebsites(): PersonalWebsites | undefined {
    return this.portfolio?.personalWebsites;
  }

  // Integrations
  get getStrava(): StravaData | undefined {
    return this.integrations?.strava;
  }

  get getGithub(): GithubData | undefined {
    return this.integrations?.github;
  }

  // Templates
  get getTensionsRating(): TensionsRating | undefined {
    return this.templates?.tensionsRating;
  }

  get getHotTakesRating(): HotTakesRating | undefined {
    return this.templates?.hotTakesRating;
  }

  // -- Vanilla & Spicy
  get getPublicInterests(): interests | undefined {
    return this.templates?.publicInterests;
  }

  get getPrivateInterests(): interests | undefined {
    return this.templates?.privateInterests;
  }

  // -- Lets Shit Talk
  get getDislikesPublicDefender(): dislikes | undefined {
    return this.templates?.dislikesPublicDefender;
  }

  get getDislikesPetPeeves(): dislikes | undefined {
    return this.templates?.dislikesPetPeeves;
  }

  get getDislikesLoveToHate(): dislikes | undefined {
    return this.templates?.dislikesLoveToHate;
  }

  // Settings
  get getSettings(): UserSettings | undefined {
    return this.settings;
  }

  // WIP: Migration in progress to ConnectionSchema
  get getConnectionPSISize(): ConnectionPSISize | undefined {
    // TODO: This should never be used, once migration complete, remove
    return undefined;
  }

  // Deprecated
  get getLanna(): LannaData | undefined {
    // TODO: This should never be used, once migration complete, remove
    return undefined;
  }

  get getLannaHalloween(): LannaHalloweenData | undefined {
    // TODO: This should never be used, once migration complete, remove
    return undefined;
  }

  get getDevcon(): DevconData | undefined {
    // TODO: This should never be used, once migration complete, remove
    return undefined;
  }
}



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

// NOTE: Runtime Serialization. Calling JSON.stringify(instance) converts the object's enumerable properties into
// a raw JSON text string. Functions, methods, and private fields are stripped out during this process. "implements"
// should ensure UserData properties are kept in line with UserDataType, which is the UserData object stored in
// local storage.

export class UserDataV0 implements UserDataV0Type {
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
    const validated = UserDataV0Schema.parse(data);

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

  // Bio
  get getUsername(): string {
    return this.username;
  }

  get getDisplayName(): string {
    return this.displayName;
  }

  get getBio(): string {
    return this.bio;
  }

  get getSignaturePublicKey(): string {
    return this.signaturePublicKey;
  }

  get getEncryptionPublicKey(): string {
    return this.encryptionPublicKey;
  }

  get getPsiPublicKeyLink(): string | undefined {
    return this.psiPublicKeyLink;
  }

  get getPronouns(): string | undefined {
    return this.pronouns;
  }

  // Socials
  get getTwitter(): TwitterData | undefined {
    return this.twitter;
  }

  get getTelegram(): TelegramData | undefined {
    return this.telegram;
  }

  get getSignal(): SignalData | undefined {
    return this.signal;
  }

  get getInstagram(): InstagramData | undefined {
    return this.instagram;
  }

  get getFarcaster(): FarcasterData | undefined {
    return this.farcaster;
  }

  get getWhatsapp(): WhatsappData | undefined {
    return this.whatsapp;
  }

  get getSms(): SMSData | undefined {
    return this.sms;
  }

  get getEmail(): EmailData | undefined {
    return this.email;
  }

  // Portfolio
  get getSubstack(): SubstackData | undefined {
    return this.substack;
  }

  get getPersonalWebsites(): PersonalWebsites | undefined {
    return this.personalWebsites;
  }

  // Integrations
  get getStrava(): StravaData | undefined {
    return this.strava;
  }

  get getGithub(): GithubData | undefined {
    return this.github;
  }

  // Templates
  get getTensionsRating(): TensionsRating | undefined {
    return this.tensionsRating;
  }

  get getHotTakesRating(): HotTakesRating | undefined {
    return this.hotTakesRating;
  }

  // -- Vanilla & Spicy
  get getPublicInterests(): interests | undefined {
    return this.publicInterests;
  }

  get getPrivateInterests(): interests | undefined {
    return this.privateInterests;
  }

  // -- Lets Shit Talk
  get getDislikesPublicDefender(): dislikes | undefined {
    return this.dislikesPublicDefender;
  }

  get getDislikesPetPeeves(): dislikes | undefined {
    return this.dislikesPetPeeves;
  }

  get getDislikesLoveToHate(): dislikes | undefined {
    return this.dislikesLoveToHate;
  }

  // Settings
  get getSettings(): UserSettings | undefined {
    return this.settings;
  }

  // WIP: Migration in progress to ConnectionSchema
  get getConnectionPSISize(): ConnectionPSISize | undefined {
    return this.connectionPSISize;
  }

  // Deprecated
  get getLanna(): LannaData | undefined {
    return this.lanna;
  }

  get getLannaHalloween(): LannaHalloweenData | undefined {
    return this.lannaHalloween;
  }

  get getDevcon(): DevconData | undefined {
    return this.devcon;
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
