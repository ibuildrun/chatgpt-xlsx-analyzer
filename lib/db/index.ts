import { Database } from 'bun:sqlite';
import { SCHEMA } from './schema';
import type { Thread, CreateThreadInput, Message, CreateMessageInput, UpdateMessageInput } from '@/types';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export class DatabaseService {
  private db: Database;

  constructor(dbPath: string = 'data/chat.db') {
    this.db = new Database(dbPath, { create: true });
    this.db.exec('PRAGMA foreign_keys = ON;');
    this.init();
  }

  private init(): void {
    this.db.exec(SCHEMA);
  }

  // Thread methods
  getThreads(): Thread[] {
    const stmt = this.db.prepare(`
      SELECT id, title, created_at, updated_at 
      FROM threads 
      ORDER BY created_at DESC
    `);
    const rows = stmt.all() as Array<{
      id: string;
      title: string;
      created_at: number;
      updated_at: number;
    }>;
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  getThread(id: string): Thread | null {
    const stmt = this.db.prepare(`
      SELECT id, title, created_at, updated_at 
      FROM threads 
      WHERE id = ?
    `);
    const row = stmt.get(id) as {
      id: string;
      title: string;
      created_at: number;
      updated_at: number;
    } | null;
    
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
    const now = Date.now();
    
    const stmt = this.db.prepare(`
      INSERT INTO threads (id, title, created_at, updated_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(id, input.title, now, now);
    
    return {
      id,
      title: input.title,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  updateThread(id: string, title: string): Thread | null {
    const now = Date.now();
    
    const stmt = this.db.prepare(`
      UPDATE threads SET title = ?, updated_at = ? WHERE id = ?
    `);
    const result = stmt.run(title, now, id);
    
    if (result.changes === 0) return null;
    
    return this.getThread(id);
  }

  deleteThread(id: string): boolean {
    const stmt = this.db.prepare('DELETE FROM threads WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Message methods
  getMessages(threadId: string): Message[] {
    const stmt = this.db.prepare(`
      SELECT id, thread_id, role, content, tool_calls, tool_results, created_at
      FROM messages
      WHERE thread_id = ?
      ORDER BY created_at ASC
    `);
    const rows = stmt.all(threadId) as Array<{
      id: string;
      thread_id: string;
      role: string;
      content: string;
      tool_calls: string | null;
      tool_results: string | null;
      created_at: number;
    }>;
    
    return rows.map(row => ({
      id: row.id,
      threadId: row.thread_id,
      role: row.role as Message['role'],
      content: row.content,
      toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      createdAt: new Date(row.created_at),
    }));
  }

  createMessage(input: CreateMessageInput): Message {
    const id = generateId();
    const now = Date.now();
    
    const stmt = this.db.prepare(`
      INSERT INTO messages (id, thread_id, role, content, tool_calls, tool_results, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      input.threadId,
      input.role,
      input.content,
      input.toolCalls ? JSON.stringify(input.toolCalls) : null,
      input.toolResults ? JSON.stringify(input.toolResults) : null,
      now
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
    const existing = this.db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
    if (!existing) return null;
    
    const updates: string[] = [];
    const values: unknown[] = [];
    
    if (input.content !== undefined) {
      updates.push('content = ?');
      values.push(input.content);
    }
    if (input.toolCalls !== undefined) {
      updates.push('tool_calls = ?');
      values.push(JSON.stringify(input.toolCalls));
    }
    if (input.toolResults !== undefined) {
      updates.push('tool_results = ?');
      values.push(JSON.stringify(input.toolResults));
    }
    
    if (updates.length === 0) return null;
    
    values.push(id);
    const stmt = this.db.prepare(`UPDATE messages SET ${updates.join(', ')} WHERE id = ?`);
    stmt.run(...values);
    
    const row = this.db.prepare(`
      SELECT id, thread_id, role, content, tool_calls, tool_results, created_at
      FROM messages WHERE id = ?
    `).get(id) as {
      id: string;
      thread_id: string;
      role: string;
      content: string;
      tool_calls: string | null;
      tool_results: string | null;
      created_at: number;
    };
    
    return {
      id: row.id,
      threadId: row.thread_id,
      role: row.role as Message['role'],
      content: row.content,
      toolCalls: row.tool_calls ? JSON.parse(row.tool_calls) : undefined,
      toolResults: row.tool_results ? JSON.parse(row.tool_results) : undefined,
      createdAt: new Date(row.created_at),
    };
  }

  // Transaction support
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
