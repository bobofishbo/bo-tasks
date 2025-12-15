-- Drop all tables and related objects
-- WARNING: This will delete all data!

-- Drop triggers first
DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Drop policies
DROP POLICY IF EXISTS "Allow all operations on tasks" ON tasks;
DROP POLICY IF EXISTS "Allow all operations on time_blocks" ON time_blocks;
DROP POLICY IF EXISTS "Allow all operations on notes" ON notes;

-- Drop tables (in reverse order of dependencies)
DROP TABLE IF EXISTS time_blocks CASCADE;
DROP TABLE IF EXISTS notes CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop indexes (if they exist independently)
DROP INDEX IF EXISTS idx_tasks_date;
DROP INDEX IF EXISTS idx_tasks_completed;
DROP INDEX IF EXISTS idx_time_blocks_task_id;

