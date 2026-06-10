import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const taskId = new URL(request.url).searchParams.get('task_id') ?? undefined;
    return NextResponse.json(await db.timeBlocks.getAll(taskId));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch time blocks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { task_id, start_time, end_time } = await request.json();
    if (!task_id || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required fields: task_id, start_time, end_time' },
        { status: 400 }
      );
    }
    const timeRegex = /^\d{2}:\d{2}$/;
    if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
      return NextResponse.json({ error: 'Times must be in HH:MM format' }, { status: 400 });
    }
    if (end_time <= start_time) {
      return NextResponse.json({ error: 'end_time must be after start_time' }, { status: 400 });
    }
    const block = await db.timeBlocks.create({ task_id, start_time, end_time });
    return NextResponse.json(block, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create time block' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Time block ID is required' }, { status: 400 });
    await db.timeBlocks.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete time block' }, { status: 500 });
  }
}
