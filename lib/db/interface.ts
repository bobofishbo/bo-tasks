export interface DbTask {
  id: string;
  name: string;
  hours: number;
  completed: boolean;
  date: string;
  created_at: string;
}

export interface DbTimeBlock {
  id: string;
  task_id: string;
  start_time: string;
  end_time: string;
  created_at: string;
}

export interface DbNote {
  id: string;
  content: string;
  updated_at: string;
}

export const STATUSES = ['idea', 'draft', 'scheduled', 'published'] as const;
export type Status = typeof STATUSES[number];

export interface DbContentItem {
  id: string;
  title: string;
  status: Status;
  scheduled_date: string;         // YYYY-MM-DD
  scheduled_time: string | null;  // HH:MM, null = unscheduled (floats at top)
  duration_minutes: number;       // default 60
  platform: string | null;        // kept for future posting, not required
  reference_videos: string;       // newline-separated URLs
  script: string;
  created_at: string;
}

export interface DbBannerEvent {
  id: string;
  title: string;
  color: string;
  start_date: string;
  end_date: string;
  created_at: string;
}

export interface Database {
  tasks: {
    getAll(date?: string): Promise<DbTask[]>;
    getById(id: string): Promise<DbTask | null>;
    create(data: { name: string; hours: number; completed: boolean; date: string }): Promise<DbTask>;
    update(id: string, data: Partial<{ name: string; hours: number; completed: boolean; date: string }>): Promise<DbTask | null>;
    delete(id: string): Promise<void>;
  };
  timeBlocks: {
    getAll(taskId?: string): Promise<DbTimeBlock[]>;
    create(data: { task_id: string; start_time: string; end_time: string }): Promise<DbTimeBlock>;
    delete(id: string): Promise<void>;
  };
  notes: {
    get(): Promise<DbNote | null>;
    upsert(content: string): Promise<DbNote>;
  };
  content: {
    getAll(from?: string, to?: string): Promise<DbContentItem[]>;
    getById(id: string): Promise<DbContentItem | null>;
    create(data: Omit<DbContentItem, 'id' | 'created_at'>): Promise<DbContentItem>;
    update(id: string, data: Partial<Omit<DbContentItem, 'id' | 'created_at'>>): Promise<DbContentItem | null>;
    delete(id: string): Promise<void>;
  };
  bannerEvents: {
    getAll(from?: string, to?: string): Promise<DbBannerEvent[]>;
    create(data: Omit<DbBannerEvent, 'id' | 'created_at'>): Promise<DbBannerEvent>;
    update(id: string, data: Partial<Omit<DbBannerEvent, 'id' | 'created_at'>>): Promise<DbBannerEvent | null>;
    delete(id: string): Promise<void>;
  };
}
