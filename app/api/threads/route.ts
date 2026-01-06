import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

export async function GET() {
  try {
    const db = getDatabase();
    const threads = db.getThreads();
    return NextResponse.json({ threads });
  } catch (error) {
    console.error('[API] Error fetching threads:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Failed to fetch threads' } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title is required' } },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const thread = db.createThread({ title: title.trim() });
    
    return NextResponse.json({ thread }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating thread:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Failed to create thread' } },
      { status: 500 }
    );
  }
}
