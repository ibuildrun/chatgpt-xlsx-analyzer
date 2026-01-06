'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import type { Message as AIMessage } from 'ai';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import type { Message, Thread } from '@/types';

interface ChatAreaProps {
  thread: Thread | null;
  initialMessages: Message[];
  apiKey: string | null;
  onOpenSpreadsheet: (sheetName: string, range?: string) => void;
  onMessagesChange?: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  thread,
  initialMessages,
  apiKey,
  onOpenSpreadsheet,
  onMessagesChange,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [pendingConfirmation, setPendingConfirmation] = useState<string | null>(null);

  // Convert our messages to AI SDK format
  const convertedMessages: AIMessage[] = initialMessages.map((m) => ({
    id: m.id,
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: new Date(m.createdAt),
  }));

  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    append,
    setMessages,
  } = useChat({
    api: '/api/chat',
    id: thread?.id,
    initialMessages: convertedMessages,
    headers: {
      'x-api-key': apiKey || '',
      'x-thread-id': thread?.id || '',
    },
    onFinish: () => {
      onMessagesChange?.();
    },
  });

  // Reset messages when thread changes
  useEffect(() => {
    setMessages(convertedMessages);
  }, [thread?.id, initialMessages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleToolConfirm = async (toolCallId: string, confirmed: boolean) => {
    setPendingConfirmation(null);
    
    // Send confirmation result back to the chat
    await append({
      role: 'user',
      content: confirmed 
        ? `[TOOL_CONFIRMED:${toolCallId}] User confirmed the action.`
        : `[TOOL_REJECTED:${toolCallId}] User rejected the action.`,
    });
  };

  const handleSend = () => {
    if (!input.trim() || !apiKey) return;
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  // Convert AI messages to our format for display
  const displayMessages: Message[] = messages.map((m) => ({
    id: m.id,
    threadId: thread?.id || '',
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt || new Date(),
    toolCalls: (m as unknown as { toolInvocations?: Array<{ toolCallId: string; toolName: string; args: Record<string, unknown> }> }).toolInvocations?.map((t) => ({
      id: t.toolCallId,
      name: t.toolName,
      args: t.args,
    })),
  }));

  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <div className="text-8xl mb-8 border-4 border-black p-4">_</div>
        <h2 className="text-xl font-bold mb-4 uppercase tracking-[0.2em]">
          System Initialized
        </h2>
        <p className="text-xs text-gray-500 mb-8 max-w-sm leading-relaxed">
          Welcome to the XLSX Analyzer Terminal. Select an existing thread or
          create a new session to begin processing spreadsheet data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="p-4 border-b border-black flex items-center justify-between">
        <div>
          <span className="text-[10px] text-gray-500 mr-2">ACTIVE_THREAD:</span>
          <span className="text-xs font-bold">{thread.title}</span>
        </div>
        {!apiKey && (
          <div className="text-[10px] text-yellow-600 font-bold">
            API KEY REQUIRED
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 scroll-smooth" ref={scrollRef}>
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
            <div className="text-4xl border-2 border-current p-2">_</div>
            <div className="text-xs font-bold tracking-widest">AWAITING_INPUT...</div>
          </div>
        )}
        {displayMessages.map((m) => (
          <MessageBubble
            key={m.id}
            message={m}
            onToolConfirm={handleToolConfirm}
            onOpenSpreadsheet={onOpenSpreadsheet}
          />
        ))}
        {isLoading && (
          <div className="text-[10px] text-gray-400 animate-pulse font-bold">
            AI IS PROCESSING_DATA...
          </div>
        )}
      </div>

      {/* Input */}
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onOpenTable={() => onOpenSpreadsheet('Sheet1')}
        disabled={isLoading || !apiKey || !!pendingConfirmation}
        placeholder={
          !apiKey
            ? 'Set your API key to start chatting...'
            : pendingConfirmation
            ? 'Waiting for confirmation...'
            : 'Type message or paste range... [CTRL+ENTER to send]'
        }
      />
    </div>
  );
};

export default ChatArea;
