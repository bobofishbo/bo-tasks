'use client';

import { useState, useRef, useEffect } from 'react';
import { Task, TimeBlock } from '../types';

interface TimeCalendarProps {
  tasks: Task[];
  onAddTimeBlock: (taskId: string, startTime: string, endTime: string) => void;
  onDeleteTimeBlock: (taskId: string, blockId: string) => void;
}

export function TimeCalendar({ tasks, onAddTimeBlock, onDeleteTimeBlock }: TimeCalendarProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragEnd, setDragEnd] = useState<number | null>(null);
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [pendingTimeBlock, setPendingTimeBlock] = useState<{ startTime: string; endTime: string } | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Generate 24 hours (00:00 to 23:00)
  const hours = Array.from({ length: 24 }, (_, i) => {
    return String(i).padStart(2, '0') + ':00';
  });

  // Get all time blocks for today's tasks
  const allTimeBlocks = tasks.flatMap((task) =>
    (task.timeBlocks || []).map((block) => ({
      ...block,
      taskName: task.name,
      taskId: task.id,
      completed: task.completed,
    }))
  );

  // Convert minutes to time string (HH:MM)
  const minutesToTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
  };

  // Convert time string to minutes
  const timeToMinutes = (time: string): number => {
    const [hours, mins] = time.split(':').map(Number);
    return hours * 60 + mins;
  };

  // Get minutes from Y position
  const getMinutesFromY = (clientY: number): number => {
    if (!calendarRef.current || !scrollContainerRef.current) return 0;
    
    // Get the scroll container's position relative to viewport
    const scrollContainerRect = scrollContainerRef.current.getBoundingClientRect();
    // Get how much we've scrolled
    const scrollTop = scrollContainerRef.current.scrollTop;
    
    // Calculate the Y position relative to the top of the scrollable content
    // clientY is relative to viewport, subtract scroll container's top to get position in scroll container
    // then add scrollTop to get position in the actual calendar content
    const relativeY = (clientY - scrollContainerRect.top) + scrollTop;
    
    // Each hour is 80px, so each minute is 80/60 = 1.333...px
    const minutesPerPixel = 60 / 80; // 0.75 minutes per pixel
    const minutes = relativeY * minutesPerPixel;
    
    // Round to nearest 15 minutes and clamp between 0 and 1440 (24 hours)
    const clampedMinutes = Math.max(0, Math.min(1440, minutes));
    return Math.round(clampedMinutes / 15) * 15;
  };

  // Calculate position and height for each time block
  const getBlockStyle = (block: TimeBlock & { taskName: string; taskId: string; completed: boolean }) => {
    const startMinutes = timeToMinutes(block.startTime);
    const endMinutes = timeToMinutes(block.endTime);
    const duration = endMinutes - startMinutes;
    
    // Each hour is 80px, so each minute is 80/60 = 1.33px
    const top = startMinutes * (80 / 60);
    const height = duration * (80 / 60);
    
    return {
      top: `${top}px`,
      height: `${Math.max(height, 20)}px`, // Minimum height of 20px
    };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start drag on the calendar area (not on time blocks or time labels)
    const target = e.target as HTMLElement;
    if (target.closest('[data-time-block]')) return;
    // Don't start drag if clicking on time label column
    const hourRow = target.closest('.flex.border-b');
    if (hourRow) {
      const timeLabel = hourRow.querySelector('.w-16');
      if (timeLabel && timeLabel.contains(target)) return;
    }
    if (e.button !== 0) return; // Only left mouse button
    
    e.preventDefault();
    e.stopPropagation();
    const minutes = getMinutesFromY(e.clientY);
    setIsDragging(true);
    setDragStart(minutes);
    setDragEnd(minutes);
  };

  // Use document-level events for better tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || dragStart === null) return;
      const minutes = getMinutesFromY(e.clientY);
      setDragEnd(Math.max(dragStart, minutes)); // Ensure end is after start
    };

    const handleMouseUp = () => {
      if (!isDragging || dragStart === null || dragEnd === null) return;
      
      const startMinutes = Math.min(dragStart, dragEnd);
      const endMinutes = Math.max(dragStart, dragEnd);
      
      // Minimum duration of 15 minutes
      if (endMinutes - startMinutes < 15) {
        setIsDragging(false);
        setDragStart(null);
        setDragEnd(null);
        return;
      }

      const startTime = minutesToTime(startMinutes);
      const endTime = minutesToTime(endMinutes);
      
      setPendingTimeBlock({ startTime, endTime });
      setShowTaskDialog(true);
      setIsDragging(false);
      setDragStart(null);
      setDragEnd(null);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, dragEnd]);

  const handleTaskSelect = (taskId: string) => {
    if (pendingTimeBlock) {
      onAddTimeBlock(taskId, pendingTimeBlock.startTime, pendingTimeBlock.endTime);
      setPendingTimeBlock(null);
      setShowTaskDialog(false);
    }
  };

  const todayTasks = tasks.filter((task) => !task.completed);

  // Calculate preview block style
  const previewStyle = isDragging && dragStart !== null && dragEnd !== null
    ? (() => {
        const startMinutes = Math.min(dragStart, dragEnd);
        const endMinutes = Math.max(dragStart, dragEnd);
        const top = startMinutes * (80 / 60);
        const height = (endMinutes - startMinutes) * (80 / 60);
        return {
          top: `${top}px`,
          height: `${Math.max(height, 20)}px`,
        };
      })()
    : null;

  return (
    <>
      <div className="flex h-[calc(100vh-200px)] flex-col rounded-lg bg-white shadow-sm dark:bg-zinc-900">
        <div className="border-b border-zinc-200 p-4 dark:border-zinc-700">
          <h2 className="text-xl font-semibold text-black dark:text-zinc-50">
            Today's Schedule
          </h2>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Drag on the calendar to create a time block
          </p>
        </div>

        <div
          ref={scrollContainerRef}
          className="relative flex-1 overflow-y-auto cursor-crosshair"
        >
          <div
            ref={calendarRef}
            className="relative"
            style={{ height: '1920px' }}
            onMouseDown={handleMouseDown}
          >
            {/* Time labels and blocks */}
            {hours.map((hour, index) => (
              <div
                key={hour}
                className="flex border-b border-zinc-200 dark:border-zinc-700"
                style={{ height: '80px', position: 'relative' }}
              >
                <div className="w-16 border-r border-zinc-200 px-2 py-1 text-xs text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
                  {hour}
                </div>
                <div className="flex-1 relative" style={{ minHeight: '80px' }} />
              </div>
            ))}
            
            {/* Preview block while dragging */}
            {previewStyle && (
              <div
                className="absolute left-16 right-0 rounded border-2 border-dashed border-blue-500 bg-blue-100/30 dark:bg-blue-900/30 z-20 pointer-events-none"
                style={previewStyle}
              />
            )}
            
            {/* Render all time blocks absolutely positioned */}
            {allTimeBlocks.map((block) => {
              const style = getBlockStyle(block);
              return (
                <div
                  key={block.id}
                  data-time-block
                  className="absolute left-16 right-0 rounded px-2 py-1 text-xs text-white shadow-sm z-10"
                  style={{
                    ...style,
                    backgroundColor: block.completed ? '#10b981' : '#3b82f6',
                  }}
                  title={`${block.taskName} (${block.startTime} - ${block.endTime})`}
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <div className="font-medium truncate">{block.taskName}</div>
                  <div className="text-xs opacity-90">
                    {block.startTime} - {block.endTime}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTimeBlock(block.taskId, block.id);
                    }}
                    className="absolute right-1 top-1 rounded px-1 text-xs hover:bg-white/20"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Task Selection Dialog */}
      {showTaskDialog && pendingTimeBlock && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-lg dark:bg-zinc-800">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-zinc-50">
              Select a task
            </h3>
            <p className="mb-4 text-sm text-zinc-600 dark:text-zinc-400">
              {pendingTimeBlock.startTime} - {pendingTimeBlock.endTime}
            </p>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {todayTasks.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-400">No tasks available</p>
              ) : (
                todayTasks.map((task) => (
                  <button
                    key={task.id}
                    onClick={() => handleTaskSelect(task.id)}
                    className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-left text-sm transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:hover:bg-zinc-700"
                  >
                    {task.name}
                  </button>
                ))
              )}
            </div>
            <button
              onClick={() => {
                setShowTaskDialog(false);
                setPendingTimeBlock(null);
              }}
              className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-300 dark:hover:bg-zinc-700"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
