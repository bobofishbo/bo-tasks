import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const NOTES_ID = '00000000-0000-0000-0000-000000000001';

// GET - Fetch notes
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', NOTES_ID)
      .single();

    if (error) {
      // If notes don't exist, return empty content
      if (error.code === 'PGRST116') {
        return NextResponse.json({ id: NOTES_ID, content: '', updated_at: new Date().toISOString() });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || { id: NOTES_ID, content: '', updated_at: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

// PUT - Update notes
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { content } = body;

    if (content === undefined) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 });
    }

    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('notes')
      .update({ content })
      .eq('id', NOTES_ID)
      .select()
      .single();

    // If update fails because row doesn't exist, insert it
    if (updateError && updateError.code === 'PGRST116') {
      const { data: insertData, error: insertError } = await supabase
        .from('notes')
        .insert({ id: NOTES_ID, content })
        .select()
        .single();

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }

      return NextResponse.json(insertData);
    }

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json(updateData);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update notes' }, { status: 500 });
  }
}

