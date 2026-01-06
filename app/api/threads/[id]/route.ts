import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/threads/[id] - Get thread by ID
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const thread = db.getThread(id);

    if (!thread) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: thread });
  } catch (error) {
    console.error('[API] Error fetching thread:', error);
    return NextResponse.json(
      { error: { code: 'FETCH_ERROR', message: 'Failed to fetch thread' } },
      { status: 500 }
    );
  }
}

// PATCH /api/threads/[id] - Update thread
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title } = body;

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Title is required' } },
        { status: 400 }
      );
    }

    const db = getDatabase();
    const thread = db.updateThread(id, title.trim());

    if (!thread) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: thread });
  } catch (error) {
    console.error('[API] Error updating thread:', error);
    return NextResponse.json(
      { error: { code: 'UPDATE_ERROR', message: 'Failed to update thread' } },
      { status: 500 }
    );
  }
}

// DELETE /api/threads/[id] - Delete thread
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const deleted = db.deleteThread(id);

    if (!deleted) {
      return NextResponse.json(
        { error: { code: 'NOT_FOUND', message: 'Thread not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: { success: true } });
  } catch (error) {
    console.error('[API] Error deleting thread:', error);
    return NextResponse.json(
      { error: { code: 'DELETE_ERROR', message: 'Failed to delete thread' } },
      { status: 500 }
    );
  }
}
