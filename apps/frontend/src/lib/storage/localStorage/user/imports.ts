import { DataImportSource } from "@types";
import { UserDataPatch } from "@/lib/storage/types";
import { getUserAndSession } from "@/lib/storage/localStorage/user/index";
import { createUserDataBackup } from "@/lib/backup";
import { saveBackupAndUpdateStorage } from "@/lib/storage/localStorage/utils";

export const deleteAppImports = async (
  app: DataImportSource
): Promise<void> => {
  const { user, session } = await getUserAndSession();

  if (!user.userData) {
    return;
  }

  // DataImportSource values match the strava and github UserData property names
  const patch: UserDataPatch = { [app]: undefined };
  const updatedUserData = user.userData.withUpdates(patch);

  const importDeletionBackup = createUserDataBackup({
    email: user.email,
    password: session.backupMasterPassword,
    userData: updatedUserData,
  });

  await saveBackupAndUpdateStorage({
    user,
    session,
    newBackupData: [importDeletionBackup],
  });
};