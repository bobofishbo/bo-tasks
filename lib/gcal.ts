import { google } from 'googleapis';
import { supabase } from './supabase';
import type { CalEvent, CalEventStatus } from '@/app/types';

const PERSONAL_KW = /\b(lunch|dinner|breakfast|gym|workout)\b/i;

function makeAuth() {
  const client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
  );
  client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });
  return client;
}

export async function fetchTodayEvents(dateStr: string): Promise<CalEvent[]> {
  if (!process.env.GOOGLE_REFRESH_TOKEN) return [];

  const auth = makeAuth();
  const cal = google.calendar({ version: 'v3', auth });

  const [year, month, day] = dateStr.split('-').map(Number);
  // Fetch 8 AM today through 2 AM next day (local time)
  const timeMin = new Date(year, month - 1, day, 8, 0, 0).toISOString();
  const timeMax = new Date(year, month - 1, day + 1, 2, 0, 0).toISOString();

  const calendarIds = (process.env.GOOGLE_CALENDAR_IDS || 'primary')
    .split(',').map(s => s.trim());
  const classCalIds = new Set(
    (process.env.GOOGLE_CLASSES_CALENDAR_IDS || '')
      .split(',').map(s => s.trim()).filter(Boolean),
  );

  const events: CalEvent[] = [];

  await Promise.all(calendarIds.map(async (calId) => {
    try {
      const res = await cal.events.list({
        calendarId: calId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
        fields: 'items(id,summary,start,end,location,status,attendees)',
      });

      for (const ev of res.data.items ?? []) {
        if (!ev.start?.dateTime) continue; // skip all-day events

        const startDt = new Date(ev.start.dateTime);
        const endDt = new Date(ev.end?.dateTime ?? ev.start.dateTime);
        const title = ev.summary ?? 'Untitled';

        let status: CalEventStatus;
        if (classCalIds.has(calId)) {
          status = 'class';
        } else if (PERSONAL_KW.test(title)) {
          status = 'personal';
        } else {
          const self = ev.attendees?.find((a) => a.self);
          const r = self?.responseStatus ?? 'accepted';
          status = r === 'tentative' ? 'tentative' : r === 'declined' ? 'declined' : 'accepted';
        }

        events.push({
          id: ev.id ?? crypto.randomUUID(),
          title,
          sub: ev.location ?? undefined,
          start: [startDt.getHours(), startDt.getMinutes()],
          end: [endDt.getHours(), endDt.getMinutes()],
          status,
        });
      }
    } catch (err) {
      console.error(`GCal fetch failed for ${calId}:`, err);
    }
  }));

  return events;
}

// ── Supabase cache helpers ───────────────────────────────────────────────────

/** Overwrite the cache for a given date with a fresh set of events. */
export async function cacheEventsForDate(dateStr: string, events: CalEvent[]): Promise<void> {
  // Delete existing rows for this date, then insert the new batch
  await supabase.from('gcal_events').delete().eq('date', dateStr);

  if (events.length === 0) return;

  await supabase.from('gcal_events').insert(
    events.map((ev) => ({
      id:         ev.id,
      date:       dateStr,
      title:      ev.title,
      sub:        ev.sub ?? null,
      start_hour: ev.start[0],
      start_min:  ev.start[1],
      end_hour:   ev.end[0],
      end_min:    ev.end[1],
      status:     ev.status,
      synced_at:  new Date().toISOString(),
    })),
  );
}

/** Read cached events for a date from Supabase. Returns null if no rows exist. */
export async function getCachedEvents(dateStr: string): Promise<CalEvent[] | null> {
  const { data, error } = await supabase
    .from('gcal_events')
    .select('*')
    .eq('date', dateStr)
    .order('start_hour')
    .order('start_min');

  if (error || !data || data.length === 0) return null;

  return data.map((row): CalEvent => ({
    id:     row.id,
    title:  row.title,
    sub:    row.sub ?? undefined,
    start:  [row.start_hour, row.start_min],
    end:    [row.end_hour,   row.end_min],
    status: row.status as CalEventStatus,
  }));
}
