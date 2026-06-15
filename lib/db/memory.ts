import { randomUUID } from 'crypto';
import type { Database, DbTask, DbTimeBlock, DbNote, DbContentItem, DbBannerEvent, DbInspiration } from './interface';

function dateOffset(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().split('T')[0];
}

const now = new Date().toISOString();
const NOTES_ID = '00000000-0000-0000-0000-000000000001';

const tasks: DbTask[] = [
  { id: 'seed-1', name: 'Review pull requests',   hours: 1.5, completed: true,  date: dateOffset(2), created_at: now },
  { id: 'seed-2', name: 'Write unit tests',        hours: 3,   completed: false, date: dateOffset(1), created_at: now },
  { id: 'seed-3', name: 'Team standup',             hours: 0.5, completed: true,  date: dateOffset(0), created_at: now },
  { id: 'seed-4', name: 'Feature implementation',  hours: 4,   completed: false, date: dateOffset(0), created_at: now },
];

const timeBlocks: DbTimeBlock[] = [
  { id: 'block-1', task_id: 'seed-3', start_time: '09:00', end_time: '09:30', created_at: now },
  { id: 'block-2', task_id: 'seed-4', start_time: '10:00', end_time: '14:00', created_at: now },
];

let note: DbNote = {
  id: NOTES_ID,
  content: 'Dev mode — mock data active. Fill in .env.local to connect to Supabase.',
  updated_at: now,
};

// ── recurring weekly schedule ─────────────────────────────────────────────────
// day: 0=Mon … 6=Sun  |  time: HH:MM (ET)

