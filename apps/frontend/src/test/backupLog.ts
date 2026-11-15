import { BackupData, BackupEntryType } from "@types";
import { processUserBackup } from "@/lib/backup";
import { encryptBackupString } from "@/lib/crypto/backup";
import { User } from "@/lib/storage/types";
import { CURRENT_USER_DATA_FIXTURE } from "@/lib/storage/types/user/userData/__fixtures__";

// Helpers for building real encrypted backup logs and replaying them through processUserBackup, the same way login does.

export const TEST_EMAIL = "test@example.com";
export const TEST_PASSWORD = "test-password";

export interface LogEntry {
  type: BackupEntryType;
  // Strings are stored as is (e.g. "" for entries without a payload), anything else is JSON.stringify'd
  payload: unknown;
  // Defaults to one second after the previous entry
  clientCreatedAt?: Date;
}

export const initialEntry = (user: unknown, clientCreatedAt?: Date): LogEntry => ({
  type: BackupEntryType.INITIAL,
  payload: user,
  clientCreatedAt,
});

export const userDataEntry = (userData: unknown): LogEntry => ({
  type: BackupEntryType.USER_DATA,
  payload: userData,
});

// Encrypts each entry and gives it increasing clientCreatedAt and submittedAt dates, like the server would
export const buildLog = (entries: LogEntry[], start: Date = new Date("2026-01-01T00:00:00.000Z")): BackupData[] => {
  let time = start.getTime();

  return entries.map(({ type, payload, clientCreatedAt }) => {
    const { authenticationTag, iv, encryptedData } = encryptBackupString({
      backup: typeof payload === "string" ? payload : JSON.stringify(payload),
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    time += 1000;

    return {
      authenticationTag,
      iv,
      encryptedData,
      backupEntryType: type,
      clientCreatedAt: clientCreatedAt ?? new Date(time),
      submittedAt: new Date(time),
    };
  });
};

export const replay = (log: BackupData[], existingUser?: User, previousSubmittedAt?: Date): User => {
  return processUserBackup({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    backupData: log,
    existingUser,
    previousSubmittedAt,
  }).user;
};

// Serializes and parses a user the way local storage does
export const toStoredUser = (user: User): User => new User(JSON.parse(JSON.stringify(user)));

// Comparable form of a user: what would be stored
export const toStoredJson = (value: unknown): unknown => JSON.parse(JSON.stringify(value));

// A user as stored in an INITIAL entry, with a connection to "bob". Override any property, e.g. userData.
export const makeStoredUser = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  email: TEST_EMAIL,
  signaturePrivateKey: "sig-private-key",
  encryptionPrivateKey: "enc-private-key",
  lastMessageFetchedAt: "2026-01-01T00:00:00.000Z",
  userData: CURRENT_USER_DATA_FIXTURE.data,
  chips: [],
  connections: {
    bob: {
      user: {
        username: "bob",
        displayName: "Bob",
        bio: "",
        signaturePublicKey: "sig-public-key-bob",
        encryptionPublicKey: "enc-public-key-bob",
      },
      taps: [],
    },
  },
  activities: [],
  ...overrides,
});
