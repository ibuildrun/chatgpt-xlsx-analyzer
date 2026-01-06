import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

// GET /api/threads - List all threads
export async function GET() {
  try {
    const db = getDatabase();
    const threads = db.getThreads();
    return NextResponse.json({ data: threads });
  } catch (error) {
    console.error('[API] Error fetching threads:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Failed to fetch threads' } },
      { status: 500 }
    );
  }
}

// POST /api/threads - Create new thread
export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[API] JSON parse error:', parseError);
      return NextResponse.json(
        { error: { code: 'PARSE_ERROR', message: 'Invalid JSON body' } },
        { status: 400 }
      );
    }
    
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title is required' } },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const thread = db.createThread({ title: title.trim() });
    
    return NextResponse.json({ data: thread }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating thread:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Failed to create thread' } },
      { status: 500 }
    );
  }
}
