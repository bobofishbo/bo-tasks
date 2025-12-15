'use client';

import { Task } from '../types';
import { getTodayEasternDate } from '../utils/dateUtils';

interface TodayHoursProps {
  tasks: Task[];
}

export function TodayHours({ tasks }: TodayHoursProps) {
  const today = getTodayEasternDate();
  const todayTasks = tasks.filter((task) => task.date === today);
  
  const totalHoursExpected = todayTasks.reduce((sum, task) => sum + task.hours, 0);
  const totalHoursCompleted = todayTasks
    .filter((task) => task.completed)
    .reduce((sum, task) => sum + task.hours, 0);

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-sm dark:bg-zinc-900">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Hours Expected</p>
          <p className="text-xl font-semibold text-black dark:text-zinc-50">
            <span className="text-blue-600 dark:text-blue-400">{totalHoursExpected.toFixed(1)}</span> hours
          </p>
        </div>
        <div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Hours Completed</p>
          <p className="text-xl font-semibold text-black dark:text-zinc-50">
            <span className="text-green-600 dark:text-green-400">{totalHoursCompleted.toFixed(1)}</span> hours
          </p>
        </div>
        {totalHoursExpected > 0 && (
          <div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">Progress</p>
            <p className="text-xl font-semibold text-black dark:text-zinc-50">
              <span className="text-purple-600 dark:text-purple-400">
                {((totalHoursCompleted / totalHoursExpected) * 100).toFixed(0)}%
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

