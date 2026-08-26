'use client';

import { useTasks } from '../hooks/useTasks';
import { Navigation } from '../components/Navigation';
import { AddTaskForm } from '../components/AddTaskForm';
import { TodoList } from '../components/TodoList';
import { DailyCalendar } from '../components/DailyCalendar';
import { PinnedTasks } from '../components/PinnedTasks';
import { getTodayEasternDate } from '../utils/dateUtils';

export default function TodayPage() {
  const { tasks, loading, addTask, toggleTask, deleteTask, refreshTasks } = useTasks();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-sm text-zinc-400">Loading…</p>
      </div>
    );
  }

  const today = getTodayEasternDate();
  const fmt = new Date(today + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Date heading */}
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">{fmt}</h1>
        <Navigation />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_600px]">
          {/* Left — tasks */}
          <div className="space-y-4">
            <PinnedTasks />
            <AddTaskForm onAdd={addTask} />
            <TodoList tasks={tasks} onToggle={toggleTask} onDelete={deleteTask} />
          </div>

          {/* Right — schedule */}
          <div className="min-w-0">
            <DailyCalendar onTaskCreated={refreshTasks} />
          </div>
        </div>
      </div>
    </div>
  );
}
