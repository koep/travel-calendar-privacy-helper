# Egencia calendar privacy (Google Apps Script)

Marks Google Calendar events from `noreply@mail.egencia.de` (when that address is **organizer** or **creator**) as **visibility: private**. A time-based trigger runs every **30 minutes** and scans the **primary** calendar **from now through the next ~3 months**.

## Prerequisites

- [Node.js](https://nodejs.org/) (for npm scripts / local `clasp`)
- [`clasp`](https://github.com/google/clasp): `npm install` in this repo installs `@google/clasp`; or use a global install

## One-time setup

From this directory:

```bash
npm install
npx clasp login
npx clasp create --type standalone --title "Egencia Privacy Marker"
```

That creates `.clasp.json` (already listed in [.gitignore](.gitignore); do not commit it).

Push the script and manifest:

```bash
npm run push
```

Open the Apps Script editor (enable Calendar + approve OAuth when prompted):

```bash
npm run open
```

In the editor, select **Egencia Privacy Marker** resources and confirm **Advanced Google services → Google Calendar API** is **On** (it should match [appsscript.json](appsscript.json)).

**Install the 30-minute trigger** — pick one:

1. **In the IDE:** Run **setupTrigger** once (Authorize when asked).
2. **From CLI:** Turn on **Google Apps Script API** for your account ([script.google.com/home/usersettings](https://script.google.com/home/usersettings)), then run `npm run setup`.

Optional: run **markEgenciaEventsPrivate** once manually to confirm events update.

To stop scheduling:

```javascript
// In the IDE, run removeTriggers once
```

(or implement a one-off runner that calls `removeTriggers()` from the codebase).

## Updating npm packages

Dependencies live in [package.json](package.json); this repo uses a committed [package-lock.json](package-lock.json) (run `npm install` after cloning).

1. **See what is outdated:** `npm outdated`
2. **Bump within the ranges already in `package.json`:** `npm update` — refreshes the lockfile for versions allowed by semver (for example `^3.3.0` can move to newer 3.x, not 4.x).
3. **Move to a specific or latest version:** `npm install @google/clasp@latest --save-dev` (or replace `latest` with a version). This updates both `package.json` and the lockfile.
4. **Optional — bump ranges in `package.json`:** [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) (`npx npm-check-updates -u`, then `npm install`) rewrites version ranges; review diffs before committing.
5. **Sanity check:** `npx clasp --version` (or `npm run push` against your project if you want an end-to-end check).
6. **Commit:** when the lockfile changes, commit `package.json` and `package-lock.json` together.

## Redeploy / observe

```bash
npm run push     # push code + appsscript.json
npm run logs     # recent Stackdriver / Cloud logs
```

## Configuration

Edit constants at the top of [Code.gs](Code.gs):

- `EGENCIA_EMAIL` — sender to match
- `CALENDAR_ID` — default `primary`
- `FORWARD_MONTHS` — forward scan window (default `3`)

## Scope

- Does not scan past events (only **now → now + FORWARD_MONTHS**).
- Only changes **visibility** to `private` for matching events; it does not revert other events.
