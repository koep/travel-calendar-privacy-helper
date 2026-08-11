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

  const userEmail = Session.getEffectiveUser().getEmail();
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

      if (fromEgencia) {
        const patch = {};
        const actions = [];

        if (ev.visibility !== 'private') {
          patch.visibility = 'private';
          actions.push('private');
        }

        const hasReminders = ev.reminders && (ev.reminders.useDefault ||
          (ev.reminders.overrides && ev.reminders.overrides.length > 0));
        if (hasReminders) {
          patch.reminders = { useDefault: false, overrides: [] };
          actions.push('reminders removed');
        }

        const selfAttendee = (ev.attendees || []).find(function (a) {
          return a.self || a.email === userEmail;
        });
        if (selfAttendee &&
          (selfAttendee.responseStatus === 'needsAction' || selfAttendee.responseStatus === 'declined')) {
          selfAttendee.responseStatus = 'accepted';
          patch.attendees = ev.attendees;
          actions.push('accepted');
        }

        if (Object.keys(patch).length > 0) {
          Calendar.Events.patch(patch, CALENDAR_ID, ev.id, { sendUpdates: 'none' });
          updated++;
          console.log(actions.join(', ') + ': ' + (ev.summary || '(no title)') + ' (' + ev.id + ')');
        }
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
