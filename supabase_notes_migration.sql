-- Migration script to add notes table to existing database
-- Run this if you've already created the tasks and time_blocks tables

-- Notes table (for quotes, goals, etc.)
-- Single row table - only one notes entry allowed
CREATE TABLE IF NOT EXISTS notes (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000001',
  content TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT single_note CHECK (id = '00000000-0000-0000-0000-000000000001')
);

-- Create a function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updated_at for notes
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- Create policy (adjust based on your auth needs)
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;
CREATE POLICY "Allow all operations on notes" ON notes
  FOR ALL USING (true) WITH CHECK (true);

-- Insert a single default note row
INSERT INTO notes (id, content) 
VALUES ('00000000-0000-0000-0000-000000000001', '')
ON CONFLICT (id) DO UPDATE SET content = EXCLUDED.content;

