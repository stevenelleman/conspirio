import { describe, expect, it } from "vitest";
import { BackupEntryType } from "@types";
import { User } from "@/lib/storage/types";
import {
  buildLog,
  initialEntry,
  LogEntry,
  makeStoredUser,
  replay,
  toStoredJson,
  toStoredUser,
} from "@/test/backupLog";

// Every migration must pass the shared tests below. To cover a new migration, add a case to MIGRATION_CASES; its own
// behavior goes in a describe block further down.
interface MigrationCase {
  name: string;
  // The backup entry that applies the migration
  entry: LogEntry;
  isApplied: (user: User) => boolean;
  // A log for an existing user whose data needs the migration
  legacyLog: () => LogEntry[];
  // A log for a user registered after the migration shipped, who must never need it
  newUserLog: () => LogEntry[];
}

const PSI_MIGRATION_SHIPPED_AT = new Date("2026-11-05T00:00:00.000Z");

const MIGRATION_CASES: MigrationCase[] = [
  {
    name: "migrationMovePSISizeToConnections",
    entry: { type: BackupEntryType.MIGRATION_MOVE_PSISIZE_TO_CONNECTION, payload: "" },
    isApplied: (user) => user.migratedPSISize,
    // The v0 fixture has connectionPSISize { bob: 3 }
    legacyLog: () => [initialEntry(makeStoredUser(), new Date("2026-01-01T00:00:00.000Z"))],
    newUserLog: () => {
      const stored = makeStoredUser();
      return [
        initialEntry(
          { ...stored, userData: { ...(stored.userData as object), connectionPSISize: undefined } },
          new Date(PSI_MIGRATION_SHIPPED_AT.getTime() + 24 * 60 * 60 * 1000),
        ),
      ];
    },
  },
];

describe.each(MIGRATION_CASES)("migration $name", (migration) => {
  it("is not applied for an existing user who needs it", () => {
    const user = replay(buildLog(migration.legacyLog()));
    expect(migration.isApplied(user)).toBe(false);
  });

  it("is applied after its backup entry is replayed", () => {
    const user = replay(buildLog([...migration.legacyLog(), migration.entry]));
    expect(migration.isApplied(user)).toBe(true);
  });

  it("is idempotent", () => {
    const once = replay(buildLog([...migration.legacyLog(), migration.entry]));
    const twice = replay(buildLog([...migration.legacyLog(), migration.entry, migration.entry]));
    expect(toStoredJson(twice)).toEqual(toStoredJson(once));
  });

  it("stays applied after a local storage round trip", () => {
    const user = replay(buildLog([...migration.legacyLog(), migration.entry]));
    expect(migration.isApplied(toStoredUser(user))).toBe(true);
  });

  it("is never needed by a newly registered user", () => {
    const user = replay(buildLog(migration.newUserLog()));
    expect(migration.isApplied(user)).toBe(true);
  });
});

describe("migrationMovePSISizeToConnections", () => {
  const migrate = (stored: Record<string, unknown>) =>
    replay(buildLog([
      initialEntry(stored, new Date("2026-01-01T00:00:00.000Z")),
      { type: BackupEntryType.MIGRATION_MOVE_PSISIZE_TO_CONNECTION, payload: "" },
    ]));

  it("moves each size to its connection and clears it from userData", () => {
    const user = migrate(makeStoredUser());

    expect(user.connections.bob.PSISize).toBe(3);
    expect(user.userData.connectionPSISize).toBeUndefined();
  });

  it("skips sizes for users who aren't connections", () => {
    const stored = makeStoredUser();
    const user = migrate({ ...stored, userData: { ...(stored.userData as object), connectionPSISize: { bob: 3, carol: 7 } } });

    expect(user.connections.bob.PSISize).toBe(3);
    expect(user.connections.carol).toBeUndefined();
  });

  it("is a no-op apart from the flag when there is nothing to move", () => {
    const stored = makeStoredUser();
    const user = migrate({ ...stored, userData: { ...(stored.userData as object), connectionPSISize: undefined } });

    expect(user.connections.bob.PSISize).toBeUndefined();
    expect(user.migrations?.migrationMovePSISizeToConnections).toBe(true);
  });
});
