import { z } from "zod";
import {
  UnregisteredUserDataSchema,
  UserDataV0Schema,
  UserDataV0,
  UserDataSchema,
  UserData,
  parseUserData,
} from "./userData";
import { Chip, ChipSchema } from "./chip";
import { Connection, ConnectionSchema } from "./connection";
import { ActivitySchema, Activity } from "./activity";
import {
  AccessToken,
  AccessTokenSchema,
  nullToUndefined,
  UnregisteredUserBackupSchema
} from "@types";
import { LocationTaps, LocationTapsSchema } from "./location";
import { EdgeBackup, EdgeBackupSchema } from "./edge";
import { interests } from "@/lib/storage/types/user/interests";
import { dislikes } from "@/lib/storage/types/user/dislikes";
import {
  TwitterData,
  TelegramData,
  SignalData,
  InstagramData,
  FarcasterData,
  WhatsappData,
  SMSData,
  EmailData,
} from "@/lib/storage/types/user/userData/socials";
import { PersonalWebsites, SubstackData } from "@/lib/storage/types/user/userData/portfolio";
import { StravaData } from "@/lib/storage/types/user/userData/stravaData";
import { GithubData } from "@/lib/storage/types/user/userData/githubData";
import { HotTakesRating, LannaData, TensionsRating } from "@/lib/storage/types/user/userData/lannaData";
import { LannaHalloweenData } from "@/lib/storage/types/user/userData/lannaHalloweenData";
import { DevconData } from "@/lib/storage/types/user/userData/devconData";
import { ConnectionPSISize } from "@/lib/storage/types/user/userData/psiSizeData";
import { UserSettings } from "@/lib/storage/types/user/userData";

export const UserDataMigrationsSchema = z.object({
  migrationMovePSISizeToConnections: nullToUndefined(z.boolean().nullable()),
  migrationUserDataCleanup1: nullToUndefined(z.boolean().nullable()),
})

export type UserDataMigrations = z.infer<typeof UserDataMigrationsSchema>;

export const UserSchema = z.object({
  email: z.string(), // Email here is actually used as a backup salt for backwards compatibility reasons.
  signaturePrivateKey: z.string(),
  encryptionPrivateKey: z.string(),
  serializedPsiPrivateKey: nullToUndefined(z.string()),
  lastMessageFetchedAt: z.coerce.date(),
  createdAt: nullToUndefined(z.coerce.date()),

  // NOTE: The UserSchema uses UserDataSchema
  // Either version may be stored until MIGRATION_USERDATA_CLEANUP1 is applied. UserDataSchema goes first: V1 data
  // fails UserDataV0Schema (no top-level username) and V0 data fails UserDataSchema (bio is a string).
  userData: z.union([UserDataSchema, UserDataV0Schema]),
  chips: z.array(ChipSchema),
  connections: z.record(z.string(), ConnectionSchema),
  locations: nullToUndefined(z.record(z.string(), LocationTapsSchema)),
  activities: z.array(ActivitySchema),
  oauth: nullToUndefined(z.record(z.string(), AccessTokenSchema)),

  // Tap graph attributes -- NOTE: tapGraphEnabled should be moved to UserSettings at some point
  tapGraphEnabled: nullToUndefined(z.boolean().nullable()),

  // NOTE: Would love to clean this up -- put into a "features" object?
  edgesBackfilledForUsersWithEnabledFeature: nullToUndefined(z.boolean().nullable()),
  edges: nullToUndefined(z.array(EdgeBackupSchema)),

  // Migrations
  migrations: nullToUndefined(UserDataMigrationsSchema),
});

export type UserType = z.output<typeof UserSchema>;

export class User implements UserType {
  email: string; // Email here is actually used as a backup salt for backwards compatibility reasons.

  signaturePrivateKey: string;
  encryptionPrivateKey: string;
  serializedPsiPrivateKey: string | undefined;
  lastMessageFetchedAt: Date;
  createdAt: Date | undefined;

  // NOTE: The User class also uses the UserData class
  userData: UserData | UserDataV0;
  chips: Chip[];
  connections: Record<string, Connection>;
  locations: Record<string, LocationTaps> | undefined;
  activities: Activity[];
  oauth: Record<string, AccessToken> | undefined;

  // Tap graph attributes -- NOTE: tapGraphEnabled should be moved to UserSettings at some point
  tapGraphEnabled: boolean | undefined;

  // NOTE: Would love to clean this up -- put into a "features" object?
  edgesBackfilledForUsersWithEnabledFeature: boolean | undefined;
  edges: EdgeBackup[] | undefined;

  migrations: UserDataMigrations | undefined;

  constructor(data: unknown) {
    // Validate incoming data at runtime during instantiation
    const validated = UserSchema.parse(data);

    this.email = validated.email;

    this.signaturePrivateKey = validated.signaturePrivateKey;
    this.encryptionPrivateKey = validated.encryptionPrivateKey;
    this.serializedPsiPrivateKey = validated.serializedPsiPrivateKey;
    this.lastMessageFetchedAt = validated.lastMessageFetchedAt;
    this.createdAt = validated.createdAt;

    this.userData = parseUserData(validated.userData, !!validated.migrations?.migrationUserDataCleanup1);
    this.chips = validated.chips;
    this.connections = validated.connections;
    this.locations = validated.locations;
    this.activities = validated.activities;
    this.oauth = validated.oauth;

    // Tap graph attributes -- NOTE: tapGraphEnabled should be moved to UserSettings at some point
    this.tapGraphEnabled = validated.tapGraphEnabled;

    // NOTE: Would love to clean this up -- put into a "features" object?
    this.edgesBackfilledForUsersWithEnabledFeature = validated.edgesBackfilledForUsersWithEnabledFeature;
    this.edges = validated.edges;

    this.migrations = validated.migrations;
  }

