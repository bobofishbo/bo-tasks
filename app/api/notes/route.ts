import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

const EMPTY_NOTE = { id: '00000000-0000-0000-0000-000000000001', content: '', updated_at: new Date().toISOString() };

export async function GET() {
  try {
    return NextResponse.json((await db.notes.get()) ?? EMPTY_NOTE);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { content } = await request.json();
    if (content === undefined) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }
    return NextResponse.json(await db.notes.upsert(content));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}
