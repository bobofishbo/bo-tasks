import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const from = params.get('from') ?? undefined;
    const to = params.get('to') ?? undefined;
    return NextResponse.json(await db.bannerEvents.getAll(from, to));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch banner events' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, color, start_date, end_date } = await request.json();
    if (!title || !color || !start_date || !end_date) {
      return NextResponse.json({ error: 'title, color, start_date, and end_date are required' }, { status: 400 });
    }
    if (end_date < start_date) {
      return NextResponse.json({ error: 'end_date must be on or after start_date' }, { status: 400 });
    }
    const item = await db.bannerEvents.create({ title, color, start_date, end_date });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create banner event' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    if (data.end_date && data.start_date && data.end_date < data.start_date) {
      return NextResponse.json({ error: 'end_date must be on or after start_date' }, { status: 400 });
    }
    const item = await db.bannerEvents.update(id, data);
    if (!item) return NextResponse.json({ error: 'Banner event not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update banner event' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await db.bannerEvents.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete banner event' }, { status: 500 });
  }
}
