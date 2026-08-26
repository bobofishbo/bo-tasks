import { NextResponse } from 'next/server';
import { fetchTodayEvents, getCachedEvents, cacheEventsForDate } from '@/lib/gcal';
import { getTodayEasternDate } from '@/app/utils/dateUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') ?? getTodayEasternDate();

  try {
    // 1. Try Supabase cache first (populated at 8 AM by the cron)
    const cached = await getCachedEvents(date);
    if (cached !== null) {
      return NextResponse.json(cached);
    }

    // 2. Cache miss — fetch live from Google Calendar and store for next time
    const events = await fetchTodayEvents(date);
    await cacheEventsForDate(date, events).catch(() => {/* don't fail the request if cache write fails */});
    return NextResponse.json(events);
  } catch (err) {
    console.error('GCal events route error:', err);
    return NextResponse.json([]);
  }
}