const WEEKLY_TEMPLATE: Array<{
  day: number; time: string; dur: number;
  title: string; platform: string; script: string;
}> = [
  // MON
  { day: 0, time: '12:30', dur: 60,  title: 'Swing Analysis Carousel',          platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Same golfer as 7 PM reel; Sabrina selects Mon morning — standard golfer selection, not necessarily marquee' },
  { day: 0, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',               platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 12:30 PM carousel — same golfer' },
  // TUE
  { day: 1, time: '07:00', dur: 60,  title: 'AI Carousel',                       platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Educational depth — AI misconception, AI instruction science, or coaching concept; queue in Schedulala by Mon EOD' },
  // WED
  { day: 2, time: '08:00', dur: 90,  title: 'AI Twin Building — JR thoughts',    platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'JR records Mon–Tue; Sabrina edits; ready by Tue night' },
  { day: 2, time: '12:30', dur: 60,  title: 'Swing Analysis Carousel',          platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Same golfer as 7 PM reel; Sabrina selects Wed morning — standard selection' },
  { day: 2, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',               platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 12:30 PM carousel — same golfer' },
  // THU
  { day: 3, time: '07:00', dur: 60,  title: 'AI Carousel',                       platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Educational depth — AI instruction, technique analysis, or coaching insight; queue in Schedulala by Wed EOD' },
  { day: 3, time: '13:00', dur: 60,  title: 'Viral / Creative / Cinematic #1',   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Approved Wed, filmed Thu; Sabrina edits and posts' },
  // FRI
  { day: 4, time: '08:00', dur: 60,  title: 'Swing Analysis Carousel',          platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Marquee golfer — prioritize currently active tournament player or trending athlete; Sabrina selects Fri morning' },
  { day: 4, time: '12:00', dur: 30,  title: 'RedNote post #1',                   platform: 'RedNote',                                                      script: 'Repurposed/translated content; Sabrina posts and engages' },
  { day: 4, time: '18:00', dur: 60,  title: 'Swing Analysis Reel',               platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 8 AM carousel — same marquee golfer; 6–8 PM ET pre-weekend window' },
  { day: 4, time: '19:00', dur: 60,  title: 'Transformation Post #1',            platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Jane films Thu; Sabrina edits and posts; Fri evening = high-engagement slot' },
  // SAT
  { day: 5, time: '08:00', dur: 60,  title: 'AI Carousel',                       platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Lighter/entertaining tone — pop-culture golf, fun facts, or casual format; morning-before-round window' },
  { day: 5, time: '12:00', dur: 90,  title: '"Curious to Course-Ready" — JR series', platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'JR-filmed, Sabrina-edited; asset ready by Sun night' },
  { day: 5, time: '21:00', dur: 30,  title: 'RedNote post #2',                   platform: 'RedNote',                                                      script: 'Repurposed/translated content; Sabrina posts and engages' },
  // SUN
  { day: 6, time: '08:00', dur: 60,  title: 'Swing Analysis Carousel',          platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Marquee golfer — prioritize tournament closer, just-finished event, or trending athlete; Sabrina selects Sun morning' },
  { day: 6, time: '13:00', dur: 90,  title: 'Viral / Creative / Cinematic #2',   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Approved Wed, filmed Fri; Sabrina edits and posts' },
  { day: 6, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',               platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 8 AM carousel — same marquee golfer; 7–9 PM ET post-round window' },
  { day: 6, time: '20:30', dur: 60,  title: 'Transformation Post #2',            platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Jane films Fri; Sabrina edits and posts Sun; post-round reflection — highest engagement window' },
];

function generateRecurringSchedule(): DbContentItem[] {
  const today = new Date();
  const dow   = today.getDay(); // 0=Sun
  const daysToNextMon = dow === 0 ? 1 : 8 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + daysToNextMon);
  monday.setHours(0, 0, 0, 0);

  const items: DbContentItem[] = [];
  for (let week = 0; week < 3; week++) {
    for (const t of WEEKLY_TEMPLATE) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + week * 7 + t.day);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      items.push({
        id: `sched-w${week}-d${t.day}-${t.time.replace(':', '')}`,
        title: t.title,
        status: 'published',
        scheduled_date: dateStr,
        scheduled_time: t.time,
        duration_minutes: t.dur,
        platform: t.platform,
        reference_videos: '',
        script: t.script,
        created_at: now,
      });
    }
  }
  return items;
}

// ── content items (manual seeds + recurring schedule) ────────────────────────

const contentItems: DbContentItem[] = [
  {
    id: 'c-1', title: 'Morning routine breakdown',
    status: 'published', scheduled_date: dateOffset(3), scheduled_time: '09:00', duration_minutes: 60,
    platform: 'instagram',
    reference_videos: 'https://youtube.com/watch?v=example1',
    script: 'Hook: "This one habit changed everything for my golf game..."\n\nBody: Walk through morning stretch routine, mental prep, range session structure.\n\nCTA: Save this for your next morning practice.',
    created_at: now,
  },
  {
    id: 'c-2', title: 'US Open course breakdown',
    status: 'draft', scheduled_date: dateOffset(2), scheduled_time: '14:00', duration_minutes: 90,
    platform: 'youtube',
    reference_videos: 'https://youtube.com/watch?v=usopen2026\nhttps://youtube.com/watch?v=oakmont_holes',
    script: 'Intro: Set up why Oakmont is the hardest test in golf.\n\nHole by hole: Focus on 1, 8, 12, 18.\n\nOutro: Who benefits most from these conditions.',
    created_at: now,
  },
  {
    id: 'c-3', title: 'Swing tip: lag for distance',
    status: 'scheduled', scheduled_date: dateOffset(1), scheduled_time: '10:30', duration_minutes: 45,
    platform: 'instagram',
    reference_videos: '',
    script: 'Show the wrist hinge position at the top.\nCompare early release vs maintaining lag.\nDrill: pause at the top and feel the weight.',
    created_at: now,
  },
  {
    id: 'c-4', title: 'Behind the scenes: range day',
    status: 'idea', scheduled_date: dateOffset(0), scheduled_time: '11:00', duration_minutes: 30,
    platform: 'instagram',
    reference_videos: '',
    script: '',
    created_at: now,
  },
  {
    id: 'c-5', title: 'Fan Q&A — US Open predictions',
    status: 'idea', scheduled_date: dateOffset(-1), scheduled_time: '16:00', duration_minutes: 60,
    platform: 'twitter',
    reference_videos: '',
    script: 'Pull top 5 questions from last week\'s post.\nGive honest take on each contender.\nEnd with my dark horse pick.',
    created_at: now,
  },
  {
    id: 'c-6', title: 'Post-round reaction reel',
    status: 'idea', scheduled_date: dateOffset(-2), scheduled_time: '18:00', duration_minutes: 30,
    platform: 'instagram',
    reference_videos: '',
    script: '',
    created_at: now,
  },
  ...generateRecurringSchedule(),
];

const inspirations: DbInspiration[] = [
  {
    id: 'i-1',
    url: 'https://www.instagram.com/reel/C8xGolfSwing1/',
    platform: 'instagram',
    title: 'lag drill breakdown',
    notes: 'really clean slow-mo of the wrist hinge — could steal this format',
    status: 'new',
    created_at: dateOffset(0),
  },
  {
    id: 'i-2',
    url: 'https://www.tiktok.com/@tourprogolf/video/7380001234567890',
    platform: 'tiktok',
    title: 'course management tip',
    notes: 'the way he explains layup strategy is super digestible, 60 sec format',
    status: 'new',
    created_at: dateOffset(1),
  },
  {
    id: 'i-3',
    url: 'https://www.instagram.com/reel/C9yMorningRange2/',
    platform: 'instagram',
    title: 'morning range routine',
    notes: '',
    status: 'reviewed',
    created_at: dateOffset(2),
  },
  {
    id: 'i-4',
    url: 'https://www.tiktok.com/@golfweekly/video/7390009876543210',
    platform: 'tiktok',
    title: 'us open reaction reel',
    notes: 'great hook — opens mid-reaction, no intro',
    status: 'saved',
    created_at: dateOffset(4),
  },
];

const bannerEvents: DbBannerEvent[] = [
  { id: 'b-1', title: 'US Open Week',       color: 'basil',   start_date: dateOffset(3),  end_date: dateOffset(-3), created_at: now },
  { id: 'b-2', title: 'Golf content push',  color: 'peacock', start_date: dateOffset(1),  end_date: dateOffset(-1), created_at: now },
];

export const memoryDb: Database = {
  tasks: {
    async getAll(date) {
      const result = date ? tasks.filter((t) => t.date === date) : [...tasks];
      return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async getById(id) { return tasks.find((t) => t.id === id) ?? null; },
    async create(data) {
      const task: DbTask = { id: randomUUID(), ...data, created_at: new Date().toISOString() };
      tasks.push(task);
      return task;
    },
    async update(id, data) {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx === -1) return null;
      tasks[idx] = { ...tasks[idx], ...data };
      return tasks[idx];
    },
    async delete(id) {
      const idx = tasks.findIndex((t) => t.id === id);
      if (idx !== -1) tasks.splice(idx, 1);
      for (let i = timeBlocks.length - 1; i >= 0; i--) {
        if (timeBlocks[i].task_id === id) timeBlocks.splice(i, 1);
      }
    },
  },
  timeBlocks: {
    async getAll(taskId) {
      return taskId ? timeBlocks.filter((b) => b.task_id === taskId) : [...timeBlocks];
    },
    async create(data) {
      const block: DbTimeBlock = { id: randomUUID(), ...data, created_at: new Date().toISOString() };
      timeBlocks.push(block);
      return block;
    },
    async delete(id) {
      const idx = timeBlocks.findIndex((b) => b.id === id);
      if (idx !== -1) timeBlocks.splice(idx, 1);
    },
  },
  notes: {
    async get() { return note; },
    async upsert(content) {
      note = { ...note, content, updated_at: new Date().toISOString() };
      return note;
    },
  },
  content: {
    async getAll(from, to) {
      return contentItems
        .filter((i) => (!from || i.scheduled_date >= from) && (!to || i.scheduled_date <= to))
        .sort((a, b) => {
          if (a.scheduled_date !== b.scheduled_date) return a.scheduled_date.localeCompare(b.scheduled_date);
          return (a.scheduled_time ?? '').localeCompare(b.scheduled_time ?? '');
        });
    },
    async getById(id) { return contentItems.find((i) => i.id === id) ?? null; },
    async create(data) {
      const item: DbContentItem = { id: randomUUID(), ...data, created_at: new Date().toISOString() };
      contentItems.push(item);
      return item;
    },
    async update(id, data) {
      const idx = contentItems.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      contentItems[idx] = { ...contentItems[idx], ...data };
      return contentItems[idx];
    },
    async delete(id) {
      const idx = contentItems.findIndex((i) => i.id === id);
      if (idx !== -1) contentItems.splice(idx, 1);
    },
  },
  bannerEvents: {
    async getAll(from, to) {
      return bannerEvents
        .filter((b) => (!from || b.end_date >= from) && (!to || b.start_date <= to))
        .sort((a, b) => a.start_date.localeCompare(b.start_date));
    },
    async create(data) {
      const item: DbBannerEvent = { id: randomUUID(), ...data, created_at: new Date().toISOString() };
      bannerEvents.push(item);
      return item;
    },
    async update(id, data) {
      const idx = bannerEvents.findIndex((b) => b.id === id);
      if (idx === -1) return null;
      bannerEvents[idx] = { ...bannerEvents[idx], ...data };
      return bannerEvents[idx];
    },
    async delete(id) {
      const idx = bannerEvents.findIndex((b) => b.id === id);
      if (idx !== -1) bannerEvents.splice(idx, 1);
    },
  },
  inspirations: {
    async getAll(status) {
      const result = status ? inspirations.filter((i) => i.status === status) : [...inspirations];
      return result.sort((a, b) => b.created_at.localeCompare(a.created_at));
    },
    async create(data) {
      const item: DbInspiration = { id: randomUUID(), ...data, created_at: new Date().toISOString() };
      inspirations.push(item);
      return item;
    },
    async update(id, data) {
      const idx = inspirations.findIndex((i) => i.id === id);
      if (idx === -1) return null;
      inspirations[idx] = { ...inspirations[idx], ...data };
      return inspirations[idx];
    },
    async delete(id) {
      const idx = inspirations.findIndex((i) => i.id === id);
      if (idx !== -1) inspirations.splice(idx, 1);
    },
  },
};
