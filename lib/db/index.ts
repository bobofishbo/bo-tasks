import { memoryDb } from './memory';
import { supabaseDb } from './supabase';
import type { Database } from './interface';

// Automatically use in-memory store when Supabase credentials are absent
const useMemory =
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const db: Database = useMemory ? memoryDb : supabaseDb;

export type { Database, DbTask, DbTimeBlock, DbNote } from './interface';
