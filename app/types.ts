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

