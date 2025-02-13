# Conspirio

## Dev Setup

From root:

- Create local postgres database, set name to be `connections_test` and port to `5432` (the default).
- `CREATE DATABASE connections_test;`
- `pnpm install`

Frontend:

- `cd apps/frontend`
- Copy over .env.example into .env and update vars
  - Set `NEXT_PUBLIC_API_URL` to point to the backend, defaults to `http://localhost:8080/api`
- `source .env`
- `pnpm run dev`

Backend:

- In a separate terminal, `cd apps/backend`
- Copy over .env.example into .env and update vars
  - Set `FRONTEND_URL` to point to the frontend (for cors), defaults to `http://localhost:3000`
  - Set `DATABASE_URL` to point to the database, for local dev this defaults to `postgresql://postgres:postgres@localhost:5432/connections_test?schema=public`
  - Set `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AWS_SES_SENDER_EMAIL` to correspond to IAM credentials for AWS Simple Email Service
- `source .env`
- Run `pnpm prisma migrate dev` to run db migrations
- Run `pnpm prisma generate` to generate the prisma client
- `pnpm run dev`

Telegram:

- Create a bot on Telegram using BotFather (https://t.me/BotFather) to test with
- In `apps/backend/.env`:
  - Set `TELEGRAM_BOT_API` to the bot api key
  - Set `TELEGRAM_BOT_USERNAME` to be the bot username
  - Set `TELEGRAM_BOT_START_DELAY_MS` to the delay in ms before starting the bot, defaults to 0, mostly relevant in prod

Testing:

- This is meant to be a mobile browser app. You can either test this on mobile browser by connecting it to localhost or using ngrok/similar service, or test from a desktop web browser using mobile view
- This app does not work in incognito mode
- Make sure you've seeded database with testing UserChip values: `pnpm run seed`
  - To register, visit: http://localhost:3000/tap?chipId=TEST001 and go through registration flow. `TEST002`- `TEST005` are also available for testing.
- Once logged in, to tap another account there are two steps:
  - Create new account, visit http://localhost:3000/tap?chipId=TEST002 in a different browser
  - To tap a connection, visit http://localhost:3000/tap?chipId=TEST002 from your first browser, where the chipId corresponds to the other existing account
- After a full deletion sometimes old local storage values will still be populating site, visit http://localhost:3000/logout to logout or delete the local storage corresponding to localhost:3000.
- To clear the database, run `pnpm prisma migrate reset` from apps/backend. NOTE THIS WILL WIPE YOUR POSTGRES
- To add fake leaderboard entries, in `apps/backend` run `ts-node -r tsconfig-paths/register prisma/testing/leaderboardEntries.ts`.

Testing Secret Values:

- For the email service, `AWS_SES_SENDER_EMAIL`, `AWS_ACCESS_KEY_ID`, `AWS_REGION`, and `AWS_SECRET_ACCESS_KEY` must be set with target email and key info.

Testing Utilities:

- For accessing local DB: `psql postgresql://postgres:postgres@localhost:5432/connections_test`
- For dropping test DB: `psql`, `DROP DATABASE connections_test WITH (FORCE);`
- `\l` to list dbs, `\c $dbname` to connect, `\d` to list tables.
- To filter requests in Chrome Inspect, use negative filter `-.png -.jpg -.jpeg -.gif -.json -.js` in Network tab.
- After a full deletion sometimes an old cookie will still be populating site, to delete in Chrome: `Settings` -> `Privacy and security` -> `Third-party cookies` -> `See all site data and permissions` -> search for localhost -> delete cookies

Notes:

- API/backend uses null types for interop, client storage uses undefined for storage efficiency - conversions are done with zod.transform
