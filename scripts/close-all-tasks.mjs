import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wzfkbqemhzxteekevmoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZmticWVtaHp4dGVla2V2bW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjgyMDUsImV4cCI6MjA4MTM0NDIwNX0.S-nFi9C5KRdD_jHlBDsA8GNkEPQanVhh174Htim_GUE'
);

const { data, error } = await supabase
  .from('tasks')
  .update({ completed: true })
  .eq('completed', false)
  .select('id');

if (error) { console.error('Error:', error.message); process.exit(1); }
console.log(`✓ Closed ${data?.length ?? 0} tasks`);
