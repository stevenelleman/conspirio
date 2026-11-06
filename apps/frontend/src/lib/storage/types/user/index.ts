import { z } from "zod";
import { UnregisteredUserDataSchema, UserData, UserDataSchema } from "./userData";
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

export const UserDataMigrationsSchema = z.object({
  migrationMovePSISizeToConnections: nullToUndefined(z.boolean().nullable()),
})

export type UserDataMigrations = z.infer<typeof UserDataMigrationsSchema>;

export const UserSchema = z.object({
  email: z.string(), // Email here is actually used as a backup salt for backwards compatibility reasons.
  signaturePrivateKey: z.string(),
  encryptionPrivateKey: z.string(),
  serializedPsiPrivateKey: nullToUndefined(z.string()),
  lastMessageFetchedAt: z.coerce.date(),
  createdAt: nullToUndefined(z.coerce.date()),

  userData: UserDataSchema,
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

  userData: UserData;
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
    // 4. Validate incoming data at runtime during instantiation
    const validated = UserSchema.parse(data);

    this.email = validated.email;

    this.signaturePrivateKey = validated.signaturePrivateKey;
    this.encryptionPrivateKey = validated.encryptionPrivateKey;
    this.serializedPsiPrivateKey = validated.serializedPsiPrivateKey;
    this.lastMessageFetchedAt = validated.lastMessageFetchedAt;
    this.createdAt = validated.createdAt;

    this.userData = validated.userData;
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
