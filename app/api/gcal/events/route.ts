import { NextResponse } from 'next/server';
import { fetchTodayEvents, getCachedEvents, cacheEventsForDate } from '@/lib/gcal';
import { getTodayEasternDate } from '@/app/utils/dateUtils';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const date = new URL(req.url).searchParams.get('date') ?? getTodayEasternDate();

  try {
    // Always pull live from Google Calendar so a page refresh reflects the latest changes.
    const events = await fetchTodayEvents(date);
    await cacheEventsForDate(date, events).catch(() => {/* don't fail the request if cache write fails */});
    return NextResponse.json(events);
  } catch (err) {
    console.error('GCal events route error, falling back to cache:', err);
    // Google API hiccup — serve the last known-good cache (populated by cron or a prior request) instead of an empty schedule.
    const cached = await getCachedEvents(date).catch(() => null);
    return NextResponse.json(cached ?? []);
  }
}
