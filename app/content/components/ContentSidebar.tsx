'use client';

import { useState } from 'react';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

// Sun-first header to match GCal style
const DAY_HDRS = ['S','M','T','W','T','F','S'];

function getMiniCalDays(year: number, month: number): (number | null)[] {
  const firstWeekday = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth  = new Date(year, month + 1, 0).getDate();
  const days: (number | null)[] = Array(firstWeekday).fill(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);
  return days;
}

const MY_CALENDARS = [
  { label: 'Golf Content',   color: 'bg-blue-500' },
  { label: 'Ideas',          color: 'bg-amber-400' },
  { label: 'Planning',       color: 'bg-purple-500' },
];

const OTHER_CALENDARS = [
  { label: 'Tournaments',    color: 'bg-green-500' },
  { label: 'Partnerships',   color: 'bg-cyan-500' },
];

export function ContentSidebar() {
  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const todayY = today.getFullYear();
  const todayM = today.getMonth();
  const todayD = today.getDate();

  const days = getMiniCalDays(year, month);

  const prev = () => {
    if (month === 0) { setMonth(11); setYear((y) => y - 1); }
    else setMonth((m) => m - 1);
  };
  const next = () => {
    if (month === 11) { setMonth(0); setYear((y) => y + 1); }
    else setMonth((m) => m + 1);
  };

  return (
    <div className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-zinc-200 bg-white py-3 dark:border-zinc-800 dark:bg-zinc-950">

      {/* Create button */}
      <div className="px-3 pb-3">
        <button className="flex items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 shadow-sm transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          <span className="text-lg leading-none text-zinc-500 dark:text-zinc-400">+</span>
          Create
        </button>
      </div>

      {/* Mini calendar */}
      <div className="px-3 pb-2">
        {/* Month nav */}
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
            {MONTH_NAMES[month]} {year}
          </span>
          <div className="flex">
            <button
              onClick={prev}
              className="rounded p-0.5 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >‹</button>
            <button
              onClick={next}
              className="rounded p-0.5 text-sm text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-800"
            >›</button>
          </div>
        </div>

        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 text-center">
          {DAY_HDRS.map((d, i) => (
            <div key={i} className="py-0.5 text-[10px] font-medium text-zinc-400 dark:text-zinc-600">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 text-center">
          {days.map((d, i) => {
            const isToday = d !== null && d === todayD && year === todayY && month === todayM;
            return (
              <div
                key={i}
                className={`flex h-6 w-6 items-center justify-center justify-self-center rounded-full text-[11px] ${
                  d === null
                    ? ''
                    : isToday
                    ? 'bg-blue-600 font-semibold text-white'
                    : 'cursor-pointer text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800'
                }`}
              >
                {d ?? ''}
              </div>
            );
          })}
        </div>
      </div>

      {/* Divider */}
      <div className="mx-3 my-2 border-t border-zinc-100 dark:border-zinc-800" />

      {/* My calendars */}
      <div className="px-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            My calendars
          </span>
          <button className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
            </svg>
          </button>
        </div>
        {MY_CALENDARS.map(({ label, color }) => (
          <div key={label} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <div className={`h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} />
            <span className="text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
          </div>
        ))}
      </div>

      {/* Other calendars */}
      <div className="mt-3 px-3">
        <div className="mb-1 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-500">
            Other calendars
          </span>
          <button className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
        {OTHER_CALENDARS.map(({ label, color }) => (
          <div key={label} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900">
            <div className={`h-2.5 w-2.5 shrink-0 rounded-sm ${color}`} />
            <span className="text-xs text-zinc-700 dark:text-zinc-300">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
