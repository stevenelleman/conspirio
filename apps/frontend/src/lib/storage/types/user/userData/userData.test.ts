import { describe, expect, it } from "vitest";
import { UserDataSchema } from "@/lib/storage/types";
import { toStoredJson } from "@/test/backupLog";
import { USER_DATA_FIXTURES } from "./__fixtures__";

describe.each(USER_DATA_FIXTURES)("stored UserData v$version", ({ data }) => {
  it("is readable by the current schema", () => {
    expect(() => UserDataSchema.parse(data)).not.toThrow();
  });

  it("keeps every property when read and stored again", () => {
    expect(toStoredJson(UserDataSchema.parse(data))).toEqual(data);
  });
});
