import { z } from "zod";
import type { User } from "@/lib/storage/types";

// Migrations change user data beyond what a UserData version upgrade can do on read, e.g. moving data from UserData to
// another part of User, or deleting data. A pure shape change to UserData doesn't need a migration: bump the UserData
// version instead (see USER_DATA_VERSION).
//
// To add a migration, add a name and append it to MIGRATIONS. It is applied by a BackupEntryType.MIGRATION backup entry,
// so applying it is replayed in order whenever the backup log is processed, and runPendingMigrations backs it up for
// existing users on app load.
//
// Rules:
// - apply must be idempotent and must only read data already on the user object (the backup has no payload)
// - isApplied must be based on the user's data or flag, not on createdAt, so it needs no cutoff date
// - Names are stored in backups and in user.migrations, so never rename or remove one
export enum MigrationName {
  MOVE_PSISIZE_TO_CONNECTIONS = "migrationMovePSISizeToConnections",
}

export const MigrationBackupSchema = z.object({
  name: z.nativeEnum(MigrationName),
});

export type MigrationBackup = z.infer<typeof MigrationBackupSchema>;

export interface Migration {
  name: MigrationName;
  // Migrations that must be applied first
  requires: MigrationName[];
  // True when the migration has been applied, or when the user's data doesn't need it
  isApplied: (user: User) => boolean;
  apply: (user: User) => void;
}

const moveConnectionPSISizeToConnections: Migration = {
  name: MigrationName.MOVE_PSISIZE_TO_CONNECTIONS,
  requires: [],
  // Users without connectionPSISize in UserData, including everyone registered after this migration, have nothing to move
  isApplied: (user) => !!user.migrations?.[MigrationName.MOVE_PSISIZE_TO_CONNECTIONS] || !user.getConnectionPSISize,
  apply: (user) => {
    const connectionPSISize = user.getConnectionPSISize;
    if (!connectionPSISize) {
      return;
    }

    for (const [username, size] of Object.entries(connectionPSISize)) {
      if (user.connections && user.connections[username]) {
        user.connections[username].PSISize = size;
      }
    }

    // Once copied, wipe values
    user.userData = user.userData.withUpdates({ connectionPSISize: undefined });
  },
};

// Applied in this order
export const MIGRATIONS: Migration[] = [
  moveConnectionPSISizeToConnections,
];

const getMigration = (name: MigrationName): Migration => {
  const migration = MIGRATIONS.find((m) => m.name === name);
  if (!migration) {
    throw new Error(`Unknown migration: ${name}`);
  }
  return migration;
};

export const isMigrationApplied = (user: User, name: MigrationName): boolean => {
  return getMigration(name).isApplied(user);
};

// Called by processUserBackup when replaying a migration backup entry
export const applyMigration = (user: User, name: MigrationName): void => {
  const migration = getMigration(name);

  for (const required of migration.requires) {
    if (!isMigrationApplied(user, required)) {
      throw new Error(`Migration ${name} applied before required migration ${required}`);
    }
  }

  migration.apply(user);

  // Spread to keep the flags of other migrations
  user.migrations = {
    ...user.migrations,
    [name]: true,
  };
};

export const getPendingMigrations = (user: User): Migration[] => {
  return MIGRATIONS.filter((migration) => !migration.isApplied(user));
};
