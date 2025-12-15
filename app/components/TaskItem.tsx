'use client';

import { Task } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function TaskItem({ task, onToggle, onDelete }: TaskItemProps) {
  return (
    <div
      className={`flex items-center gap-4 rounded-lg border p-4 transition-colors ${
        task.completed
          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20'
          : 'border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800'
      }`}
    >
      <input
        type="checkbox"
        checked={task.completed}
        onChange={() => onToggle(task.id)}
        className="h-5 w-5 cursor-pointer rounded border-zinc-300 text-blue-600 focus:ring-2 focus:ring-blue-500 dark:border-zinc-600"
      />
      <div className="flex-1">
        <p
          className={`font-medium ${
            task.completed
              ? 'text-zinc-500 line-through dark:text-zinc-400'
              : 'text-black dark:text-zinc-50'
          }`}
        >
          {task.name}
        </p>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {task.hours} hours • {new Date(task.date).toLocaleDateString()}
        </p>
      </div>
      <button
        onClick={() => onDelete(task.id)}
        className="rounded px-3 py-1 text-sm text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
      >
        Delete
      </button>
    </div>
  );
}

