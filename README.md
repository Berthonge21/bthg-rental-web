# bthg-rental-web

**This repository is no longer where active development happens.**

The frontend now lives at [`apps/web` in `BTHG-Rental-Car-2`](https://github.com/Berthonge21/BTHG-Rental-Car-2/tree/main/apps/web), inside the same Turborepo monorepo as the API and the shared SDK. If you're looking to make a change to the web app, start there.

## Why it moved

This repo's SDK dependency (`@bthgrentalcar/sdk`) pointed at a relative `file:` path that didn't resolve, so the project couldn't be installed. Moving the frontend into the monorepo and linking the SDK as a Yarn workspace package fixes that, and sets up a shared SDK that a future mobile app can consume the same way — without depending on a package registry, a GitHub organization, or any single developer's personal GitHub account.

See [`BTHG-Rental-Car-2#5`](https://github.com/Berthonge21/BTHG-Rental-Car-2/pull/5) for the migration.

## What's here

Full commit history through [PR #3](https://github.com/Berthonge21/bthg-rental-web/pull/3) (client portal, auth performance fixes) — the last change made in this repository before the move. Nothing past that point will be merged here; open new work against `BTHG-Rental-Car-2/apps/web` instead.
