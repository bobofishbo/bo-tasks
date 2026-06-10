'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DbContentItem, DbBannerEvent } from '@/lib/db/interface';
import { STATUS_CONFIG, BANNER_COLOR_MAP } from '../config';
import { ContentItemModal } from './ContentItemModal';
import { BannerEventModal } from './BannerEventModal';

// ── constants ────────────────────────────────────────────────────────────────

const HOUR_PX  = 64;
const HOURS    = Array.from({ length: 24 }, (_, i) => i);
const GUTTER_W = 52; // px

// ── date helpers ─────────────────────────────────────────────────────────────

const DAY_LABELS   = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function getMonday(date: Date): Date {
  const d   = new Date(date);
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  d.setHours(0, 0, 0, 0);
  return d;
}

function diffDays(fromStr: string, toStr: string): number {
  return Math.round(
    (new Date(toStr + 'T00:00:00').getTime() - new Date(fromStr + 'T00:00:00').getTime()) / 86_400_000,
  );
}

function formatWeekRange(mon: Date, sun: Date): string {
  if (mon.getMonth() === sun.getMonth()) {
    return `${MONTH_LABELS[mon.getMonth()]} ${mon.getDate()} – ${sun.getDate()}, ${mon.getFullYear()}`;
  }
  return `${MONTH_LABELS[mon.getMonth()]} ${mon.getDate()} – ${MONTH_LABELS[sun.getMonth()]} ${sun.getDate()}, ${sun.getFullYear()}`;
}

// ── time-grid helpers ─────────────────────────────────────────────────────────

function timeToPixels(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * HOUR_PX + (m / 60) * HOUR_PX;
}

function durationToPixels(minutes: number): number {
  return (minutes / 60) * HOUR_PX;
}

