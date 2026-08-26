-- Run in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pinned_tasks (
  id             uuid    DEFAULT gen_random_uuid() PRIMARY KEY,
  title          text    NOT NULL,
  hours          numeric(4,2),
  recurrence     text    NOT NULL CHECK (recurrence IN ('daily', 'weekly')),
  day_of_week    smallint CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sun…6=Sat; NULL for daily
  completed_date text,   -- YYYY-MM-DD of last completion; if = today → checked
  created_at     timestamptz DEFAULT now()
);

ALTER TABLE pinned_tasks DISABLE ROW LEVEL SECURITY;
