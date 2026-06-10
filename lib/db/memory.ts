import { randomUUID } from 'crypto';
import type { Database, DbTask, DbTimeBlock, DbNote, DbContentItem, DbBannerEvent } from './interface';

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
};
