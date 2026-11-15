import { Session, User } from "@/lib/storage/types";
import { createMigrationBackup } from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";
import { getPendingMigrations } from "@/lib/migrations";

// Backs up every pending migration in one request. Replay applies them in MIGRATIONS order, so a migration's
// requirements are applied before it even though they're still pending here.
export const runPendingMigrations = async (user: User, session: Session): Promise<void> => {
  const pending = getPendingMigrations(user);
  if (pending.length === 0) {
    return;
  }

  const backups = pending.map((migration) => createMigrationBackup({
    email: user.email,
    password: session.backupMasterPassword,
    name: migration.name,
  }));

  await saveBackupAndUpdateStorage({
    user,
    session,
    newBackupData: backups,
  });
}
