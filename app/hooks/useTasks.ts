'use client';

import { useState, useEffect } from 'react';
import { Task, TimeBlock } from '../types';

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all tasks and their time blocks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksResponse = await fetch('/api/tasks');
      if (!tasksResponse.ok) throw new Error('Failed to fetch tasks');
      const tasksData = await tasksResponse.json();

      // Fetch time blocks for all tasks
      const tasksWithBlocks = await Promise.all(
        tasksData.map(async (task: any) => {
          const blocksResponse = await fetch(`/api/time-blocks?task_id=${task.id}`);
          const blocks = blocksResponse.ok ? await blocksResponse.json() : [];
          return {
            ...task,
            timeBlocks: blocks.map((block: any) => ({
              id: block.id,
              taskId: block.task_id,
              startTime: block.start_time,
              endTime: block.end_time,
            })),
          };
        })
      );

      setTasks(tasksWithBlocks);
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
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: task.name,
          hours: task.hours,
          date: task.date,
        }),
      });

      if (!response.ok) throw new Error('Failed to create task');
      const newTask = await response.json();
      setTasks([...tasks, { ...newTask, timeBlocks: [] }]);
    } catch (error) {
      console.error('Error adding task:', error);
      throw error;
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    try {
      const response = await fetch('/api/tasks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          completed: !task.completed,
        }),
      });

      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      setTasks(tasks.map((t) => (t.id === id ? { ...t, ...updatedTask } : t)));
    } catch (error) {
      console.error('Error toggling task:', error);
    }
  };

  const deleteTask = async (id: string) => {
    try {
      const response = await fetch(`/api/tasks?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete task');
      setTasks(tasks.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const addTimeBlock = async (taskId: string, startTime: string, endTime: string) => {
    try {
      const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task_id: taskId,
          start_time: startTime,
          end_time: endTime,
        }),
      });

      if (!response.ok) throw new Error('Failed to create time block');
      const newBlock = await response.json();

      const timeBlock: TimeBlock = {
        id: newBlock.id,
        taskId: newBlock.task_id,
        startTime: newBlock.start_time,
        endTime: newBlock.end_time,
      };

      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, timeBlocks: [...(t.timeBlocks || []), timeBlock] }
            : t
        )
      );
    } catch (error) {
      console.error('Error adding time block:', error);
      throw error;
    }
  };

  const deleteTimeBlock = async (taskId: string, blockId: string) => {
    try {
      const response = await fetch(`/api/time-blocks?id=${blockId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete time block');
      setTasks(
        tasks.map((t) =>
          t.id === taskId
            ? { ...t, timeBlocks: (t.timeBlocks || []).filter((b) => b.id !== blockId) }
            : t
        )
      );
    } catch (error) {
      console.error('Error deleting time block:', error);
    }
  };

  return {
    tasks,
    loading,
    addTask,
    toggleTask,
    deleteTask,
    addTimeBlock,
    deleteTimeBlock,
    refreshTasks: fetchTasks,
  };
}
