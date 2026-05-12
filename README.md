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
