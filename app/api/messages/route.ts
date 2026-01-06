import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';
import type { MessageRole } from '@/types';

// GET /api/messages?threadId=xxx - Get messages by thread
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const threadId = searchParams.get('threadId');

    if (!threadId) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'threadId is required' } },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verify thread exists
    const thread = db.getThread(threadId);
    if (!thread) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }

    const messages = db.getMessages(threadId);
    return NextResponse.json({ data: messages });
  } catch (error) {
    console.error('[API] Error fetching messages:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Failed to fetch messages' } },
      { status: 500 }
    );
  }
}

// POST /api/messages - Create new message
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
    
    const { threadId, role, content, toolCalls, toolResults } = body;

    // Validation
    if (!threadId || typeof threadId !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'threadId is required' } },
        { status: 400 }
      );
    }

    if (!role || !['user', 'assistant', 'tool'].includes(role)) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Valid role is required (user, assistant, tool)' } },
        { status: 400 }
      );
    }

    if (content === undefined || typeof content !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'content is required' } },
        { status: 400 }
      );
    }

    const db = getDatabase();
    
    // Verify thread exists
    const thread = db.getThread(threadId);
    if (!thread) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }

    const message = db.createMessage({
      threadId,
      role: role as MessageRole,
      content,
      toolCalls,
      toolResults,
    });

    return NextResponse.json({ data: message }, { status: 201 });
  } catch (error) {
    console.error('[API] Error creating message:', error);
    return NextResponse.json(
      { error: { code: 'CREATE_ERROR', message: 'Failed to create message' } },
      { status: 500 }
    );
  }
}
