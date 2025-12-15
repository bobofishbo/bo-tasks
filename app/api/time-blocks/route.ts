import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch time blocks (optionally filtered by task_id)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('task_id');

    let query = supabase.from('time_blocks').select('*').order('start_time', { ascending: true });

    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 });
  }
}

// POST - Create a new time block
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { task_id, start_time, end_time } = body;

    if (!task_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: task_id, start_time, end_time' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('time_blocks')
      .insert({
        task_id,
        start_time,
        end_time,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 });
  }
}

// DELETE - Delete a time block
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Time block ID is required' }, { status: 400 });
    }

    const { error } = await supabase.from('time_blocks').delete().eq('id', id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 });
  }
}

