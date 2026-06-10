import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { INSPIRATION_PLATFORMS, INSPIRATION_STATUSES } from '@/lib/db/interface';

// In production, set INSPIRATION_API_KEY in env vars.
// In dev (key not set), auth is skipped so the iOS simulator can call freely.
function isAuthorized(request: NextRequest): boolean {
  const apiKey = process.env.INSPIRATION_API_KEY;
  if (!apiKey) return true;
  const auth = request.headers.get('Authorization');
  return auth === `Bearer ${apiKey}`;
}

export async function GET(request: NextRequest) {
  try {
    const status = new URL(request.url).searchParams.get('status') ?? undefined;
    if (status && !INSPIRATION_STATUSES.includes(status as never)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    return NextResponse.json(await db.inspirations.getAll(status as never));
  } catch {
    return NextResponse.json({ error: 'Failed to fetch inspirations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const body = await request.json();
    const { url, platform, title } = body;

    if (!url || !platform) {
      return NextResponse.json({ error: 'url and platform are required' }, { status: 400 });
    }
    if (!INSPIRATION_PLATFORMS.includes(platform)) {
      return NextResponse.json(
        { error: `platform must be one of: ${INSPIRATION_PLATFORMS.join(', ')}` },
        { status: 400 },
      );
    }

    const item = await db.inspirations.create({
      url,
      platform,
      title:  title  ?? '',
      notes:  body.notes ?? '',
      status: 'new',
    });
    return NextResponse.json(item, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Failed to save inspiration' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...data } = await request.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    if (data.status && !INSPIRATION_STATUSES.includes(data.status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    const item = await db.inspirations.update(id, data);
    if (!item) return NextResponse.json({ error: 'Inspiration not found' }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json({ error: 'Failed to update inspiration' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const id = new URL(request.url).searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });
    await db.inspirations.delete(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete inspiration' }, { status: 500 });
  }
}
