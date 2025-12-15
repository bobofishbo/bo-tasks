'use client';

import { useTasks } from '../hooks/useTasks';
import { Navigation } from '../components/Navigation';
import { TodayHours } from '../components/TodayHours';
import { NotesBlock } from '../components/NotesBlock';
import { TaskItem } from '../components/TaskItem';
import { getTodayEasternDate, getTodayEasternDateObject } from '../utils/dateUtils';

export default function WeekPage() {
  const { tasks, loading, toggleTask, deleteTask } = useTasks();

  const today = getTodayEasternDateObject();
  const todayStr = getTodayEasternDate();

  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
  weekStart.setHours(0, 0, 0, 0);

  const weekTasks = tasks.filter((task) => {
    const taskDate = new Date(task.date + 'T00:00:00');
    return taskDate >= weekStart && taskDate <= today;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <h1 className="mb-6 text-4xl font-bold text-black dark:text-zinc-50">
          Task Manager
        </h1>

        <NotesBlock />
        <TodayHours tasks={tasks} />
        <Navigation />

        <div className="rounded-lg bg-white shadow-sm dark:bg-zinc-900">
          <div className="p-6">
            <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
              This Week's Tasks
            </h2>

            {weekTasks.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400">No tasks found.</p>
            ) : (
              <div className="space-y-3">
                {weekTasks.map((task) => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={toggleTask}
                    onDelete={deleteTask}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

