import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import fc from 'fast-check';
import { DatabaseService } from '@/lib/db';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB_PATH = 'data/test.db';

describe('Database Properties', () => {
  let db: DatabaseService;

  beforeEach(() => {
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
    db = new DatabaseService(TEST_DB_PATH);
  });

  afterEach(() => {
    db.close();
    if (existsSync(TEST_DB_PATH)) {
      unlinkSync(TEST_DB_PATH);
    }
  });

  // Feature: chatgpt-clone-xlsx-analyzer, Property 1: Thread ID Uniqueness
  // For any sequence of thread creations, all generated thread IDs SHALL be unique
  test('Property 1: Thread ID Uniqueness', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 50 }),
        (titles) => {
          const threads = titles.map(title => db.createThread({ title }));
          const ids = threads.map(t => t.id);
          const uniqueIds = new Set(ids);
          return uniqueIds.size === ids.length;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chatgpt-clone-xlsx-analyzer, Property 2: Thread Persistence Round-Trip
  // For any valid thread object, creating and retrieving SHALL return equivalent thread
  test('Property 2: Thread Persistence Round-Trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 200 }),
        (title) => {
          const created = db.createThread({ title });
          const retrieved = db.getThread(created.id);
          
          return (
            retrieved !== null &&
            retrieved.id === created.id &&
            retrieved.title === created.title &&
            retrieved.createdAt.getTime() === created.createdAt.getTime()
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chatgpt-clone-xlsx-analyzer, Property 5: Message Persistence Round-Trip
  // For any valid message, creating and retrieving SHALL return equivalent message
  test('Property 5: Message Persistence Round-Trip', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 1, maxLength: 100 }),
        fc.constantFrom('user', 'assistant', 'tool'),
        fc.string({ minLength: 1, maxLength: 1000 }),
        (threadTitle, role, content) => {
          const thread = db.createThread({ title: threadTitle });
          const created = db.createMessage({
            threadId: thread.id,
            role: role as 'user' | 'assistant' | 'tool',
            content,
          });
          
          const messages = db.getMessages(thread.id);
          const retrieved = messages.find(m => m.id === created.id);
          
          return (
            retrieved !== undefined &&
            retrieved.id === created.id &&
            retrieved.threadId === created.threadId &&
            retrieved.role === created.role &&
            retrieved.content === created.content
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 3: Thread Ordering - threads are ordered by createdAt DESC
  test('Property 3: Thread Ordering', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 20 }),
        (titles) => {
          // Create threads with small delays to ensure different timestamps
          titles.forEach(title => {
            db.createThread({ title });
          });
          
          const threads = db.getThreads();
          
          // Check that threads are ordered by createdAt DESC
          for (let i = 1; i < threads.length; i++) {
            if (threads[i - 1].createdAt.getTime() < threads[i].createdAt.getTime()) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 6: Thread Switch Loads Correct Messages
  test('Property 6: Thread Switch Loads Correct Messages', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            threadTitle: fc.string({ minLength: 1, maxLength: 50 }),
            messages: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (threadData) => {
          // Create threads with messages
          const createdThreads = threadData.map(td => {
            const thread = db.createThread({ title: td.threadTitle });
            td.messages.forEach(content => {
              db.createMessage({ threadId: thread.id, role: 'user', content });
            });
            return { thread, messageCount: td.messages.length };
          });
          
          // Verify each thread has exactly its messages
          for (const { thread, messageCount } of createdThreads) {
            const messages = db.getMessages(thread.id);
            if (messages.length !== messageCount) {
              return false;
            }
            // All messages should belong to this thread
            if (!messages.every(m => m.threadId === thread.id)) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });
});
