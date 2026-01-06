import { Database } from 'bun:sqlite';
import type { Thread, CreateThreadInput, Message, CreateMessageInput, UpdateMessageInput } from '@/types';

const DB_PATH = process.env.DATABASE_PATH || './data/app.db';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class DatabaseService {
  private db: Database;

  constructor() {
    this.db = new Database(DB_PATH, { create: true });
    this.initTables();
  }

  private initTables(): void {
    this.db.run(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    this.db.run(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        tool_calls TEXT,
        tool_results TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (thread_id) REFERENCES threads(id) ON DELETE CASCADE
      )
    `);
  }

  // Thread methods
  getThreads(): Thread[] {
    const rows = this.db.query<{ id: string; title: string; created_at: string; updated_at: string }, []>(
      'SELECT * FROM threads ORDER BY created_at DESC'
    ).all();
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  getThread(id: string): Thread | null {
    const row = this.db.query<{ id: string; title: string; created_at: string; updated_at: string }, [string]>(
      'SELECT * FROM threads WHERE id = ?'
    ).get(id);
    
    if (!row) return null;
    
    return {
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  createThread(input: CreateThreadInput): Thread {
    const id = generateId();
    const now = new Date().toISOString();
    
    this.db.run(
      'INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)',
      [id, input.title, now, now]
    );
    
    return {
      id,
      title: input.title,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  updateThread(id: string, title: string): Thread | null {
    const now = new Date().toISOString();
    
    const result = this.db.run(
      'UPDATE threads SET title = ?, updated_at = ? WHERE id = ?',
      [title, now, id]
    );
    
    if (result.changes === 0) return null;
    
    return this.getThread(id);
  }

  deleteThread(id: string): boolean {
    // Delete messages first (cascade)
    this.db.run('DELETE FROM messages WHERE thread_id = ?', [id]);
    const result = this.db.run('DELETE FROM threads WHERE id = ?', [id]);
    return result.changes > 0;
  }

  // Message methods
  getMessages(threadId: string): Message[] {
    const rows = this.db.query<{
      id: string;
      thread_id: string;
      role: string;
      content: string;
      tool_calls: string | null;
      tool_results: string | null;
      created_at: string;
    }, [string]>(
      'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC'
    ).all(threadId);
    
    return rows.map(row => ({
      id: row.id,
      threadId: row.thread_id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  createMessage(input: CreateMessageInput): Message {
    const id = generateId();
    const now = new Date().toISOString();
    
    this.db.run(
      'INSERT INTO messages (id, thread_id, role, content, tool_calls, tool_results, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        input.threadId,
        input.role,
        input.content,
        input.toolCalls ? JSON.stringify(input.toolCalls) : null,
        input.toolResults ? JSON.stringify(input.toolResults) : null,
        now,
      ]
    );
    
    return {
      id,
      threadId: input.threadId,
      role: input.role,
      content: input.content,
      toolCalls: input.toolCalls,
      toolResults: input.toolResults,
      createdAt: new Date(now),
    };
  }

  updateMessage(id: string, input: UpdateMessageInput): Message | null {
    const existing = this.db.query<{ id: string }, [string]>(
      'SELECT id FROM messages WHERE id = ?'
    ).get(id);
    
    if (!existing) return null;
    
    const updates: string[] = [];
    const values: (string | null)[] = [];
    
    if (input.content !== undefined) {
      updates.push('content = ?');
      values.push(input.content);
    }
    if (input.toolCalls !== undefined) {
      updates.push('tool_calls = ?');
      values.push(input.toolCalls ? JSON.stringify(input.toolCalls) : null);
    }
    if (input.toolResults !== undefined) {
      updates.push('tool_results = ?');
      values.push(input.toolResults ? JSON.stringify(input.toolResults) : null);
    }
    
    if (updates.length > 0) {
      values.push(id);
      this.db.run(`UPDATE messages SET ${updates.join(', ')} WHERE id = ?`, values);
    }
    
    const row = this.db.query<{
      id: string;
      thread_id: string;
      role: string;
      content: string;
      tool_calls: string | null;
      tool_results: string | null;
      created_at: string;
    }, [string]>('SELECT * FROM messages WHERE id = ?').get(id);
    
    if (!row) return null;
    
    return {
      id: row.id,
      threadId: row.thread_id,
      role: row.role as 'user' | 'assistant',
      content: row.content,
      toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  transaction<T>(fn: () => T): T {
    return this.db.transaction(fn)();
  }

  close(): void {
    this.db.close();
  }
}

// Singleton instance
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}
