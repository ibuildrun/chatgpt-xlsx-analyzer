import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import fc from 'fast-check';
import { DatabaseService } from '@/lib/db';
import { unlinkSync, existsSync } from 'fs';

const TEST_DB_PATH = 'data/test-api.db';

describe('API Properties', () => {
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

  // Feature: chatgpt-clone-xlsx-analyzer, Property 3: Thread Ordering
  // For any list of threads, they SHALL be ordered by createdAt DESC
  test('Property 3: Thread Ordering', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string({ minLength: 1, maxLength: 50 }), { minLength: 2, maxLength: 20 }),
        (titles) => {
          // Create threads
          titles.forEach(title => {
            db.createThread({ title });
          });
          
          const threads = db.getThreads();
          
          // Verify descending order by createdAt
          for (let i = 1; i < threads.length; i++) {
            const prev = threads[i - 1].createdAt.getTime();
            const curr = threads[i].createdAt.getTime();
            if (prev < curr) {
              return false;
            }
          }
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Feature: chatgpt-clone-xlsx-analyzer, Property 6: Thread Switch Loads Correct Messages
  // For any thread, loading messages SHALL return exactly those messages
  test('Property 6: Thread Switch Loads Correct Messages', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            messageContents: fc.array(fc.string({ minLength: 1, maxLength: 200 }), { minLength: 0, maxLength: 10 }),
          }),
          { minLength: 2, maxLength: 5 }
        ),
        (threadSpecs) => {
          // Create threads with their messages
          const createdData = threadSpecs.map(spec => {
            const thread = db.createThread({ title: spec.title });
            const messageIds = spec.messageContents.map(content => {
              const msg = db.createMessage({
                threadId: thread.id,
                role: 'user',
                content,
              });
              return msg.id;
            });
            return { threadId: thread.id, messageIds };
          });
          
          // Verify each thread returns only its messages
          for (const { threadId, messageIds } of createdData) {
            const messages = db.getMessages(threadId);
            
            // Count should match
            if (messages.length !== messageIds.length) {
              return false;
            }
            
            // All messages should belong to this thread
            if (!messages.every(m => m.threadId === threadId)) {
              return false;
            }
            
            // All expected message IDs should be present
            const retrievedIds = new Set(messages.map(m => m.id));
            if (!messageIds.every(id => retrievedIds.has(id))) {
              return false;
            }
          }
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property 7: Full State Restoration
  test('Property 7: Full State Restoration', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            title: fc.string({ minLength: 1, maxLength: 50 }),
            messages: fc.array(fc.string({ minLength: 1, maxLength: 100 }), { minLength: 1, maxLength: 5 }),
          }),
          { minLength: 1, maxLength: 5 }
        ),
        (threadSpecs) => {
          // Create initial state
          const originalState = threadSpecs.map(spec => {
            const thread = db.createThread({ title: spec.title });
            const messages = spec.messages.map(content =>
              db.createMessage({ threadId: thread.id, role: 'user', content })
            );
            return { thread, messages };
          });
          
          // Close and reopen database (simulating reload)
          db.close();
          db = new DatabaseService(TEST_DB_PATH);
          
          // Verify state is restored
          const restoredThreads = db.getThreads();
          
          if (restoredThreads.length !== originalState.length) {
            return false;
          }
          
          for (const { thread, messages } of originalState) {
            const restoredThread = restoredThreads.find(t => t.id === thread.id);
            if (!restoredThread || restoredThread.title !== thread.title) {
              return false;
            }
            
            const restoredMessages = db.getMessages(thread.id);
            if (restoredMessages.length !== messages.length) {
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
