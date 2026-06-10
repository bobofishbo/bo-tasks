CREATE TABLE banner_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT 'basil',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT banner_dates_valid CHECK (end_date >= start_date)
);

CREATE INDEX idx_banner_events_dates ON banner_events(start_date, end_date);

ALTER TABLE banner_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on banner_events" ON banner_events
  FOR ALL USING (true) WITH CHECK (true);
