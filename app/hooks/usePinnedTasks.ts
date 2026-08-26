'use client';

import { useState, useEffect } from 'react';
import type { PinnedTask } from '../types';
import { getTodayEasternDate } from '../utils/dateUtils';

export function usePinnedTasks() {
  const [tasks, setTasks] = useState<PinnedTask[]>([]);
  const [loading, setLoading] = useState(true);
  const today = getTodayEasternDate();

  useEffect(() => {
    fetch('/api/pinned-tasks')
      .then((r) => r.json())
      .then((data) => setTasks(Array.isArray(data) ? data : []))
      .catch(() => setTasks([]))
      .finally(() => setLoading(false));
  }, []);

  // Only show tasks relevant for today
  const visible = tasks.filter((t) => {
    if (t.recurrence === 'daily') return true;
    // weekly: show only on matching day of week
    const dow = new Date(today + 'T12:00:00').getDay();
    return t.day_of_week === dow;
  });

  const toggle = async (task: PinnedTask) => {
    const newDate = task.completed_date === today ? null : today;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, completed_date: newDate } : t)),
    );
    await fetch('/api/pinned-tasks', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: task.id, completed_date: newDate }),
    });
  };

  const add = async (title: string, recurrence: 'daily' | 'weekly', hours?: number) => {
    const dow = recurrence === 'weekly'
      ? new Date(today + 'T12:00:00').getDay()
      : null;
    const res = await fetch('/api/pinned-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, recurrence, hours: hours ?? null, day_of_week: dow }),
    });
    if (res.ok) {
      const created = await res.json();
      setTasks((prev) => [...prev, created]);
    }
  };

  const remove = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    await fetch(`/api/pinned-tasks?id=${id}`, { method: 'DELETE' });
  };

  return { visible, loading, toggle, add, remove };
}
