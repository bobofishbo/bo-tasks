-- Run this in the Supabase SQL Editor before deploying the GCal sync feature.

CREATE TABLE IF NOT EXISTS gcal_events (
  id         text        PRIMARY KEY,   -- Google's stable event/instance ID
  date       text        NOT NULL,      -- YYYY-MM-DD — which day this event belongs to
  title      text        NOT NULL,
  sub        text,                      -- subtitle: location or first line of description
  start_hour smallint    NOT NULL,
  start_min  smallint    NOT NULL,
  end_hour   smallint    NOT NULL,
  end_min    smallint    NOT NULL,
  status     text        NOT NULL
               CHECK (status IN ('accepted','tentative','declined','class','personal')),
  synced_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gcal_events_date_idx ON gcal_events (date);
