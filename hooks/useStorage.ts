'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Thread, Message } from '@/types';
import { getIndexedDB } from '@/lib/db/indexeddb';

// Detect if running in static mode (GitHub Pages)
const isStaticMode = typeof window !== 'undefined' && (
  window.location.hostname.includes('github.io') ||
  process.env.NEXT_PUBLIC_STATIC_MODE === 'true'
);

interface UseStorageReturn {
  threads: Thread[];
  activeThread: Thread | null;
  activeThreadId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  isStatic: boolean;
  setActiveThreadId: (id: string | null) => void;
  createThread: () => Promise<Thread | null>;
  deleteThread: (id: string) => Promise<boolean>;
  refreshThreads: () => Promise<void>;
  refreshMessages: () => Promise<void>;
  createMessage: (threadId: string, role: 'user' | 'assistant', content: string) => Promise<Message | null>;
}

export function useStorage(): UseStorageReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const activeThread = useMemo(() => {
    if (!activeThreadId || !threads.length) return null;
    return threads.find((t) => t?.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  // IndexedDB operations
  const refreshThreadsIndexedDB = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const db = getIndexedDB();
      const threadsData = await db.getThreads();
      setThreads(threadsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load threads');
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMessagesIndexedDB = useCallback(async () => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    try {
      const db = getIndexedDB();
      const messagesData = await db.getMessages(activeThreadId);
      setMessages(messagesData);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [activeThreadId]);

  const createThreadIndexedDB = useCallback(async (): Promise<Thread | null> => {
    try {
      const db = getIndexedDB();
      const newThread = await db.createThread({ title: 'New Thread' });
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      return newThread;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create thread');
      return null;
    }
  }, []);

  const deleteThreadIndexedDB = useCallback(async (id: string): Promise<boolean> => {
    try {
      const db = getIndexedDB();
      await db.deleteThread(id);
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeThreadId === id) {
        setActiveThreadId(null);
        setMessages([]);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete thread');
      return false;
    }
  }, [activeThreadId]);


  const createMessageIndexedDB = useCallback(async (
    threadId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Message | null> => {
    try {
      const db = getIndexedDB();
      const message = await db.createMessage({ threadId, role, content });
      setMessages((prev) => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Failed to create message:', err);
      return null;
    }
  }, []);

  // Server API operations
  const refreshThreadsAPI = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    try {
      const response = await fetch('/api/threads', { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to load threads');
      const json = await response.json();
      const threadsData = json.data || json.threads || [];
      const validThreads = threadsData.filter(
        (t: Thread | null | undefined): t is Thread => 
          t !== null && t !== undefined && typeof t.id === 'string'
      );
      setThreads(validThreads);
    } catch (err) {
      clearTimeout(timeoutId);
      if (err instanceof Error && err.name === 'AbortError') {
        setThreads([]);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMessagesAPI = useCallback(async () => {
    if (!activeThreadId) {
      setMessages([]);
      return;
    }
    try {
      const response = await fetch(`/api/messages?threadId=${activeThreadId}`);
      if (!response.ok) throw new Error('Failed to load messages');
      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [activeThreadId]);

  const createThreadAPI = useCallback(async (): Promise<Thread | null> => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const response = await fetch('/api/threads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Thread' }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) throw new Error('Failed to create thread');
      
      const json = await response.json();
      const newThread = json.data || json.thread;
      setThreads((prev) => [newThread, ...prev]);
      setActiveThreadId(newThread.id);
      return newThread;
    } catch (err) {
      clearTimeout(timeoutId);
      setError(err instanceof Error ? err.message : 'Unknown error');
      return null;
    }
  }, []);

  const deleteThreadAPI = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/threads/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete thread');
      setThreads((prev) => prev.filter((t) => t.id !== id));
      if (activeThreadId === id) {
        setActiveThreadId(null);
        setMessages([]);
      }
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      return false;
    }
  }, [activeThreadId]);

  const createMessageAPI = useCallback(async (
    threadId: string,
    role: 'user' | 'assistant',
    content: string
  ): Promise<Message | null> => {
    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threadId, role, content }),
      });
      if (!response.ok) throw new Error('Failed to create message');
      const data = await response.json();
      const message = data.message || data.data;
      setMessages((prev) => [...prev, message]);
      return message;
    } catch (err) {
      console.error('Failed to create message:', err);
      return null;
    }
  }, []);

  // Select appropriate implementation based on mode
  const refreshThreads = isStaticMode ? refreshThreadsIndexedDB : refreshThreadsAPI;
  const refreshMessages = isStaticMode ? refreshMessagesIndexedDB : refreshMessagesAPI;
  const createThread = isStaticMode ? createThreadIndexedDB : createThreadAPI;
  const deleteThread = isStaticMode ? deleteThreadIndexedDB : deleteThreadAPI;
  const createMessage = isStaticMode ? createMessageIndexedDB : createMessageAPI;

  // Initial load
  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  // Load messages when active thread changes
  useEffect(() => {
    refreshMessages();
  }, [activeThreadId, refreshMessages]);

  return {
    threads,
    activeThread,
    activeThreadId,
    messages,
    loading,
    error,
    isStatic: isStaticMode,
    setActiveThreadId,
    createThread,
    deleteThread,
    refreshThreads,
    refreshMessages,
    createMessage,
  };
}

export default useStorage;
