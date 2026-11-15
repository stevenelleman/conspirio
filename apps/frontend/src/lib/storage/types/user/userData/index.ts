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

// Getters shared by UserData and UserDataV0, so callers can read from either version during the migration.
export interface UserDataGetters {
  // Bio
  readonly getUsername: string;
  readonly getDisplayName: string;
  readonly getBio: string;
  readonly getSignaturePublicKey: string;
  readonly getEncryptionPublicKey: string;
  readonly getPsiPublicKeyLink: string | undefined;
  readonly getPronouns: string | undefined;

  // Socials
  readonly getTwitter: TwitterData | undefined;
  readonly getTelegram: TelegramData | undefined;
  readonly getSignal: SignalData | undefined;
  readonly getInstagram: InstagramData | undefined;
  readonly getFarcaster: FarcasterData | undefined;
  readonly getWhatsapp: WhatsappData | undefined;
  readonly getSms: SMSData | undefined;
  readonly getEmail: EmailData | undefined;

  // Portfolio
  readonly getSubstack: SubstackData | undefined;
  readonly getPersonalWebsites: PersonalWebsites | undefined;

  // Integrations
  readonly getStrava: StravaData | undefined;
  readonly getGithub: GithubData | undefined;

  // Templates
  readonly getTensionsRating: TensionsRating | undefined;
  readonly getHotTakesRating: HotTakesRating | undefined;
  readonly getPublicInterests: interests | undefined;
  readonly getPrivateInterests: interests | undefined;
  readonly getDislikesPublicDefender: dislikes | undefined;
  readonly getDislikesPetPeeves: dislikes | undefined;
  readonly getDislikesLoveToHate: dislikes | undefined;

  // Settings
  readonly getSettings: UserSettings | undefined;

  // WIP: Migration in progress to ConnectionSchema
  readonly getConnectionPSISize: ConnectionPSISize | undefined;

  // Deprecated
  readonly getLanna: LannaData | undefined;
  readonly getLannaHalloween: LannaHalloweenData | undefined;
  readonly getDevcon: DevconData | undefined;
}

// Writers describe changes with the flat V0 property names, and each class applies them in its own shape. A key that is
// present with an undefined value clears that property.
export type UserDataPatch = Partial<Omit<UserDataV0Type, "connectionPSISize" | "lanna" | "lannaHalloween" | "devcon">>;

type UserDataGroup = "bio" | "socials" | "portfolio" | "templates" | "integrations" | "settings";

const USER_DATA_PATCH_GROUPS: Record<keyof UserDataPatch, UserDataGroup> = {
  username: "bio",
  displayName: "bio",
  bio: "bio",
  signaturePublicKey: "bio",
  encryptionPublicKey: "bio",
  psiPublicKeyLink: "bio",
  pronouns: "bio",
  twitter: "socials",
  telegram: "socials",
  signal: "socials",
  instagram: "socials",
  farcaster: "socials",
  whatsapp: "socials",
  sms: "socials",
  email: "socials",
  substack: "portfolio",
  personalWebsites: "portfolio",
  strava: "integrations",
  github: "integrations",
  tensionsRating: "templates",
  hotTakesRating: "templates",
  publicInterests: "templates",
  privateInterests: "templates",
  dislikesPublicDefender: "templates",
  dislikesPetPeeves: "templates",
  dislikesLoveToHate: "templates",
  settings: "settings",
};

export class UserData implements UserDataType, UserDataGetters {
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

  // MIGRATION_USERDATA_CLEANUP1: map the flat V0 shape into the nested V1 shape. connectionPSISize and the deprecated
  // lanna, lannaHalloween, devcon properties are intentionally dropped.
  static fromV0(v0: UserDataV0): UserData {
    return new UserData({
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
    });
  }

  withUpdates(patch: UserDataPatch): UserData {
    const groups: Record<Exclude<UserDataGroup, "settings">, Record<string, unknown>> = {
      bio: { ...this.bio },
      socials: { ...this.socials },
      portfolio: { ...this.portfolio },
      templates: { ...this.templates },
      integrations: { ...this.integrations },
    };
    let settings = this.settings;

    for (const [key, value] of Object.entries(patch)) {
      const group = USER_DATA_PATCH_GROUPS[key as keyof UserDataPatch];
      if (group === "settings") {
        settings = value as UserSettings | undefined;
      } else {
        groups[group][key] = value;
      }
    }

    return new UserData({ ...groups, settings });
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

export class UserDataV0 implements UserDataV0Type, UserDataGetters {
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

  withUpdates(patch: UserDataPatch): UserDataV0 {
    return new UserDataV0({ ...this, ...patch });
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

// Accepts either stored version. The shape decides the version (V0 bio is a string, V1 bio is an object) rather than the
// migration flag, because the flag isn't known yet when an INITIAL backup or local storage is parsed. If the user has
// already migrated, V0 data (e.g. written by a stale client) is upgraded immediately.
export const parseUserData = (raw: unknown, migrated: boolean): UserData | UserDataV0 => {
  const bio = (raw as { bio?: unknown } | null)?.bio;
  if (typeof bio === "object" && bio !== null) {
    return new UserData(raw);
  }

  const v0 = new UserDataV0(raw);
  return migrated ? UserData.fromV0(v0) : v0;
};

// Flat V0 shape built from either version. Data shared with other users (tap backs, chips) and components that also
// render connections' data still use this shape.
export const userDataToV0Type = (userData: UserDataGetters): UserDataV0Type => {
  return {
    // Bio
    username: userData.getUsername,
    displayName: userData.getDisplayName,
    bio: userData.getBio,
    signaturePublicKey: userData.getSignaturePublicKey,
    encryptionPublicKey: userData.getEncryptionPublicKey,
    psiPublicKeyLink: userData.getPsiPublicKeyLink,
    pronouns: userData.getPronouns,

    // Socials
    twitter: userData.getTwitter,
    telegram: userData.getTelegram,
    signal: userData.getSignal,
    instagram: userData.getInstagram,
    farcaster: userData.getFarcaster,
    whatsapp: userData.getWhatsapp,
    sms: userData.getSms,
    email: userData.getEmail,

    // Portfolio
    substack: userData.getSubstack,
    personalWebsites: userData.getPersonalWebsites,

    // Integrations
    strava: userData.getStrava,
    github: userData.getGithub,

    // Templates
    tensionsRating: userData.getTensionsRating,
    hotTakesRating: userData.getHotTakesRating,
    publicInterests: userData.getPublicInterests,
    privateInterests: userData.getPrivateInterests,
    dislikesPublicDefender: userData.getDislikesPublicDefender,
    dislikesPetPeeves: userData.getDislikesPetPeeves,
    dislikesLoveToHate: userData.getDislikesLoveToHate,

    // Settings
    settings: userData.getSettings,

    // WIP: Migration in progress to ConnectionSchema
    connectionPSISize: userData.getConnectionPSISize,

    // Deprecated
    lanna: userData.getLanna,
    lannaHalloween: userData.getLannaHalloween,
    devcon: userData.getDevcon,
  };
};

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
