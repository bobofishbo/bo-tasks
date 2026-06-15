/**
 * Seeds 3 weeks of the recurring Perflection Posts schedule into the app.
 *
 * Usage:
 *   Dev:        node scripts/seed-schedule.mjs
 *   Production: API_URL=https://your-app.vercel.app API_KEY=your-key node scripts/seed-schedule.mjs
 */

const BASE    = (process.env.API_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const API_KEY = process.env.API_KEY ?? '';

// day: 0=Mon … 6=Sun
const WEEKLY_TEMPLATE = [
  // MON
  { day: 0, time: '12:30', dur: 60,  title: 'Swing Analysis Carousel',              platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Same golfer as 7 PM reel; Sabrina selects Mon morning — standard golfer selection, not necessarily marquee' },
  { day: 0, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',                   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 12:30 PM carousel — same golfer' },
  // TUE
  { day: 1, time: '07:00', dur: 60,  title: 'AI Carousel',                           platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Educational depth — AI misconception, AI instruction science, or coaching concept; queue in Schedulala by Mon EOD' },
  // WED
  { day: 2, time: '08:00', dur: 90,  title: 'AI Twin Building — JR thoughts',        platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'JR records Mon–Tue; Sabrina edits; ready by Tue night' },
  { day: 2, time: '12:30', dur: 60,  title: 'Swing Analysis Carousel',              platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Same golfer as 7 PM reel; Sabrina selects Wed morning — standard selection' },
  { day: 2, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',                   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 12:30 PM carousel — same golfer' },
  // THU
  { day: 3, time: '07:00', dur: 60,  title: 'AI Carousel',                           platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Educational depth — AI instruction, technique analysis, or coaching insight; queue in Schedulala by Wed EOD' },
  { day: 3, time: '13:00', dur: 60,  title: 'Viral / Creative / Cinematic #1',       platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Approved Wed, filmed Thu; Sabrina edits and posts' },
  // FRI
  { day: 4, time: '08:00', dur: 60,  title: 'Swing Analysis Carousel',              platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Marquee golfer — prioritize currently active tournament player or trending athlete; Sabrina selects Fri morning' },
  { day: 4, time: '12:00', dur: 30,  title: 'RedNote post #1',                       platform: 'RedNote',                                                      script: 'Repurposed/translated content; Sabrina posts and engages' },
  { day: 4, time: '18:00', dur: 60,  title: 'Swing Analysis Reel',                   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 8 AM carousel — same marquee golfer; 6–8 PM ET pre-weekend window' },
  { day: 4, time: '19:00', dur: 60,  title: 'Transformation Post #1',                platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Jane films Thu; Sabrina edits and posts; Fri evening = high-engagement slot' },
  // SAT
  { day: 5, time: '08:00', dur: 60,  title: 'AI Carousel',                           platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Lighter/entertaining tone — pop-culture golf, fun facts, or casual format; morning-before-round window' },
  { day: 5, time: '12:00', dur: 90,  title: '"Curious to Course-Ready" — JR series', platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'JR-filmed, Sabrina-edited; asset ready by Sun night' },
  { day: 5, time: '21:00', dur: 30,  title: 'RedNote post #2',                       platform: 'RedNote',                                                      script: 'Repurposed/translated content; Sabrina posts and engages' },
  // SUN
  { day: 6, time: '08:00', dur: 60,  title: 'Swing Analysis Carousel',              platform: 'Instagram, TikTok, Facebook, Threads, LinkedIn',               script: 'Marquee golfer — prioritize tournament closer, just-finished event, or trending athlete; Sabrina selects Sun morning' },
  { day: 6, time: '13:00', dur: 90,  title: 'Viral / Creative / Cinematic #2',       platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Approved Wed, filmed Fri; Sabrina edits and posts' },
  { day: 6, time: '19:00', dur: 60,  title: 'Swing Analysis Reel',                   platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Paired with 8 AM carousel — same marquee golfer; 7–9 PM ET post-round window' },
  { day: 6, time: '20:30', dur: 60,  title: 'Transformation Post #2',                platform: 'Instagram, TikTok, YouTube Shorts, Facebook, Threads, LinkedIn', script: 'Jane films Fri; Sabrina edits and posts Sun; post-round reflection — highest engagement window' },
];

function getNextMonday() {
  const today = new Date();
  const dow   = today.getDay();
  const days  = dow === 0 ? 1 : 8 - dow;
  const mon   = new Date(today);
  mon.setDate(today.getDate() + days);
  mon.setHours(0, 0, 0, 0);
  return mon;
}

function toDateStr(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function seed() {
  const monday = getNextMonday();
  console.log(`Seeding 3 weeks starting ${toDateStr(monday)} → ${BASE}/api/content\n`);

  let ok = 0, fail = 0;
  const headers = { 'Content-Type': 'application/json', ...(API_KEY ? { Authorization: `Bearer ${API_KEY}` } : {}) };

  for (let week = 0; week < 3; week++) {
    for (const t of WEEKLY_TEMPLATE) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + week * 7 + t.day);
      const dateStr = toDateStr(d);

      const body = {
        title:            t.title,
        status:           'published',
        scheduled_date:   dateStr,
        scheduled_time:   t.time,
        duration_minutes: t.dur,
        platform:         t.platform,
        reference_videos: '',
        script:           t.script,
      };

      try {
        const res = await fetch(`${BASE}/api/content`, { method: 'POST', headers, body: JSON.stringify(body) });
        if (res.ok) {
          console.log(`  ✓  ${dateStr}  ${t.time}  ${t.title}`);
          ok++;
        } else {
          const txt = await res.text();
          console.error(`  ✗  ${dateStr}  ${t.time}  ${t.title}  →  ${res.status} ${txt}`);
          fail++;
        }
      } catch (e) {
        console.error(`  ✗  ${t.title}  →  ${e.message}`);
        fail++;
      }
    }
    console.log('');
  }

  console.log(`Done — ${ok} created, ${fail} failed`);
}

seed();
