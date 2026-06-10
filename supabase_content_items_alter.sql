-- Migration: update content_items to new schema
-- Run this in Supabase SQL Editor if you already applied supabase_content_migration.sql
-- Safe to run multiple times (uses IF NOT EXISTS / IF EXISTS guards).

-- 1. Drop the old NOT NULL + CHECK constraint on platform
ALTER TABLE content_items
  ALTER COLUMN platform DROP NOT NULL;

DO $$
BEGIN
  -- Drop the check constraint if it exists (name may vary; adjust if needed)
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'content_items'
      AND constraint_type = 'CHECK'
      AND constraint_name LIKE '%platform%'
  ) THEN
    EXECUTE (
      SELECT 'ALTER TABLE content_items DROP CONSTRAINT ' || constraint_name
      FROM information_schema.table_constraints
      WHERE table_name = 'content_items'
        AND constraint_type = 'CHECK'
        AND constraint_name LIKE '%platform%'
      LIMIT 1
    );
  END IF;
END $$;

-- 2. Rename 'notes' → 'script' (preserves existing data)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'content_items' AND column_name = 'notes'
  ) THEN
    ALTER TABLE content_items RENAME COLUMN notes TO script;
  END IF;
END $$;

-- 3. Add new columns (idempotent)
ALTER TABLE content_items
  ADD COLUMN IF NOT EXISTS scheduled_time   TIME,
  ADD COLUMN IF NOT EXISTS duration_minutes INTEGER NOT NULL DEFAULT 60,
  ADD COLUMN IF NOT EXISTS reference_videos TEXT    NOT NULL DEFAULT '';
