-- Full schema for content_items (fresh install).
-- If you already ran a previous version, run supabase_content_items_alter.sql instead.

CREATE TABLE content_items (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title            TEXT    NOT NULL,
  status           TEXT    NOT NULL DEFAULT 'idea'
                           CHECK (status IN ('idea','draft','scheduled','published')),
  scheduled_date   DATE    NOT NULL,
  scheduled_time   TIME,                              -- null = unscheduled
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  platform         TEXT,                              -- optional, for future posting
  reference_videos TEXT    NOT NULL DEFAULT '',       -- newline-separated URLs
  script           TEXT    NOT NULL DEFAULT '',
  created_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_items_date ON content_items(scheduled_date);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on content_items" ON content_items
  FOR ALL USING (true) WITH CHECK (true);
