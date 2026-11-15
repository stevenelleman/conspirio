import {
  z
} from "zod";
import { nullToUndefined } from "@types";

import {
  HotTakesRating,
  HotTakesRatingSchema,
  TensionsRating,
  TensionsRatingSchema
} from "./lannaData";
import { StravaData, StravaDataSchema } from "./stravaData";
import { GithubData, GithubDataSchema } from "./githubData";
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
import { UserSettings, UserSettingsSchema } from "./settings";
import { upgradeUserDataV0ToV1 } from "./v0";

import { interests, InterestsSchema } from "@/lib/storage/types/user/interests";
import { dislikes, DislikesSchema } from "@/lib/storage/types/user/dislikes";

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

// Versioning: stored UserData carries a version, and older versions are upgraded whenever they are read (backup
// replay, local storage). To change the shape:
//   1. Freeze the current schema in vN.ts with an upgradeUserDataVNToVN+1(raw) function
//   2. Change UserDataSchema below, bump USER_DATA_VERSION, and register the upgrade in USER_DATA_UPGRADES
// Upgrades must not drop data that a migration (see lib/migrations) still reads during replay. Deleting or moving data
// out of UserData belongs in a migration.
export const USER_DATA_VERSION = 1 as const;

const USER_DATA_UPGRADES: Record<number, (raw: unknown) => unknown> = {
  0: upgradeUserDataV0ToV1,
};

// Returns raw data in the latest shape. A missing version means V0. Data from a newer version than this client
// supports is passed through, and fails validation against UserDataSchema.
export const upgradeUserData = (raw: unknown): unknown => {
  const version = (raw as { version?: unknown } | null)?.version;
  let data = raw;
  for (let v = typeof version === "number" ? version : 0; v < USER_DATA_VERSION; v++) {
    data = USER_DATA_UPGRADES[v](data);
  }
  return data;
};

export const UserDataSchema = z.object({
  version: z.literal(USER_DATA_VERSION),
  bio: UserBioSchema,
  socials: nullToUndefined(UserSocialsSchema),
  portfolio: nullToUndefined(UserPortfolioSchema),
  templates: nullToUndefined(UserTemplatesSchema),
  integrations: nullToUndefined(UserIntegrationsSchema),
  settings: nullToUndefined(UserSettingsSchema),

  // WIP: Only set for users who haven't applied MIGRATION_MOVE_PSISIZE_TO_CONNECTION, which moves it to connections
  // and clears it. Replaying old backup logs depends on it, so it stays in the schema.
  connectionPSISize: nullToUndefined(ConnectionPSISizeSchema),
});

export type UserDataType = z.infer<typeof UserDataSchema>;

// Writers patch the latest shape. Each group is merged shallowly, and a key present with an undefined value clears that
// property, e.g. { integrations: { github: undefined } }.
export type UserDataPatch = {
  bio?: Partial<UserBio>;
  socials?: Partial<UserSocials>;
  portfolio?: Partial<UserPortfolio>;
  templates?: Partial<UserTemplates>;
  integrations?: Partial<UserIntegrations>;
  settings?: Partial<UserSettings>;
  connectionPSISize?: ConnectionPSISize;
};

// NOTE: Runtime Serialization. Calling JSON.stringify(instance) converts the object's enumerable properties into
// a raw JSON text string. Functions, methods, and private fields are stripped out during this process. "implements"
// should ensure UserData properties are kept in line with UserDataType, which is the UserData object stored in
// local storage.

export class UserData implements UserDataType {
  version: typeof USER_DATA_VERSION;
  bio: UserBio;
  socials: UserSocials | undefined;
  portfolio: UserPortfolio | undefined;
  templates: UserTemplates | undefined;
  integrations: UserIntegrations | undefined;
  settings: UserSettings | undefined;
  connectionPSISize: ConnectionPSISize | undefined;

  // Accepts any stored version
  constructor(data: unknown) {
    // Validate incoming data at runtime during instantiation
    const validated = UserDataSchema.parse(upgradeUserData(data));

    this.version = validated.version;
    this.bio = validated.bio;
    this.socials = validated.socials;
    this.portfolio = validated.portfolio;
    this.templates = validated.templates;
    this.integrations = validated.integrations;
    this.settings = validated.settings;
    this.connectionPSISize = validated.connectionPSISize;
  }

  withUpdates(patch: UserDataPatch): UserData {
    return new UserData({
      version: this.version,
      bio: { ...this.bio, ...patch.bio },
      socials: { ...this.socials, ...patch.socials },
      portfolio: { ...this.portfolio, ...patch.portfolio },
      templates: { ...this.templates, ...patch.templates },
      integrations: { ...this.integrations, ...patch.integrations },
      settings: { ...this.settings, ...patch.settings },
      connectionPSISize: "connectionPSISize" in patch ? patch.connectionPSISize : this.connectionPSISize,
    });
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
    return this.connectionPSISize;
  }
}

export { UserSettingsSchema, type UserSettings } from "./settings";
export { WireUserDataSchema, type WireUserData, toWireUserData } from "./wire";

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
