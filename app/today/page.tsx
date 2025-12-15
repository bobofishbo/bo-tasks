'use client';

import { useTasks } from '../hooks/useTasks';
import { Navigation } from '../components/Navigation';
import { TodayHours } from '../components/TodayHours';
import { NotesBlock } from '../components/NotesBlock';
import { AddTaskForm } from '../components/AddTaskForm';
import { TaskItem } from '../components/TaskItem';
import { TimeCalendar } from '../components/TimeCalendar';
import { getTodayEasternDate } from '../utils/dateUtils';

export default function TodayPage() {
  const { tasks, loading, addTask, toggleTask, deleteTask, addTimeBlock, deleteTimeBlock } = useTasks();

  const today = getTodayEasternDate();
  const todayTasks = tasks.filter((task) => task.date === today);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black">
        <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <h1 className="mb-6 text-4xl font-bold text-black dark:text-zinc-50">
          Task Manager
        </h1>

        <NotesBlock />
        <TodayHours tasks={tasks} />
        <Navigation />

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Tasks (2/3 of screen) */}
          <div className="space-y-6 lg:col-span-2">
            <AddTaskForm onAdd={addTask} />

            <div className="rounded-lg bg-white shadow-sm dark:bg-zinc-900">
              <div className="p-6">
                <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
                  Today's Tasks
                </h2>

                {todayTasks.length === 0 ? (
                  <p className="text-zinc-500 dark:text-zinc-400">No tasks found.</p>
                ) : (
                  <div className="space-y-3">
                    {todayTasks.map((task) => (
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

          {/* Right Column - Calendar (1/3 of screen) */}
          <div className="lg:col-span-1">
            <TimeCalendar
              tasks={todayTasks}
              onAddTimeBlock={addTimeBlock}
              onDeleteTimeBlock={deleteTimeBlock}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

