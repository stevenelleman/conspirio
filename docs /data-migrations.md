# Data Migrations

## Objective
Record how to change the shape of user data, in particular `UserData` and `User`, without breaking existing users.

## Background: why migrations are unusual here
- User data is encrypted with the user's password and lives on their device. The server only stores an append-only log
  of encrypted backup entries (`INITIAL`, `USER_DATA`, `CONNECTION`, `MIGRATION`, ...). Only the client can read or
  change the data, so every migration is run by the users' own clients.
- On login, `processUserBackup` (`apps/frontend/src/lib/backup/index.ts`) rebuilds the `User` by replaying the log from
  the first entry. Old entries are never rewritten, so **every data shape ever written must stay readable forever**
  (until backup log compaction exists, see Open items).
- Replay is ordered: a migration entry runs against whatever the user looked like at that point in the log.

## Which tool to use

| Change | Tool | Backup entry? |
| --- | --- | --- |
| Reshape `UserData`: rename, nest, add optional fields, drop unused fields | Bump the `UserData` version | No |
| Move data out of `UserData` to another part of `User`, or delete data a migration still needs | Add a migration | Yes, `MIGRATION` |
| Change what other users receive (tap backs, `connection.user`, chips) | Change the wire format | No, but it's a protocol change |

Prefer a version bump. Only add a migration when the change can't be expressed as a pure function of the stored
`UserData` alone.

## Recipe: change the shape of UserData (version bump)
Code: `apps/frontend/src/lib/storage/types/user/userData/`

1. Freeze the current schema: copy `UserDataSchema` into `vN.ts` as `UserDataVNSchema` and never edit it again.
2. In `vN.ts`, write `upgradeUserDataVNToVN+1(raw: unknown): unknown`. Parse with the frozen schema, return the new shape
   with `version: N+1`. Keep it pure: no access to the rest of `User`.
3. In `index.ts`, change `UserDataSchema`, bump `USER_DATA_VERSION`, and register the step in `USER_DATA_UPGRADES`.
4. Update the `UserData` getters, `UserDataPatch`, and `withUpdates` for the new shape. Callers that use getters and
   `withUpdates` usually need no changes.
5. Check `toWireUserData` in `wire.ts` still produces the same wire format.

How it works: `new UserData(raw)` runs `upgradeUserData` and then validates against the latest schema, so V0 → V1 → ... →
latest happens on every read (backup replay, local storage). The next `USER_DATA` write stores the latest shape. No
backup entry, flag, or app-load trigger is needed.

Rules:
- **An upgrade must not drop data that a migration still reads during replay.** Example: V1 keeps `connectionPSISize`
  because replaying an old log upgrades V0 data first and only later reaches the PSI migration entry that reads it.
  Deleting or moving such data belongs in a migration.
- Data from a newer version than the client supports fails validation and throws. Outdated clients recover on reload.

## Recipe: add a migration
Code: `apps/frontend/src/lib/migrations/index.ts`

1. Add a name to `MigrationName`. Names are stored in backups and `user.migrations`, so never rename or remove one.
2. Write the `Migration` object and append it to `MIGRATIONS` (order matters):
   - `requires`: migrations that must be applied first. Replay throws if they aren't.
   - `isApplied(user)`: true if the flag is set **or the user's data doesn't need it**. Base it on data, not on
     `createdAt` cutoffs; then new users skip it automatically and there is no ship date to guess.
   - `apply(user)`: mutate the user. Must be idempotent and read only data already on the user, because the backup entry
     carries only the name.
3. That's it. `runPendingMigrations` (called once on app load in `_app.tsx`) backs up every pending migration in one
   request, and the generic `MIGRATION` case in `processUserBackup` replays it and sets `user.migrations[name] = true`.
4. While some users are unmigrated, code that writes the affected data must branch on
   `isMigrationApplied(user, name)` (see `updateConnectionPSISize` in `lib/psi/refresh.ts`).

## Recipe: change the wire format
Code: `apps/frontend/src/lib/storage/types/user/userData/wire.ts`

`WireUserDataSchema` is a protocol between clients, versioned separately from storage. It is currently identical to the
frozen V0 shape. Clients that haven't updated still parse it, so prefer adding optional fields. For a breaking change,
give it its own schema and a version, and keep accepting the old format. Don't change `UserDataV0Schema` to change it.

## Deploying
- A new `BackupEntryType` needs the backend deployed first: it validates entry types against the shared enum in
  `packages/types`. Version bumps and new migrations don't add entry types, so they're frontend-only.
- Outdated clients throw when replaying an entry type or `UserData` version they don't know. They recover once they
  reload the app.

## Testing
Replay real encrypted logs through `processUserBackup` rather than only unit-testing the upgrade function:
- a log written the way currently shipped clients write it (old `INITIAL` and `USER_DATA` shapes, legacy entry types)
- a stale old-shape `USER_DATA` written after the change (an outdated client)
- a migration entry replayed twice (idempotency), and one before its `requires`
- a newly registered user (no pending migrations)
- `new User(JSON.parse(JSON.stringify(user)))` (local storage round trip)

## Conventions
- Read user data through getters (`user.getBioUsername`, `userData.getGithub`) and write through
  `userData.withUpdates(patch)`. Patches are in the latest shape and merged per group; a key present with `undefined`
  clears it, e.g. `{ integrations: { github: undefined } }`.
- Value vs null vs undefined:
  - Undefined: never set, which can include old schemas moved over to a new schema in a backwards compatible way.
  - Null: explicitly empty.
  - Value: set.

## History
- `MIGRATION_MOVE_PSISIZE_TO_CONNECTION` (shipped): moved `UserData.connectionPSISize` to `connection.PSISize`. Still
  replayed from old logs through the legacy entry type; new backups use `MIGRATION` with
  `migrationMovePSISizeToConnections`.
- `UserData` V0 → V1: flat fields grouped into `bio`, `socials`, `portfolio`, `templates`, `integrations`; deprecated
  `lanna`, `lannaHalloween`, `devcon` dropped. Done as a version bump, no migration entry.

## Open items
- **Backup log compaction:** replace a user's log with a fresh `INITIAL` snapshot of the current `User`. Once every user
  is compacted past a version, its frozen schema and upgrade step can be deleted. Needs backend support.
- **Progress tracking:** there's no count of users left to migrate, since the server can't read the data. The server
  could count `MIGRATION` entries, but their names are encrypted; an unencrypted migration name would make this possible.
