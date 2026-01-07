'use client';

import type { Thread, Message, CreateThreadInput, CreateMessageInput, UpdateMessageInput } from '@/types';

const DB_NAME = 'xlsx-analyzer-db';
const DB_VERSION = 1;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.db) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create threads store
        if (!db.objectStoreNames.contains('threads')) {
          const threadsStore = db.createObjectStore('threads', { keyPath: 'id' });
          threadsStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
        
        // Create messages store
        if (!db.objectStoreNames.contains('messages')) {
          const messagesStore = db.createObjectStore('messages', { keyPath: 'id' });
          messagesStore.createIndex('threadId', 'threadId', { unique: false });
          messagesStore.createIndex('createdAt', 'createdAt', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  private async getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): Promise<IDBObjectStore> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    const transaction = this.db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  // Thread methods
  async getThreads(): Promise<Thread[]> {
    const store = await this.getStore('threads');
    return new Promise((resolve, reject) => {
      const request = store.index('createdAt').openCursor(null, 'prev');
      const threads: Thread[] = [];
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          threads.push(cursor.value);
          cursor.continue();
        } else {
          resolve(threads);
        }
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getThread(id: string): Promise<Thread | null> {
    const store = await this.getStore('threads');
    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async createThread(input: CreateThreadInput): Promise<Thread> {
    const store = await this.getStore('threads', 'readwrite');
    const now = new Date();
    const thread: Thread = {
      id: generateId(),
      title: input.title,
      createdAt: now,
      updatedAt: now,
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(thread);
      request.onsuccess = () => resolve(thread);
      request.onerror = () => reject(request.error);
    });
  }


  async updateThread(id: string, title: string): Promise<Thread | null> {
    const store = await this.getStore('threads', 'readwrite');
    const thread = await this.getThread(id);
    if (!thread) return null;
    
    const updated: Thread = {
      ...thread,
      title,
      updatedAt: new Date(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.put(updated);
      request.onsuccess = () => resolve(updated);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteThread(id: string): Promise<boolean> {
    // Delete messages first
    await this.deleteMessagesByThread(id);
    
    const store = await this.getStore('threads', 'readwrite');
    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve(true);
      request.onerror = () => reject(request.error);
    });
  }

  // Message methods
  async getMessages(threadId: string): Promise<Message[]> {
    const store = await this.getStore('messages');
    return new Promise((resolve, reject) => {
      const index = store.index('threadId');
      const request = index.getAll(threadId);
      
      request.onsuccess = () => {
        const messages = request.result || [];
        // Sort by createdAt ascending
        messages.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        resolve(messages);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async createMessage(input: CreateMessageInput): Promise<Message> {
    const store = await this.getStore('messages', 'readwrite');
    const message: Message = {
      id: generateId(),
      threadId: input.threadId,
      role: input.role,
      content: input.content,
      toolCalls: input.toolCalls,
      toolResults: input.toolResults,
      createdAt: new Date(),
    };
    
    return new Promise((resolve, reject) => {
      const request = store.add(message);
      request.onsuccess = () => resolve(message);
      request.onerror = () => reject(request.error);
    });
  }

  async updateMessage(id: string, input: UpdateMessageInput): Promise<Message | null> {
    const store = await this.getStore('messages', 'readwrite');
    
    return new Promise((resolve, reject) => {
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const message = getRequest.result;
        if (!message) {
          resolve(null);
          return;
        }
        
        const updated: Message = {
          ...message,
          ...(input.content !== undefined && { content: input.content }),
          ...(input.toolCalls !== undefined && { toolCalls: input.toolCalls }),
          ...(input.toolResults !== undefined && { toolResults: input.toolResults }),
        };
        
        const putRequest = store.put(updated);
        putRequest.onsuccess = () => resolve(updated);
        putRequest.onerror = () => reject(putRequest.error);
      };
      getRequest.onerror = () => reject(getRequest.error);
    });
  }

  private async deleteMessagesByThread(threadId: string): Promise<void> {
    const store = await this.getStore('messages', 'readwrite');
    const index = store.index('threadId');
    
    return new Promise((resolve, reject) => {
      const request = index.openCursor(threadId);
      
      request.onsuccess = () => {
        const cursor = request.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
      request.onerror = () => reject(request.error);
    });
  }
}

// Singleton instance
let dbInstance: IndexedDBService | null = null;

export function getIndexedDB(): IndexedDBService {
  if (!dbInstance) {
    dbInstance = new IndexedDBService();
  }
  return dbInstance;
}

export { IndexedDBService };
