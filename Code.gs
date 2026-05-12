const EGENCIA_EMAIL = 'noreply@mail.egencia.de';
const CALENDAR_ID = 'primary';
const FORWARD_MONTHS = 7;

/**
 * Scheduled entry point: mark Egencia-sourced events as private.
 */
function markEgenciaEventsPrivate() {
  const timeMin = new Date();
  const timeMax = new Date();
  timeMax.setMonth(timeMax.getMonth() + FORWARD_MONTHS);

  let pageToken;
  let scanned = 0;
  let updated = 0;

  do {
    const res = Calendar.Events.list(CALENDAR_ID, {
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      showDeleted: false,
      maxResults: 250,
      pageToken: pageToken,
    });

    for (const ev of res.items || []) {
      scanned++;
      const fromEgencia =
        (ev.organizer && ev.organizer.email === EGENCIA_EMAIL) ||
        (ev.creator && ev.creator.email === EGENCIA_EMAIL);
      if (fromEgencia && ev.visibility !== 'private') {
        Calendar.Events.patch({ visibility: 'private' }, CALENDAR_ID, ev.id);
        updated++;
        console.log('private: ' + (ev.summary || '(no title)') + ' (' + ev.id + ')');
      }
    }
    pageToken = res.nextPageToken;
  } while (pageToken);

  console.log('scanned=' + scanned + ' updated=' + updated);
}

/**
 * Run once after deploy: install a 30-minute time-based trigger.
 */
function setupTrigger() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) {
      return t.getHandlerFunction() === 'markEgenciaEventsPrivate';
    })
    .forEach(function (t) {
      ScriptApp.deleteTrigger(t);
    });
  ScriptApp.newTrigger('markEgenciaEventsPrivate')
    .timeBased()
    .everyMinutes(30)
    .create();
  console.log('trigger installed: every 30 minutes');
}

/**
 * Remove time-based triggers for markEgenciaEventsPrivate.
 */
function removeTriggers() {
  ScriptApp.getProjectTriggers()
    .filter(function (t) {
      return t.getHandlerFunction() === 'markEgenciaEventsPrivate';
    })
    .forEach(function (t) {
      ScriptApp.deleteTrigger(t);
    });
  console.log('triggers removed for markEgenciaEventsPrivate');
}
