'use client';

import { useState, useEffect } from 'react';
import { Task } from '../types';
import { getTodayEasternDate } from '../utils/dateUtils';

interface AddTaskFormProps {
  onAdd: (task: Omit<Task, 'id'>) => void;
}

export function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [taskName, setTaskName] = useState('');
  const [taskHours, setTaskHours] = useState('');
  const [taskDate, setTaskDate] = useState('');

  useEffect(() => {
    const today = getTodayEasternDate();
    setTaskDate(today);
  }, []);

  const handleSubmit = () => {
    if (!taskName.trim() || !taskHours || !taskDate) {
      alert('Please fill in all fields');
      return;
    }

    onAdd({
      name: taskName,
      hours: parseFloat(taskHours),
      completed: false,
      date: taskDate,
    });

    setTaskName('');
    setTaskHours('');
    setTaskDate(getTodayEasternDate());
  };

  return (
    <div className="mb-8 rounded-lg bg-white p-6 shadow-sm dark:bg-zinc-900">
      <h2 className="mb-4 text-xl font-semibold text-black dark:text-zinc-50">
        Add New Task
      </h2>
      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Task name"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          className="flex-1 rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <input
          type="number"
          placeholder="Hours"
          value={taskHours}
          onChange={(e) => setTaskHours(e.target.value)}
          step="0.5"
          min="0"
          className="w-32 rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <input
          type="date"
          value={taskDate}
          onChange={(e) => setTaskDate(e.target.value)}
          className="w-40 rounded-lg border border-zinc-300 px-4 py-2 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-50"
        />
        <button
          onClick={handleSubmit}
          className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          Add Task
        </button>
      </div>
    </div>
  );
}

