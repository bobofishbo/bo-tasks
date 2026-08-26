'use client';

import { Task } from '../types';
import { getTodayEasternDate } from '../utils/dateUtils';

interface Props {
  tasks: Task[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatHours(h: number): string {
  if (h === Math.floor(h)) return `${h}h`;
  return `${h}h`;
}

export function TodoList({ tasks, onToggle, onDelete }: Props) {
  const today = getTodayEasternDate();

  // Show today's tasks + rolled-over incomplete past tasks
  const visible = tasks.filter(
    (t) => t.date === today || (t.date < today && !t.completed),
  );

  const done = visible.filter((t) => t.completed).length;
  const hoursLeft = visible
    .filter((t) => !t.completed)
    .reduce((sum, t) => sum + (t.hours ?? 0), 0);

  const estimated = visible.filter((t) => t.hours > 0 && !t.completed).length;
  const unestimated = visible.filter((t) => (!t.hours || t.hours === 0) && !t.completed).length;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3 dark:border-zinc-700">
        <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-200">
          To-do
        </span>
        <span className="font-mono text-xs text-zinc-500 dark:text-zinc-400">
          {done}/{visible.length} done
          {hoursLeft > 0 && ` · ${formatHours(hoursLeft)} left`}
          {unestimated > 0 && ` · ${unestimated} unestimated`}
        </span>
      </div>

      {/* Items */}
      {visible.length === 0 ? (
        <p className="px-5 py-4 text-sm text-zinc-400 dark:text-zinc-500">
          No tasks for today.
        </p>
      ) : (
        <ul>
          {visible.map((task) => {
            const isRolledOver = task.date < today && !task.completed;
            return (
              <li
                key={task.id}
                className="flex items-center gap-3 border-b border-zinc-100 px-5 py-3 last:border-0 dark:border-zinc-800"
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => onToggle(task.id)}
                  className="h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-300 text-blue-600 accent-blue-600 dark:border-zinc-600"
                />
                <div className="min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium ${
                      task.completed
                        ? 'text-zinc-400 line-through dark:text-zinc-500'
                        : 'text-zinc-800 dark:text-zinc-100'
                    }`}
                  >
                    {task.name}
                  </span>
                  <div className="mt-0.5 flex items-center gap-2">
                    {task.hours > 0 && (
                      <span className="font-mono text-xs text-zinc-400 dark:text-zinc-500">
                        {formatHours(task.hours)}
                      </span>
                    )}
                    {isRolledOver && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                        Rolled over
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDelete(task.id)}
                  className="ml-1 shrink-0 text-xs text-zinc-300 hover:text-red-400 dark:text-zinc-600 dark:hover:text-red-400"
                  aria-label="Delete task"
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
