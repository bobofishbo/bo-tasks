import { NextResponse } from 'next/server';
import { fetchTodayEvents, cacheEventsForDate } from '@/lib/gcal';
import { getTodayEasternDate } from '@/app/utils/dateUtils';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(req: Request) {
  // Vercel Cron sends Authorization: Bearer <CRON_SECRET> automatically.
  // Reject any call that doesn't carry the right secret.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const auth = req.headers.get('authorization');
    if (auth !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  }

  const date = new URL(req.url).searchParams.get('date') ?? getTodayEasternDate();

  try {
    const events = await fetchTodayEvents(date);
    await cacheEventsForDate(date, events);
    return NextResponse.json({ synced: events.length, date });
  } catch (err) {
    console.error('GCal sync failed:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
