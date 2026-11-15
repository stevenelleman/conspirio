import { ImportDataType } from "@types";
import { UserData, UserDataV0 } from "@/lib/storage/types";

// Add import types to UserData, backup is already provided for any UserData changes
export const updateUserDataFromImportData = async (
  userData: UserData | UserDataV0,
  type: ImportDataType,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any
): Promise<UserData | UserDataV0> => {
  switch (type) {
    case ImportDataType.STRAVA_PREVIOUS_MONTH_RUN_DISTANCE:
      const value1: number = data;
      return userData.withUpdates({
        strava: {
          previousMonthRunDistance: {
            value: value1,
            lastUpdated: new Date(),
          },
        },
      });
    case ImportDataType.GITHUB_LANNA_CONTRIBUTIONS:
      const value2: number = data;
      return userData.withUpdates({
        github: {
          ...userData.getGithub,
          lannaCommits: {
            value: value2,
            lastUpdated: new Date()
          },
        },
      });
    case ImportDataType.GITHUB_CONTRIBUTIONS_LAST_YEAR:
      const value3: number = data;
      return userData.withUpdates({
        github: {
          ...userData.getGithub,
          annualCommits: {
            value: value3,
            lastUpdated: new Date()
          },
        },
      });
    case ImportDataType.GITHUB_STARRED_REPOS:
      let value4: string[] = data;
      if (!value4) {
        value4 = [];
      }
      return userData.withUpdates({
        github: {
          ...userData.getGithub,
          starredRepos: {
            value: value4,
            lastUpdated: new Date()
          },
        },
      });
    case ImportDataType.GITHUB_PROGRAMMING_LANGUAGES:
      let value5: Record<string, string[]> = data;
      if (!value5) {
        value5 = {};
      }
      return userData.withUpdates({
        github: {
          ...userData.getGithub,
          programmingLanguages: {
            value: value5,
            lastUpdated: new Date()
          },
        },
      });
    default:
      return userData;
  }
};