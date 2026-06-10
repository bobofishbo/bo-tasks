'use client';

import { useState, useEffect } from 'react';
import { Task, TimeBlock } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [tasksRes, blocksRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/time-blocks'),
      ]);

      if (!tasksRes.ok) throw new Error('Failed to fetch tasks');
      const [tasksData, blocksData]: [any[], any[]] = await Promise.all([
        tasksRes.json(),
        blocksRes.ok ? blocksRes.json() : Promise.resolve([]),
      ]);

      // Group blocks by task_id in one pass
      const blocksByTask = new Map<string, TimeBlock[]>();
      for (const b of blocksData) {
        const block: TimeBlock = {
          id: b.id,
          taskId: b.task_id,
          startTime: b.start_time,
          endTime: b.end_time,
        };
        const existing = blocksByTask.get(b.task_id);
        if (existing) existing.push(block);
        else blocksByTask.set(b.task_id, [block]);
      }

      setTasks(tasksData.map((t) => ({ ...t, timeBlocks: blocksByTask.get(t.id) ?? [] })));
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (task: Omit<Task, 'id' | 'timeBlocks'>) => {
    const response = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: task.name, hours: task.hours, date: task.date }),
    });
    if (!response.ok) throw new Error('Failed to create task');
    const newTask = await response.json();
    setTasks((prev) => [...prev, { ...newTask, timeBlocks: [] }]);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !task.completed }),
      });
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete task');
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addTimeBlock = async (taskId: string, startTime: string, endTime: string) => {
    const response = await fetch('/api/time-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId, start_time: startTime, end_time: endTime }),
    });
    if (!response.ok) throw new Error('Failed to create time block');
    const newBlock = await response.json();
    const block: TimeBlock = {
      id: newBlock.id,
      taskId: newBlock.task_id,
      startTime: newBlock.start_time,
      endTime: newBlock.end_time,
    };
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId ? { ...t, timeBlocks: [...(t.timeBlocks ?? []), block] } : t
      )
    );
  };

  const deleteTimeBlock = async (taskId: string, blockId: string) => {
    try {
      const response = await fetch(`/api/time-blocks?id=${blockId}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete time block');
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId
            ? { ...t, timeBlocks: (t.timeBlocks ?? []).filter((b) => b.id !== blockId) }
            : t
        )
      );
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  return { tasks, loading, addTask, toggleTask, deleteTask, addTimeBlock, deleteTimeBlock, refreshTasks: fetchTasks };
}
