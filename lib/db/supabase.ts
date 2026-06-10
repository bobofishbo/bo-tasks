import { supabase } from '../supabase';
import type { Database } from './interface';

const NOTES_ID = '00000000-0000-0000-0000-000000000001';

export const supabaseDb: Database = {
  tasks: {
    async getAll(date) {
      let query = supabase.from('tasks').select('*').order('created_at', { ascending: false });
      if (date) query = query.eq('date', date);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    async getById(id) {
      const { data, error } = await supabase.from('tasks').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    },
    async create(data) {
      const { data: task, error } = await supabase.from('tasks').insert(data).select().single();
      if (error) throw new Error(error.message);
      return task;
    },
    async update(id, data) {
      const { data: task, error } = await supabase.from('tasks').update(data).eq('id', id).select().single();
      if (error) return null;
      return task;
    },
    async delete(id) {
      const { error } = await supabase.from('tasks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },
  timeBlocks: {
    async getAll(taskId) {
      let query = supabase.from('time_blocks').select('*').order('start_time', { ascending: true });
      if (taskId) query = query.eq('task_id', taskId);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    async create(data) {
      const { data: block, error } = await supabase.from('time_blocks').insert(data).select().single();
      if (error) throw new Error(error.message);
      return block;
    },
    async delete(id) {
      const { error } = await supabase.from('time_blocks').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },
  notes: {
    async get() {
      const { data, error } = await supabase.from('notes').select('*').eq('id', NOTES_ID).single();
      if (error) {
        if (error.code === 'PGRST116') return null;
        throw new Error(error.message);
      }
      return data;
    },
    async upsert(content) {
      const { data, error } = await supabase
        .from('notes')
        .upsert({ id: NOTES_ID, content }, { onConflict: 'id' })
        .select()
        .single();
      if (error) throw new Error(error.message);
      return data;
    },
  },
  content: {
    async getAll(from, to) {
      let query = supabase.from('content_items').select('*').order('scheduled_date');
      if (from) query = query.gte('scheduled_date', from);
      if (to) query = query.lte('scheduled_date', to);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    async getById(id) {
      const { data, error } = await supabase.from('content_items').select('*').eq('id', id).single();
      if (error) return null;
      return data;
    },
    async create(data) {
      const { data: item, error } = await supabase.from('content_items').insert(data).select().single();
      if (error) throw new Error(error.message);
      return item;
    },
    async update(id, data) {
      const { data: item, error } = await supabase.from('content_items').update(data).eq('id', id).select().single();
      if (error) return null;
      return item;
    },
    async delete(id) {
      const { error } = await supabase.from('content_items').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },
  bannerEvents: {
    async getAll(from, to) {
      let query = supabase.from('banner_events').select('*').order('start_date');
      // Overlap: event.end >= from AND event.start <= to
      if (from) query = query.gte('end_date', from);
      if (to) query = query.lte('start_date', to);
      const { data, error } = await query;
      if (error) throw new Error(error.message);
      return data ?? [];
    },
    async create(data) {
      const { data: item, error } = await supabase.from('banner_events').insert(data).select().single();
      if (error) throw new Error(error.message);
      return item;
    },
    async update(id, data) {
      const { data: item, error } = await supabase.from('banner_events').update(data).eq('id', id).select().single();
      if (error) return null;
      return item;
    },
    async delete(id) {
      const { error } = await supabase.from('banner_events').delete().eq('id', id);
      if (error) throw new Error(error.message);
    },
  },
};
