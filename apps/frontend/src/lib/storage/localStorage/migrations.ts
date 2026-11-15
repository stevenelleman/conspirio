import { Session, User } from "@/lib/storage/types";
import {
  createMigrationBackfillForConnectionPSISizeUserBackup,
  createMigrationUserDataCleanup1Backup,
} from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";

export const migratePSISizeFromUserToConnection = async (user: User, session: Session): Promise<void> => {
  if (!user.migratedPSISize) {
    const backup = createMigrationBackfillForConnectionPSISizeUserBackup({
      email: user.email,
      password: session.backupMasterPassword,
    });

    await saveBackupAndUpdateStorage({
      user,
      session,
      newBackupData: [backup]
    });
  }

  return;
}

// Converts UserDataV0 to UserData, see BackupEntryType.MIGRATION_USERDATA_CLEANUP1 in processUserBackup
export const migrateUserDataCleanup1 = async (user: User, session: Session): Promise<void> => {
  if (user.migratedPSISize && !user.migratedUserDataCleanup1) {
    const backup = createMigrationUserDataCleanup1Backup({
      email: user.email,
      password: session.backupMasterPassword,
    });

    await saveBackupAndUpdateStorage({
      user,
      session,
      newBackupData: [backup]
    });
  }

  return;
}