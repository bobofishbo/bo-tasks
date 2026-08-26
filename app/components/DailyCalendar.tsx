'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { CalEvent, CalEventStatus } from '../types';
import { getTodayEasternDate } from '../utils/dateUtils';

// ── Grid constants ──────────────────────────────────────────────────────────
const GRID_START = 8;
const GRID_END   = 26;
const TOTAL_H    = GRID_END - GRID_START;
const HOUR_PX    = 64;
const GUTTER_W   = 52;
const GRID_LEFT  = 16;
const TOTAL_PX   = TOTAL_H * HOUR_PX;

// ── Helpers ─────────────────────────────────────────────────────────────────
function toGridMin(hour: number, minute: number): number | null {
  const h = hour < 2 ? hour + 24 : hour;
  if (h < GRID_START || h >= GRID_END) return null;
  return (h - GRID_START) * 60 + minute;
}

function px(gridMin: number) { return (gridMin / 60) * HOUR_PX; }

function fmtHour(h: number): string {
  const actual = h % 24;
  if (actual === 0) return '12 AM';
  if (actual < 12) return `${actual} AM`;
  if (actual === 12) return '12 PM';
  return `${actual - 12} PM`;
}

function gridMinToHHMM(gridMin: number): string {
  const totalMin = (GRID_START * 60 + gridMin) % (24 * 60);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// ── Overlap layout ──────────────────────────────────────────────────────────
interface Positioned extends CalEvent {
  startMin: number;
  endMin: number;
  col: number;
  totalCols: number;
}

function positionEvents(events: CalEvent[]): Positioned[] {
  const withMin: Positioned[] = [];
  for (const ev of events) {
    const startMin = toGridMin(ev.start[0], ev.start[1]);
    if (startMin === null) continue;
    const rawEnd = toGridMin(ev.end[0], ev.end[1]);
    let endMin: number;
    if (rawEnd === null) endMin = TOTAL_H * 60;
    else if (rawEnd <= startMin) endMin = rawEnd + 24 * 60;
    else endMin = rawEnd;
    withMin.push({ ...ev, startMin, endMin, col: 0, totalCols: 1 });
  }
  withMin.sort((a, b) => a.startMin - b.startMin);
  const colEnds: number[] = [];
  for (const ev of withMin) {
    let c = colEnds.findIndex((end) => end <= ev.startMin);
    if (c === -1) c = colEnds.length;
    colEnds[c] = ev.endMin;
    ev.col = c;
  }
  for (const ev of withMin) {
    const overlaps = withMin.filter((o) => o.startMin < ev.endMin && o.endMin > ev.startMin);
    ev.totalCols = Math.max(...overlaps.map((o) => o.col + 1));
  }
  return withMin;
}

// ── Category tokens ──────────────────────────────────────────────────────────
const CAT: Record<CalEventStatus, { base: string; text: string; border?: string; stripe?: boolean }> = {
  accepted: { base: 'bg-blue-600',                             text: 'text-white' },
  tentative: { base: 'bg-blue-50 dark:bg-blue-950',            text: 'text-blue-800 dark:text-blue-200', border: 'border border-blue-400', stripe: true },
  declined:  { base: 'bg-transparent',                         text: 'text-zinc-400 line-through', border: 'border border-zinc-300 dark:border-zinc-600' },
  class:     { base: 'bg-emerald-600',                         text: 'text-white' },
  personal:  { base: 'bg-amber-50 dark:bg-amber-900/70',       text: 'text-amber-900 dark:text-amber-200', border: 'border border-amber-400', stripe: true },
  task:      { base: 'bg-violet-600',                          text: 'text-white' },
};

const STRIPE_STYLE: React.CSSProperties = {
  backgroundImage: 'repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(0,0,0,0.07) 4px,rgba(0,0,0,0.07) 8px)',
};

// ── Event block ──────────────────────────────────────────────────────────────
function EventBlock({ ev }: { ev: Positioned }) {
  const top    = px(ev.startMin);
  const height = Math.max(px(ev.endMin - ev.startMin), 20);
  const isShort = height < 36;
  const cat  = CAT[ev.status];
  const leftPct  = (ev.col / ev.totalCols) * 100;
  const widthPct = (1 / ev.totalCols) * 100;
  return (
    <div
      className={`absolute rounded-md overflow-hidden px-2 py-1 text-xs leading-tight cursor-default
        ${cat.base} ${cat.text} ${cat.border ?? ''}`}
      style={{
        top: top + 1,
        height: height - 2,
        left: `calc(${leftPct}% + 28px)`,
        width: `calc(${widthPct * 0.80}% - 4px)`,
        ...(cat.stripe ? STRIPE_STYLE : {}),
      }}
      title={`${ev.title}${ev.sub ? ` · ${ev.sub}` : ''}`}
    >
      {isShort ? (
        <span className="font-medium truncate">{ev.title}</span>
      ) : (
        <>
          <div className="font-semibold truncate">{ev.title}</div>
          {ev.sub && <div className="truncate opacity-80">{ev.sub}</div>}
        </>
      )}
    </div>
  );
}

// ── Quick-create popover ─────────────────────────────────────────────────────
interface QuickCreate {
  gridMin: number; // snapped start, used to position the popover
  top: number;     // px position in event area
}

// ── Main component ───────────────────────────────────────────────────────────
interface Props {
  onTaskCreated: () => void;
}

export function DailyCalendar({ onTaskCreated }: Props) {
  const [gcalEvents, setGcalEvents] = useState<CalEvent[]>([]);
  const [gcalLoading, setGcalLoading] = useState(true);
  const [quickCreate, setQuickCreate] = useState<QuickCreate | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [startHHMM, setStartHHMM] = useState('');
  const [endHHMM, setEndHHMM] = useState('');
  const [saving, setSaving] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const eventAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const today = getTodayEasternDate();

  const loadEvents = useCallback(() => {
    setGcalLoading(true);
    return fetch(`/api/gcal/events?date=${today}`)
      .then((r) => r.json())
      .then((data) => setGcalEvents(Array.isArray(data) ? data : []))
      .catch(() => setGcalEvents([]))
      .finally(() => setGcalLoading(false));
  }, [today]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const allEvents = positionEvents(gcalEvents);

  // Now indicator
  const [nowMin, setNowMin] = useState<number | null>(null);
  useEffect(() => {
    function update() { setNowMin(toGridMin(new Date().getHours(), new Date().getMinutes())); }
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (nowMin !== null && scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, px(nowMin) - 120);
    }
  }, [nowMin]);

  // Click on empty grid area → quick-create
  const handleAreaClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('[data-event-block]')) return;
    if ((e.target as HTMLElement).closest('[data-quick-create]')) return;
    const rect = eventAreaRef.current!.getBoundingClientRect();
    const rawMin = ((e.clientY - rect.top + scrollRef.current!.scrollTop) / HOUR_PX) * 60;
    const snapped = Math.round(rawMin / 15) * 15;
    const clamped = Math.max(0, Math.min(TOTAL_H * 60 - 60, snapped));
    setQuickCreate({ gridMin: clamped, top: px(clamped) });
    setNewTaskName('');
    setStartHHMM(gridMinToHHMM(clamped));
    setEndHHMM(gridMinToHHMM(clamped + 60));
    setTimeout(() => inputRef.current?.focus(), 0);
  }, []);

  const handleSave = async () => {
    if (!newTaskName.trim() || !quickCreate || !startHHMM || !endHHMM) return;
    setSaving(true);
    const [sh, sm] = startHHMM.split(':').map(Number);
    const [eh, em] = endHHMM.split(':').map(Number);
    let durationMin = (eh * 60 + em) - (sh * 60 + sm);
    if (durationMin <= 0) durationMin += 24 * 60;
    try {
      const taskRes = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTaskName.trim(), hours: durationMin / 60, date: today }),
      });
      if (!taskRes.ok) throw new Error();
      const task = await taskRes.json();
      await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, start_time: startHHMM, end_time: endHHMM }),
      });
      onTaskCreated();
    } finally {
      setSaving(false);
      setQuickCreate(null);
      setNewTaskName('');
    }
  };

  const hours = Array.from({ length: TOTAL_H }, (_, i) => GRID_START + i);

  return (
    <div className="flex flex-col rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-700">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">Schedule</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Dot className="bg-blue-600" /> Meeting
            <Dot className="bg-emerald-600" /> Class
            <Dot className="bg-violet-600" /> Task
          </div>
          <button
            onClick={loadEvents}
            disabled={gcalLoading}
            title="Re-sync with Google Calendar"
            className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600 disabled:opacity-50 dark:hover:bg-zinc-800 dark:hover:text-zinc-300"
          >
            <SyncIcon spinning={gcalLoading} />
            {gcalLoading ? 'Syncing…' : 'Sync'}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div ref={scrollRef} className="relative overflow-y-auto" style={{ maxHeight: '70vh' }}>
        <div className="relative" style={{ height: TOTAL_PX }}>
          {/* Hour rows */}
          {hours.map((h) => {
            const gridMin = (h - GRID_START) * 60;
            const isMidnight = h === 24;
            return (
              <div key={h} className="absolute left-0 right-0" style={{ top: px(gridMin), height: HOUR_PX }}>
                {isMidnight ? (
                  <div className="absolute inset-x-0 top-0 z-10 flex items-center border-t-2 border-zinc-400 dark:border-zinc-500">
                    <span className="rounded bg-zinc-200 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300"
                      style={{ marginLeft: GRID_LEFT + GUTTER_W - 4 }}>
                      midnight
                    </span>
                  </div>
                ) : (
                  <div className="absolute inset-x-0 top-0 border-t border-zinc-100 dark:border-zinc-800" />
                )}
                <div className="absolute top-0 flex items-start pt-1 font-mono text-[11px] text-zinc-400 dark:text-zinc-500"
                  style={{ width: GUTTER_W, left: GRID_LEFT }}>
                  {fmtHour(h)}
                </div>
              </div>
            );
          })}

          {/* Event area — clickable */}
          <div
            ref={eventAreaRef}
            className="absolute top-0 bottom-0 cursor-pointer"
            style={{ left: GRID_LEFT + GUTTER_W, right: 0 }}
            onClick={handleAreaClick}
          >
            {allEvents.map((ev) => (
              <div key={ev.id} data-event-block>
                <EventBlock ev={ev} />
              </div>
            ))}

            {/* Quick-create popover */}
            {quickCreate && (
              <div
                data-quick-create
                className="absolute z-30 flex flex-col gap-2 rounded-lg border border-violet-400 bg-white px-3 py-2 shadow-lg dark:bg-zinc-800"
                style={{ top: quickCreate.top, left: 28, right: 8 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 shrink-0 rounded-sm bg-violet-600" />
                  <input
                    ref={inputRef}
                    value={newTaskName}
                    onChange={(e) => setNewTaskName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setQuickCreate(null);
                    }}
                    placeholder="Task name…"
                    className="min-w-0 flex-1 bg-transparent text-sm text-zinc-800 outline-none placeholder:text-zinc-400 dark:text-zinc-100"
                  />
                </div>
                <div className="flex items-center gap-2 pl-5">
                  <input
                    type="time"
                    value={startHHMM}
                    onChange={(e) => setStartHHMM(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setQuickCreate(null);
                    }}
                    className="rounded border border-zinc-200 bg-transparent px-1 py-0.5 font-mono text-xs text-zinc-600 outline-none dark:border-zinc-600 dark:text-zinc-300"
                  />
                  <span className="text-xs text-zinc-400">–</span>
                  <input
                    type="time"
                    value={endHHMM}
                    onChange={(e) => setEndHHMM(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSave();
                      if (e.key === 'Escape') setQuickCreate(null);
                    }}
                    className="rounded border border-zinc-200 bg-transparent px-1 py-0.5 font-mono text-xs text-zinc-600 outline-none dark:border-zinc-600 dark:text-zinc-300"
                  />
                  <div className="ml-auto flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={saving || !newTaskName.trim()}
                      className="shrink-0 rounded bg-violet-600 px-2 py-0.5 text-xs text-white disabled:opacity-40 hover:bg-violet-700"
                    >
                      {saving ? '…' : 'Add'}
                    </button>
                    <button onClick={() => setQuickCreate(null)} className="shrink-0 text-xs text-zinc-400 hover:text-zinc-600">✕</button>
                  </div>
                </div>
              </div>
            )}

            {/* Now indicator */}
            {nowMin !== null && (
              <div className="pointer-events-none absolute left-0 right-0 z-20 flex items-center" style={{ top: px(nowMin) }}>
                <div className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500" style={{ marginLeft: -5 }} />
                <div className="h-px flex-1 bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function SyncIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`}
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
