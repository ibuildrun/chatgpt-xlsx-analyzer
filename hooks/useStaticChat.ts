'use client';

import { useState, useCallback } from 'react';
import type { Message as ChatMessage } from 'ai';
import { getIndexedDB } from '@/lib/db/indexeddb';

interface UseStaticChatOptions {
  threadId: string;
  apiKey: string | null;
  initialMessages?: ChatMessage[];
  onFinish?: () => void;
}

interface UseStaticChatReturn {
  messages: ChatMessage[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  append: (message: { role: 'user' | 'assistant'; content: string }) => Promise<void>;
}

export function useStaticChat({
  threadId,
  apiKey,
  initialMessages = [],
  onFinish,
}: UseStaticChatOptions): UseStaticChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const saveMessage = useCallback(async (
    role: 'user' | 'assistant',
    content: string
  ): Promise<ChatMessage> => {
    const db = getIndexedDB();
    const saved = await db.createMessage({
      threadId,
      role,
      content,
    });
    return {
      id: saved.id,
      role,
      content,
      createdAt: saved.createdAt,
    };
  }, [threadId]);

  const callOpenAI = useCallback(async (
    chatMessages: ChatMessage[]
  ): Promise<string> => {
    if (!apiKey) throw new Error('API key required');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages.map(m => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }, [apiKey]);


  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !apiKey || isLoading) return;

    const userContent = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      // Save and add user message
      const userMessage = await saveMessage('user', userContent);
      const newMessages = [...messages, userMessage];
      setMessages(newMessages);

      // Call OpenAI
      const assistantContent = await callOpenAI(newMessages);

      // Save and add assistant message
      const assistantMessage = await saveMessage('assistant', assistantContent);
      setMessages([...newMessages, assistantMessage]);

      onFinish?.();
    } catch (error) {
      console.error('Chat error:', error);
      // Add error message
      const errorMessage: ChatMessage = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        createdAt: new Date(),
      };
      setMessages([...messages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [input, apiKey, isLoading, messages, saveMessage, callOpenAI, onFinish]);

  const append = useCallback(async (message: { role: 'user' | 'assistant'; content: string }) => {
    setIsLoading(true);
    try {
      const savedMessage = await saveMessage(message.role, message.content);
      const newMessages = [...messages, savedMessage];
      setMessages(newMessages);

      if (message.role === 'user') {
        // Get AI response
        const assistantContent = await callOpenAI(newMessages);
        const assistantMessage = await saveMessage('assistant', assistantContent);
        setMessages([...newMessages, assistantMessage]);
      }

      onFinish?.();
    } catch (error) {
      console.error('Append error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [messages, saveMessage, callOpenAI, onFinish]);

  return {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    setMessages,
    append,
  };
}

export default useStaticChat;
