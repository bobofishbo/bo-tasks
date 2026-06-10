CREATE TABLE content_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('instagram','youtube','tiktok','twitter','linkedin','blog','other')),
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea','draft','scheduled','published')),
  scheduled_date DATE NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_content_items_date ON content_items(scheduled_date);

ALTER TABLE content_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on content_items" ON content_items
  FOR ALL USING (true) WITH CHECK (true);
