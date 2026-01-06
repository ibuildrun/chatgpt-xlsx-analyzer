import Database from 'better-sqlite3';
import type { Thread, CreateThreadInput, Message, CreateMessageInput, UpdateMessageInput } from '@/types';

const DB_PATH = process.env.DATABASE_PATH || './data/app.db';

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface ThreadRow {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface MessageRow {
  id: string;
  thread_id: string;
  role: string;
  content: string;
  tool_calls: string | null;
  tool_results: string | null;
  created_at: string;
}

export class DatabaseService {
  private db: Database.Database;

  constructor() {
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.initTables();
  }

  private initTables(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS threads (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);

    this.db.exec(`
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
    const stmt = this.db.prepare('SELECT * FROM threads ORDER BY created_at DESC');
    const rows = stmt.all() as ThreadRow[];
    
    return rows.map(row => ({
      id: row.id,
      title: row.title,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    }));
  }

  getThread(id: string): Thread | null {
    const stmt = this.db.prepare('SELECT * FROM threads WHERE id = ?');
    const row = stmt.get(id) as ThreadRow | undefined;
    
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
    
    const stmt = this.db.prepare(
      'INSERT INTO threads (id, title, created_at, updated_at) VALUES (?, ?, ?, ?)'
    );
    stmt.run(id, input.title, now, now);
    
    return {
      id,
      title: input.title,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }

  updateThread(id: string, title: string): Thread | null {
    const now = new Date().toISOString();
    
    const stmt = this.db.prepare(
      'UPDATE threads SET title = ?, updated_at = ? WHERE id = ?'
    );
    const result = stmt.run(title, now, id);
    
    if (result.changes === 0) return null;
    
    return this.getThread(id);
  }

  deleteThread(id: string): boolean {
    // Delete messages first (cascade)
    const deleteMessages = this.db.prepare('DELETE FROM messages WHERE thread_id = ?');
    deleteMessages.run(id);
    
    const deleteThread = this.db.prepare('DELETE FROM threads WHERE id = ?');
    const result = deleteThread.run(id);
    
    return result.changes > 0;
  }

  // Message methods
  getMessages(threadId: string): Message[] {
    const stmt = this.db.prepare(
      'SELECT * FROM messages WHERE thread_id = ? ORDER BY created_at ASC'
    );
    const rows = stmt.all(threadId) as MessageRow[];
    
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
    
    const stmt = this.db.prepare(
      'INSERT INTO messages (id, thread_id, role, content, tool_calls, tool_results, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
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
    const checkStmt = this.db.prepare('SELECT id FROM messages WHERE id = ?');
    const existing = checkStmt.get(id);
    
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
      const updateStmt = this.db.prepare(
        `UPDATE messages SET ${updates.join(', ')} WHERE id = ?`
      );
      updateStmt.run(...values);
    }
    
    const selectStmt = this.db.prepare('SELECT * FROM messages WHERE id = ?');
    const row = selectStmt.get(id) as MessageRow | undefined;
    
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
