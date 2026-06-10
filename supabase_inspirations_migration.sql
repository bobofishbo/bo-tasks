CREATE TABLE inspirations (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url        TEXT NOT NULL,
  platform   TEXT NOT NULL CHECK (platform IN ('instagram', 'tiktok')),
  title      TEXT NOT NULL DEFAULT '',
  notes      TEXT NOT NULL DEFAULT '',
  status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'reviewed', 'saved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_inspirations_status     ON inspirations(status);
CREATE INDEX idx_inspirations_created_at ON inspirations(created_at DESC);

ALTER TABLE inspirations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on inspirations" ON inspirations
  FOR ALL USING (true) WITH CHECK (true);
