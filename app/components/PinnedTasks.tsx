'use client';

import { useState } from 'react';
import { usePinnedTasks } from '../hooks/usePinnedTasks';
import { getTodayEasternDate } from '../utils/dateUtils';

function PinIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="shrink-0 text-amber-500">
      <path d="M16 2a1 1 0 0 1 .894.553l2 4A1 1 0 0 1 18 8h-1v5.382l2.447 4.894A1 1 0 0 1 18.5 20H14v2a1 1 0 0 1-2 0v-2H7.5a1 1 0 0 1-.894-1.447L9 12.382V8H8a1 1 0 0 1-.894-1.447l2-4A1 1 0 0 1 10 2h6zm-4 6v6a1 1 0 0 1-.105.447L9.882 18h8.236l-2.013-4.025A1 1 0 0 1 16 13.5V8h-4z"/>
    </svg>
  );
}

const DOW_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function PinnedTasks() {
  const { visible, loading, toggle, add, remove } = usePinnedTasks();
  const today = getTodayEasternDate();

  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newRecurrence, setNewRecurrence] = useState<'daily' | 'weekly'>('daily');

  const handleAdd = async () => {
    if (!newTitle.trim()) return;
    await add(newTitle.trim(), newRecurrence);
    setNewTitle('');
    setShowForm(false);
  };

  if (loading) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:border-amber-800/50 dark:bg-amber-900/10">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-amber-200 px-5 py-3 dark:border-amber-800/50">
        <div className="flex items-center gap-2">
          <PinIcon />
          <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Pinned</span>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="rounded px-2 py-0.5 text-xs text-amber-600 hover:bg-amber-100 dark:text-amber-400 dark:hover:bg-amber-900/40"
        >
          {showForm ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="flex items-center gap-2 border-b border-amber-200 px-5 py-3 dark:border-amber-800/50">
          <input
            autoFocus
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Task name…"
            className="min-w-0 flex-1 rounded border border-amber-300 bg-white px-2 py-1 text-sm dark:border-amber-700 dark:bg-zinc-800 dark:text-zinc-100"
          />
          <select
            value={newRecurrence}
            onChange={(e) => setNewRecurrence(e.target.value as 'daily' | 'weekly')}
            className="rounded border border-amber-300 bg-white px-2 py-1 text-xs dark:border-amber-700 dark:bg-zinc-800 dark:text-zinc-100"
          >
            <option value="daily">Daily</option>
            <option value="weekly">This weekday</option>
          </select>
          <button
            onClick={handleAdd}
            className="rounded bg-amber-500 px-3 py-1 text-xs font-medium text-white hover:bg-amber-600"
          >
            Pin
          </button>
        </div>
      )}

      {/* Task list */}
      {visible.length === 0 && !showForm ? (
        <p className="px-5 py-3 text-xs text-amber-600/70 dark:text-amber-500/60">
          No pinned tasks for today.
        </p>
      ) : (
        <ul>
          {visible.map((task) => {
            const done = task.completed_date === today;
            const label = task.recurrence === 'weekly' && task.day_of_week !== null
              ? `Every ${DOW_LABELS[task.day_of_week]}`
              : 'Daily';
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 border-b border-amber-100 px-5 py-3 last:border-0 dark:border-amber-900/30"
              >
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => toggle(task)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-amber-300 accent-amber-500"
                />
                <PinIcon />
                <div className="min-w-0 flex-1">
                  <span className={`text-sm font-medium ${done ? 'text-zinc-400 line-through dark:text-zinc-500' : 'text-zinc-800 dark:text-zinc-100'}`}>
                    {task.title}
                  </span>
                  <div className="mt-0.5 text-[10px] text-amber-600/70 dark:text-amber-500/60">{label}</div>
                </div>
                <button
                  onClick={() => remove(task.id)}
                  className="text-xs text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
                  aria-label="Unpin"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
