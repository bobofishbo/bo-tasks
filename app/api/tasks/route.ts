import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const date = new URL(request.url).searchParams.get('date') ?? undefined;
    return NextResponse.json(await db.tasks.getAll(date));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, hours, date } = await request.json();
    const parsedHours = Number(hours);
    if (!name || !Number.isFinite(parsedHours) || parsedHours <= 0 || !date) {
      return NextResponse.json(
        { error: 'name and date are required; hours must be a positive number' },
        { status: 400 }
      );
    }
    const task = await db.tasks.create({ name, hours: parsedHours, completed: false, date });
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, name, hours, completed, date } = await request.json();
    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });

    const patch: Record<string, unknown> = {};
    if (name !== undefined) patch.name = name;
    if (hours !== undefined) patch.hours = Number(hours);
    if (completed !== undefined) patch.completed = completed;
    if (date !== undefined) patch.date = date;

    const task = await db.tasks.update(id, patch);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(task);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Task ID is required' }, { status: 400 });
    await db.tasks.delete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