function pixelsToTime(px: number): string {
  const rawMinutes = (px / HOUR_PX) * 60;
  const snapped    = Math.round(rawMinutes / 15) * 15;
  const h          = Math.min(23, Math.floor(snapped / 60));
  const m          = snapped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatHourLabel(h: number): string {
  if (h === 0)  return '';
  if (h < 12)   return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

function formatTimeRange(time: string, minutes: number): string {
  const [h, m]  = time.split(':').map(Number);
  const endMins = h * 60 + m + minutes;
  const eh      = Math.floor(endMins / 60) % 24;
  const em      = endMins % 60;
  const fmt = (hh: number, mm: number) => {
    const p    = hh < 12 ? 'am' : 'pm';
    const hh12 = hh % 12 || 12;
    return mm === 0 ? `${hh12}${p}` : `${hh12}:${String(mm).padStart(2, '0')}${p}`;
  };
  return `${fmt(h, m)} – ${fmt(eh, em)}`;
}

// ── banner layout ─────────────────────────────────────────────────────────────

type BannerWithLayout = DbBannerEvent & { colStart: number; colEnd: number; row: number };

function layoutBanners(banners: DbBannerEvent[], weekStartStr: string): BannerWithLayout[] {
  const rowUsed: Set<number>[] = [];
  return banners.map((b) => {
    const colStart = Math.max(1, diffDays(weekStartStr, b.start_date) + 1);
    const colEnd   = Math.min(8, diffDays(weekStartStr, b.end_date) + 2);
    const cols     = Array.from({ length: colEnd - colStart }, (_, i) => colStart + i);
    let row = 0;
    while (true) {
      rowUsed[row] ??= new Set();
      if (!cols.some((c) => rowUsed[row].has(c))) {
        cols.forEach((c) => rowUsed[row].add(c));
        return { ...b, colStart, colEnd, row };
      }
      row++;
    }
  });
}

// ── block styles by status ────────────────────────────────────────────────────

const STATUS_BLOCK: Record<string, { bg: string; border: string; text: string }> = {
  idea:      { bg: 'bg-zinc-100',  border: 'border-zinc-400',  text: 'text-zinc-800' },
  draft:     { bg: 'bg-amber-50',  border: 'border-amber-400', text: 'text-amber-900' },
  scheduled: { bg: 'bg-blue-50',   border: 'border-blue-500',  text: 'text-blue-900' },
  published: { bg: 'bg-green-50',  border: 'border-green-500', text: 'text-green-900' },
};

// ── component ─────────────────────────────────────────────────────────────────

export function ContentCalendar() {
  const [monday,       setMonday]       = useState(() => getMonday(new Date()));
  const [items,        setItems]        = useState<DbContentItem[]>([]);
  const [banners,      setBanners]      = useState<DbBannerEvent[]>([]);
  const [loading,      setLoading]      = useState(false);
  const [nowPx,        setNowPx]        = useState<number | null>(null);
  const [newItemDate,  setNewItemDate]  = useState<string | null>(null);
  const [newItemTime,  setNewItemTime]  = useState<string | undefined>(undefined);
  const [editItem,     setEditItem]     = useState<DbContentItem | null>(null);
  const [showNewBanner, setShowNewBanner] = useState(false);
  const [editBanner,   setEditBanner]   = useState<DbBannerEvent | null>(null);

  const scrollRef    = useRef<HTMLDivElement>(null);
  const didScrollRef = useRef(false);

  const sunday    = addDays(monday, 6);
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(monday, i));
  const weekStart = toDateStr(monday);
  const weekEnd   = toDateStr(sunday);
  const todayStr  = toDateStr(new Date());

  // current time indicator — updates every minute
  useEffect(() => {
    const update = () => {
      const now = new Date();
      setNowPx((now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_PX);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  // scroll to current time on first render
  useEffect(() => {
    if (didScrollRef.current || !scrollRef.current) return;
    const now = new Date();
    scrollRef.current.scrollTop = Math.max(0, (now.getHours() * 60 + now.getMinutes()) / 60 * HOUR_PX - 120);
    didScrollRef.current = true;
  }, []);

  // fetch calendar data
  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [itemsRes, bannersRes] = await Promise.all([
        fetch(`/api/content?from=${weekStart}&to=${weekEnd}`),
        fetch(`/api/banner-events?from=${weekStart}&to=${weekEnd}`),
      ]);
      if (itemsRes.ok)   setItems(await itemsRes.json());
      if (bannersRes.ok) setBanners(await bannersRes.json());
    } finally {
      setLoading(false);
    }
  }, [weekStart, weekEnd]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // derived
  const itemsByDate = items.reduce<Record<string, DbContentItem[]>>((acc, item) => {
    (acc[item.scheduled_date] ??= []).push(item);
    return acc;
  }, {});

  const laidOutBanners = layoutBanners(banners, weekStart);
  const bannerRowCount = laidOutBanners.length > 0
    ? Math.max(...laidOutBanners.map((b) => b.row)) + 1
    : 0;

  const isTodayInWeek = weekDays.some((d) => toDateStr(d) === todayStr);
  const todayColIdx   = weekDays.findIndex((d) => toDateStr(d) === todayStr);

  // content CRUD
  const handleCreateItem = async (data: Omit<DbContentItem, 'id' | 'created_at'>) => {
    const res = await fetch('/api/content', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create');
    const created: DbContentItem = await res.json();
    setItems((prev) => [...prev, created]);
  };

  const handleUpdateItem = async (data: Omit<DbContentItem, 'id' | 'created_at'>) => {
    if (!editItem) return;
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editItem.id, ...data }),
    });
    if (!res.ok) throw new Error('Failed to update');
    const updated: DbContentItem = await res.json();
    setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
  };

  const handleDeleteItem = async () => {
    if (!editItem) return;
    await fetch(`/api/content?id=${editItem.id}`, { method: 'DELETE' });
    setItems((prev) => prev.filter((i) => i.id !== editItem.id));
  };

  // banner CRUD
  const handleCreateBanner = async (data: Omit<DbBannerEvent, 'id' | 'created_at'>) => {
    const res = await fetch('/api/banner-events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create banner');
    const created: DbBannerEvent = await res.json();
    setBanners((prev) => [...prev, created]);
  };

  const handleUpdateBanner = async (data: Omit<DbBannerEvent, 'id' | 'created_at'>) => {
    if (!editBanner) return;
    const res = await fetch('/api/banner-events', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editBanner.id, ...data }),
    });
    if (!res.ok) throw new Error('Failed to update banner');
    const updated: DbBannerEvent = await res.json();
    setBanners((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
  };

  const handleDeleteBanner = async () => {
    if (!editBanner) return;
    await fetch(`/api/banner-events?id=${editBanner.id}`, { method: 'DELETE' });
    setBanners((prev) => prev.filter((b) => b.id !== editBanner.id));
  };

  // click inside a day column to create at that time
  const handleColumnClick = (e: React.MouseEvent<HTMLDivElement>, dateStr: string) => {
    const y = e.nativeEvent.offsetY;
    setNewItemDate(dateStr);
    setNewItemTime(pixelsToTime(y));
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <>
      <div className="flex h-full flex-col bg-white dark:bg-zinc-950">

        {/* Top bar */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-3 dark:border-zinc-800">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonday((d) => addDays(d, -7))}
              className="rounded-md p-2 text-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >‹</button>
            <h2 className="w-60 text-center text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              {formatWeekRange(monday, sunday)}
            </h2>
            <button
              onClick={() => setMonday((d) => addDays(d, 7))}
              className="rounded-md p-2 text-lg text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >›</button>
          </div>
          <div className="flex items-center gap-2">
            {loading && <span className="text-xs text-zinc-400">Loading…</span>}
            <button
              onClick={() => setMonday(getMonday(new Date()))}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >Today</button>
            <button
              onClick={() => { setNewItemDate(todayStr); setNewItemTime(undefined); }}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 dark:bg-blue-500"
            >+ New</button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <div style={{ width: GUTTER_W }} className="shrink-0" />
          <div className="grid flex-1 grid-cols-7">
            {weekDays.map((date, i) => {
              const dateStr = toDateStr(date);
              const isToday = dateStr === todayStr;
              return (
                <div
                  key={dateStr}
                  className="flex flex-col items-center border-r border-zinc-200 py-2 last:border-r-0 dark:border-zinc-800"
                >
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
                    {DAY_LABELS[i]}
                  </span>
                  <span
                    className={`mt-1 flex h-9 w-9 items-center justify-center rounded-full text-xl font-light ${
                      isToday ? 'bg-blue-600 font-semibold text-white' : 'text-zinc-800 dark:text-zinc-200'
                    }`}
                  >
                    {date.getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banner zone */}
        <div
          className="relative flex border-b border-zinc-200 dark:border-zinc-800"
          style={{ minHeight: `${Math.max(1, bannerRowCount) * 28 + 12}px` }}
        >
          <div style={{ width: GUTTER_W }} className="shrink-0" />
          <div className="relative flex-1">
            {/* Column shading */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-7">
              {weekDays.map((date, i) => (
                <div
                  key={i}
                  className={`border-r border-zinc-100 last:border-r-0 dark:border-zinc-800/60 ${
                    toDateStr(date) === todayStr ? 'bg-blue-50/40 dark:bg-blue-950/10' : ''
                  }`}
                />
              ))}
            </div>
            {/* Banner chips */}
            <div
              className="relative grid grid-cols-7 px-0.5 pt-1.5"
              style={{ gridAutoRows: '24px', gap: '3px 0' }}
            >
              {laidOutBanners.map((banner) => (
                <button
                  key={banner.id}
                  style={{ gridColumn: `${banner.colStart} / ${banner.colEnd}`, gridRow: banner.row + 1 }}
                  onClick={() => setEditBanner(banner)}
                  className={`mx-0.5 truncate rounded px-2.5 text-left text-xs font-medium text-white transition-opacity hover:opacity-80 ${
                    BANNER_COLOR_MAP[banner.color as keyof typeof BANNER_COLOR_MAP]?.bg ?? 'bg-zinc-500'
                  }`}
                >
                  {banner.title}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowNewBanner(true)}
              className="absolute right-2 top-1.5 rounded px-2 py-0.5 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
            >
              + week event
            </button>
          </div>
        </div>

        {/* Time grid */}
        <div ref={scrollRef} className="flex flex-1 overflow-y-auto">

          {/* Hour labels gutter */}
          <div className="relative shrink-0" style={{ width: GUTTER_W, height: HOUR_PX * 24 }}>
            {HOURS.map((h) =>
              h === 0 ? null : (
                <div
                  key={h}
                  className="absolute right-2 select-none text-right text-[10px] leading-none text-zinc-400 dark:text-zinc-600"
                  style={{ top: h * HOUR_PX - 6 }}
                >
                  {formatHourLabel(h)}
                </div>
              ),
            )}
          </div>

          {/* Main grid area */}
          <div className="relative flex flex-1 border-l border-zinc-200 dark:border-zinc-800" style={{ height: HOUR_PX * 24 }}>

            {/* Hour lines */}
            {HOURS.map((h) => (
              <div
                key={`h${h}`}
                className="pointer-events-none absolute left-0 right-0 border-t border-zinc-200 dark:border-zinc-800"
                style={{ top: h * HOUR_PX }}
              />
            ))}

            {/* Half-hour lines */}
            {HOURS.map((h) => (
              <div
                key={`hh${h}`}
                className="pointer-events-none absolute left-0 right-0 border-t border-zinc-100 dark:border-zinc-800/40"
                style={{ top: h * HOUR_PX + HOUR_PX / 2 }}
              />
            ))}

            {/* Current time indicator — spans only the today column */}
            {isTodayInWeek && nowPx !== null && (
              <div
                className="pointer-events-none absolute z-20 flex items-center"
                style={{
                  top:   nowPx - 1,
                  left:  `${(todayColIdx / 7) * 100}%`,
                  width: `${(1 / 7) * 100}%`,
                }}
              >
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" style={{ marginLeft: -5 }} />
                <div className="h-0.5 flex-1 bg-red-500" />
              </div>
            )}

            {/* Day columns */}
            {weekDays.map((date, colIdx) => {
              const dateStr  = toDateStr(date);
              const isToday  = dateStr === todayStr;
              const dayItems = (itemsByDate[dateStr] ?? []).filter((i) => i.scheduled_time !== null);

              return (
                <div
                  key={dateStr}
                  className={`relative flex-1 cursor-pointer border-r border-zinc-200 last:border-r-0 dark:border-zinc-800 ${
                    isToday ? 'bg-blue-50/20 dark:bg-blue-950/5' : ''
                  }`}
                  onClick={(e) => handleColumnClick(e, dateStr)}
                >
                  {dayItems.map((item) => {
                    const top    = timeToPixels(item.scheduled_time!);
                    const height = Math.max(durationToPixels(item.duration_minutes), 20);
                    const colors = STATUS_BLOCK[item.status] ?? STATUS_BLOCK.idea;
                    const isTall = height >= 40;

                    return (
                      <button
                        key={item.id}
                        onClick={(e) => { e.stopPropagation(); setEditItem(item); }}
                        style={{ top, height, left: 2, right: 2 }}
                        className={`absolute z-10 overflow-hidden rounded border-l-2 px-1.5 py-1 text-left transition-opacity hover:opacity-75 ${colors.bg} ${colors.border} ${colors.text}`}
                      >
                        <p className="truncate text-[11px] font-semibold leading-tight">{item.title}</p>
                        {isTall && item.scheduled_time && (
                          <p className="mt-0.5 text-[10px] opacity-60">
                            {formatTimeRange(item.scheduled_time, item.duration_minutes)}
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Modals */}
      {newItemDate && !editItem && (
        <ContentItemModal
          date={newItemDate}
          time={newItemTime}
          onSave={handleCreateItem}
          onClose={() => { setNewItemDate(null); setNewItemTime(undefined); }}
        />
      )}
      {editItem && (
        <ContentItemModal
          item={editItem}
          onSave={handleUpdateItem}
          onDelete={handleDeleteItem}
          onClose={() => setEditItem(null)}
        />
      )}
      {showNewBanner && !editBanner && (
        <BannerEventModal
          defaultStart={weekStart}
          defaultEnd={weekEnd}
          onSave={handleCreateBanner}
          onClose={() => setShowNewBanner(false)}
        />
      )}
      {editBanner && (
        <BannerEventModal
          banner={editBanner}
          onSave={handleUpdateBanner}
          onDelete={handleDeleteBanner}
          onClose={() => setEditBanner(null)}
        />
      )}
    </>
  );
}
