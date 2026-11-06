import { Session, UserType } from "@/lib/storage/types";
import {
  createMigrationBackfillForConnectionPSISizeUserBackup
} from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";

export function migratedPSISize(user: UserType): boolean {
  return !!((user.createdAt && user.createdAt > new Date("2026-11-05")) || (user.migrations && user.migrations.migrationMovePSISizeToConnections));
}

export const migratePSISizeFromUserToConnection = async (user: UserType, session: Session): Promise<void> => {
  if (!migratedPSISize(user)) {
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