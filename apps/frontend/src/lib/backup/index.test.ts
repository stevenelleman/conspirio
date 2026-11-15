import { describe, expect, it } from "vitest";
import { BackupEntryType } from "@types";
import { USER_DATA_FIXTURES } from "@/lib/storage/types/user/userData/__fixtures__";
import {
  buildLog,
  initialEntry,
  makeStoredUser,
  replay,
  toStoredJson,
  toStoredUser,
  userDataEntry,
} from "@/test/backupLog";

describe("processUserBackup", () => {
  it("rebuilds the user from an INITIAL entry", () => {
    const createdAt = new Date("2026-03-01T00:00:00.000Z");
    const user = replay(buildLog([initialEntry(makeStoredUser(), createdAt)]));

    expect(user.userData.username).toBe("alice");
    expect(user.connections.bob.user.username).toBe("bob");
    // createdAt comes from the INITIAL entry's client clock, not from the stored user
    expect(user.createdAt).toEqual(createdAt);
  });

  it("replaces userData with each USER_DATA entry", () => {
    const stored = makeStoredUser();
    const user = replay(buildLog([
      initialEntry(stored),
      userDataEntry({ ...(stored.userData as object), displayName: "First" }),
      userDataEntry({ ...(stored.userData as object), displayName: "Second" }),
    ]));

    expect(user.userData.displayName).toBe("Second");
  });

  it("continues from an existing user with only new entries, like appendBackupData", () => {
    const stored = makeStoredUser();
    const log = buildLog([
      initialEntry(stored),
      userDataEntry({ ...(stored.userData as object), displayName: "Appended" }),
    ]);

    const existingUser = replay(log.slice(0, 1));
    const user = replay(log.slice(1), existingUser, log[0].submittedAt);

    expect(user.userData.displayName).toBe("Appended");
  });

  it("survives a local storage round trip", () => {
    const user = replay(buildLog([initialEntry(makeStoredUser())]));

    expect(toStoredJson(toStoredUser(user))).toEqual(toStoredJson(user));
  });

  describe.each(USER_DATA_FIXTURES)("with stored UserData v$version", ({ data }) => {
    it("replays it from an INITIAL entry", () => {
      const user = replay(buildLog([initialEntry(makeStoredUser({ userData: data }))]));

      expect(toStoredJson(user.userData)).toEqual(data);
    });

    it("replays it from a USER_DATA entry", () => {
      const user = replay(buildLog([initialEntry(makeStoredUser()), userDataEntry(data)]));

      expect(toStoredJson(user.userData)).toEqual(data);
    });
  });

  describe("rejects invalid logs", () => {
    it("throws on an empty log", () => {
      expect(() => replay([])).toThrow("No backup data found");
    });

    it("throws when the first entry isn't INITIAL", () => {
      const stored = makeStoredUser();
      expect(() => replay(buildLog([userDataEntry(stored.userData)]))).toThrow("INITIAL backup entry not found");
    });

    it("throws on a second INITIAL entry", () => {
      const log = buildLog([initialEntry(makeStoredUser()), initialEntry(makeStoredUser())]);
      expect(() => replay(log)).toThrow("INITIAL backup entry found for existing user");
    });

    it("throws when entries are out of order", () => {
      const log = buildLog([initialEntry(makeStoredUser()), userDataEntry(makeStoredUser().userData)]);
      expect(() => replay([log[0], { ...log[1], submittedAt: new Date(0) }])).toThrow("Backup data is out of order");
    });

    it("throws on an unknown entry type", () => {
      const log = buildLog([initialEntry(makeStoredUser()), { type: "UNKNOWN" as BackupEntryType, payload: "" }]);
      expect(() => replay(log)).toThrow("Invalid backup entry type");
    });

    it("throws when an entry fails decryption", () => {
      const log = buildLog([initialEntry(makeStoredUser())]);
      expect(() => replay(log.map((entry) => ({ ...entry, authenticationTag: "00".repeat(16) })))).toThrow();
    });
  });
});
