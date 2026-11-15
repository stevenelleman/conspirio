import v0 from "./v0.json";

// FROZEN: one fixture per UserData shape that has ever been stored. Backup logs keep every shape forever, so every
// fixture must stay readable by the current code. Add a fixture whenever the stored shape changes, and never edit an
// existing one: it stands in for data already sitting in users' backups.
//
// Fill every property, so a property that is dropped or renamed by mistake shows up as a test failure.
export interface UserDataFixture {
  version: number;
  data: unknown;
}

export const USER_DATA_FIXTURES: UserDataFixture[] = [
  { version: 0, data: v0 },
];

// The fixture for the shape currently written by the app
export const CURRENT_USER_DATA_FIXTURE = USER_DATA_FIXTURES[USER_DATA_FIXTURES.length - 1];