  get migratedPSISize(): boolean {
    return !!((this.createdAt && this.createdAt > new Date("2026-11-05")) || (this.migrations && this.migrations.migrationMovePSISizeToConnections));
  }

  get migratedUserDataCleanup1(): boolean {
    // TODO: any way to factor in migrationMovePSISizeToConnections? would love to ensure that it's also true by
    //  this stage
    return !!((this.createdAt && this.createdAt > new Date("2026-11-14")) || (this.migrations && this.migrations.migrationUserDataCleanup1));
  }

  // getters for UserData values

  // Bio
  get getBioUsername(): string {
    return this.userData.getUsername;
  }

  get getBioDisplayName(): string {
    return this.userData.getDisplayName;
  }

  get getBio(): string {
    return this.userData.getBio;
  }

  get getBioSignaturePublicKey(): string {
    return this.userData.getSignaturePublicKey;
  }

  get getBioEncryptionPublicKey(): string {
    return this.userData.getEncryptionPublicKey;
  }

  get getBioPsiPublicKeyLink(): string | undefined {
    return this.userData.getPsiPublicKeyLink;
  }

  get getBioPronouns(): string | undefined {
    return this.userData.getPronouns;
  }

  // Socials
  get getSocialTwitter(): TwitterData | undefined {
    return this.userData.getTwitter;
  }

  get getSocialTelegram(): TelegramData | undefined {
    return this.userData.getTelegram;
  }

  get getSocialSignal(): SignalData | undefined {
    return this.userData.getSignal;
  }

  get getSocialInstagram(): InstagramData | undefined {
    return this.userData.getInstagram;
  }

  get getSocialFarcaster(): FarcasterData | undefined {
    return this.userData.getFarcaster;
  }

  get getSocialWhatsapp(): WhatsappData | undefined {
    return this.userData.getWhatsapp;
  }

  get getSocialSms(): SMSData | undefined {
    return this.userData.getSms;
  }

  get getSocialEmail(): EmailData | undefined {
    return this.userData.getEmail;
  }

  // Portfolio
  get getPortfolioSubstack(): SubstackData | undefined {
    return this.userData.getSubstack;
  }

  get getPortfolioPersonalWebsites(): PersonalWebsites | undefined {
    return this.userData.getPersonalWebsites;
  }

  // Integrations
  get getIntegrationStrava(): StravaData | undefined {
    return this.userData.getStrava;
  }

  get getIntegrationGithub(): GithubData | undefined {
    return this.userData.getGithub;
  }

  // Templates
  get getTemplateTensionsRating(): TensionsRating | undefined {
    return this.userData.getTensionsRating;
  }

  get getTemplateHotTakesRating(): HotTakesRating | undefined {
    return this.userData.getHotTakesRating;
  }

  // -- Vanilla & Spicy
  get getTemplatePublicInterests(): interests | undefined {
    return this.userData.getPublicInterests;
  }

  get getTemplatePrivateInterests(): interests | undefined {
    return this.userData.getPrivateInterests;
  }

  // -- Lets Shit Talk
  get getTemplateDislikesPublicDefender(): dislikes | undefined {
    return this.userData.getDislikesPublicDefender;
  }

  get getTemplateDislikesPetPeeves(): dislikes | undefined {
    return this.userData.getDislikesPetPeeves;
  }

  get getTemplateDislikesLoveToHate(): dislikes | undefined {
    return this.userData.getDislikesLoveToHate;
  }

  // Settings
  get getSettings(): UserSettings | undefined {
    return this.userData.getSettings;
  }

  // WIP: Migration in progress to ConnectionSchema
  get getConnectionPSISize(): ConnectionPSISize | undefined {
    return this.userData.getConnectionPSISize;
  }

  // Deprecated
  get getDeprecatedLanna(): LannaData | undefined {
    return this.userData.getLanna;
  }

  get getDeprecatedLannaHalloween(): LannaHalloweenData | undefined {
    return this.userData.getLannaHalloween;
  }

  get getDeprecatedDevcon(): DevconData | undefined {
    return this.userData.getDevcon;
  }
}

export const UnregisteredUserSchema = z.object({
  signaturePrivateKey: z.string(),
  encryptionPrivateKey: z.string(),
  lastMessageFetchedAt: z.coerce.date(),
  userData: UnregisteredUserDataSchema,
  connections: z.record(z.string(), ConnectionSchema),
  locations: nullToUndefined(z.record(z.string(), LocationTapsSchema)),
  activities: z.array(ActivitySchema),

  // Unique field for unregistered user
  backups: z.array(UnregisteredUserBackupSchema),
});

export type UnregisteredUser = z.infer<typeof UnregisteredUserSchema>;

export * from "./userData";
export * from "./chip";
export * from "./connection";
export * from "./activity";
export * from "./oauth";
export * from "./location";
export * from "./edge";
