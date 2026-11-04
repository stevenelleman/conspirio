import { Session, User } from "@/lib/storage/types";
import {
  createMigrationBackfillForConnectionPSISizeUserBackup
} from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";


export const migratePSISizeFromUserToConnection = async (user: User, session: Session): Promise<void> => {
  if (!user.migrations?.migrationMovePSISizeToConnections) {
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