'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Thread, Message } from '@/types';

interface UseThreadsReturn {
  threads: Thread[];
  activeThread: Thread | null;
  activeThreadId: string | null;
  messages: Message[];
  loading: boolean;
  error: string | null;
  setActiveThreadId: (id: string | null) => void;
  createThread: () => Promise<Thread | null>;
  deleteThread: (id: string) => Promise<boolean>;
  refreshThreads: () => Promise<void>;
  refreshMessages: () => Promise<void>;
}

export function useThreads(): UseThreadsReturn {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true); // Start as true to show loading on first render
  const [error, setError] = useState<string | null>(null);

  const activeThread = useMemo(() => {
    if (!activeThreadId || !threads.length) return null;
    return threads.find((t) => t?.id === activeThreadId) ?? null;
  }, [threads, activeThreadId]);

  // Load threads with timeout and retry logic
  const refreshThreads = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
    
    try {
      const response = await fetch('/api/threads', {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error('Failed to load threads');
      }
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
        console.warn('Threads fetch timed out, showing empty state');
        setThreads([]);
      } else {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for active thread
  const refreshMessages = useCallback(async () => {
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

  // Initial load
  useEffect(() => {
    refreshThreads();
  }, [refreshThreads]);

  // Load messages when active thread changes
  useEffect(() => {
    refreshMessages();
  }, [activeThreadId, refreshMessages]);

  // Create new thread
  const createThread = useCallback(async (): Promise<Thread | null> => {
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
      
      if (!response.ok) {
        throw new Error('Failed to create thread');
      }
      
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

  // Delete thread
  const deleteThread = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/threads/${id}`, {
        method: 'DELETE',
      });
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

  return {
    threads,
    activeThread,
    activeThreadId,
    messages,
    loading,
    error,
    setActiveThreadId,
    createThread,
    deleteThread,
    refreshThreads,
    refreshMessages,
  };
}

export default useThreads;
