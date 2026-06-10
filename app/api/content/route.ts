import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { STATUSES } from '@/lib/db/interface';

export async function GET(request: NextRequest) {
  try {
    const params = new URL(request.url).searchParams;
    const from = params.get('from') ?? undefined;
    const to   = params.get('to')   ?? undefined;
    return NextResponse.json(await db.content.getAll(from, to));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch content items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, status, scheduled_date } = body;

    if (!title || !status || !scheduled_date) {
      return NextResponse.json(
        { error: 'title, status, and scheduled_date are required' },
        { status: 400 },
      );
    }
    if (!STATUSES.includes(status)) {
      return NextResponse.json(
        { error: `status must be one of: ${STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const item = await db.content.create({
      title:            body.title,
      status:           body.status,
      scheduled_date:   body.scheduled_date,
      scheduled_time:   body.scheduled_time   ?? null,
      duration_minutes: body.duration_minutes ?? 60,
      platform:         body.platform         ?? null,
      reference_videos: body.reference_videos ?? '',
      script:           body.script           ?? '',
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to create content item' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    if (data.status && !STATUSES.includes(data.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const item = await db.content.update(id, data);
    if (!item) return NextResponse.json({ error: 'Content item not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update content item' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await db.content.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete content item' }, { status: 500 });
  }
}
