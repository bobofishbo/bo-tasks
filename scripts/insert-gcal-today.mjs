import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://wzfkbqemhzxteekevmoq.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind6ZmticWVtaHp4dGVla2V2bW9xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU3NjgyMDUsImV4cCI6MjA4MTM0NDIwNX0.S-nFi9C5KRdD_jHlBDsA8GNkEPQanVhh174Htim_GUE'
);

const DATE = '2026-08-25';

const events = [
  { id: 'j6fptrt7s6qquh6ta176bbetnk',                          date: DATE, title: "Doctor's Appointment",                    sub: 'UPMC',        start_hour: 11, start_min: 30, end_hour: 12, end_min: 30, status: 'accepted' },
  { id: 'neo00kb7kolh05np0gc7ao240o_20260825T163000Z',          date: DATE, title: 'Language Diversity & Cultural Identity',  sub: 'DH-2122',     start_hour: 12, start_min: 30, end_hour: 13, end_min: 50, status: 'class'    },
  { id: 'just0nhfqcvj0a1730p710laik_20260825T180000Z',         date: DATE, title: 'Mobile Application Design & Development', sub: 'BH-A53',      start_hour: 14, start_min:  0, end_hour: 15, end_min: 20, status: 'class'    },
  { id: '7564qurcc5jqeulihe7e9melhq_20260825T193000Z',         date: DATE, title: 'Other Gened',                             sub: null,          start_hour: 15, start_min: 30, end_hour: 16, end_min: 50, status: 'class'    },
  { id: 'e6fp0aimok9o9t88tua77u55oq_20260825T201500Z',         date: DATE, title: 'Perflection: UI & UX Weekly',             sub: 'Google Meet', start_hour: 16, start_min: 15, end_hour: 17, end_min: 15, status: 'accepted' },
  { id: '10kvcu5r84pbaujhiuc7g1n2qt_20260826T010000Z',         date: DATE, title: 'Perflection AI: Social Media Weekly Sync',sub: 'Google Meet', start_hour: 21, start_min:  0, end_hour: 21, end_min: 45, status: 'accepted' },
];

// Clear today's existing cache then insert fresh
const { error: delErr } = await supabase.from('gcal_events').delete().eq('date', DATE);
if (delErr) { console.error('Delete error:', delErr.message); process.exit(1); }

const { error: insErr } = await supabase.from('gcal_events').insert(events);
if (insErr) { console.error('Insert error:', insErr.message); process.exit(1); }

console.log(`✓ Synced ${events.length} events for ${DATE}`);
events.forEach(e => console.log(`  ${String(e.start_hour).padStart(2,'0')}:${String(e.start_min).padStart(2,'0')}  ${e.title}`));
