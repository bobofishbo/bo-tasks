export interface PinnedTask {
  id: string;
  title: string;
  hours: number | null;
  recurrence: 'daily' | 'weekly';
  day_of_week: number | null; // 0=Sun…6=Sat
  completed_date: string | null; // YYYY-MM-DD
  created_at: string;
}

export type CalEventStatus = 'accepted' | 'tentative' | 'declined' | 'class' | 'personal' | 'task';

export interface CalEvent {
  id: string;
  title: string;
  sub?: string;
  start: [number, number]; // [hour, minute] — hour may be 0-1 for post-midnight
  end: [number, number];
  status: CalEventStatus;
}

export interface Task {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
  date: string;
  timeBlocks?: TimeBlock[];
}

export interface TimeBlock {
  id: string;
  taskId: string;
  startTime: string; // Format: "HH:MM" (24-hour)
  endTime: string; // Format: "HH:MM" (24-hour)
}

