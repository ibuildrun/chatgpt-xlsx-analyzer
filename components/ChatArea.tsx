'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useChat } from 'ai/react';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { useStaticChat } from '@/hooks/useStaticChat';
import type { Message, Thread } from '@/types';
import type { Message as ChatMessage } from 'ai';

// Detect if running in static mode (GitHub Pages)
function isStaticMode(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname.includes('github.io') ||
    process.env.NEXT_PUBLIC_STATIC_MODE === 'true'
  );
}

interface ChatAreaProps {
  thread: Thread | null;
  initialMessages: Message[];
  apiKey: string | null;
  onOpenSpreadsheet: (sheetName: string, range?: string) => void;
  onMessagesChange?: () => void;
}

// Server mode chat component
const ServerChat: React.FC<ChatAreaProps & { scrollRef: React.RefObject<HTMLDivElement | null> }> = ({
  thread,
  initialMessages,
  apiKey,
  onOpenSpreadsheet,
  onMessagesChange,
  scrollRef,
}) => {
  const [pendingConfirmation, setPendingConfirmation] = useState<string | null>(null);

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
    initialMessages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: new Date(m.createdAt),
    })),
    headers: {
      'x-api-key': apiKey || '',
      'x-thread-id': thread?.id || '',
    },
    onFinish: () => {
      onMessagesChange?.();
    },
  });

  useEffect(() => {
    setMessages(
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: new Date(m.createdAt),
      }))
    );
  }, [thread?.id, initialMessages, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  const handleToolConfirm = async (toolCallId: string, confirmed: boolean) => {
    setPendingConfirmation(null);
    await append({
      role: 'user',
      content: confirmed 
        ? `[TOOL_CONFIRMED:${toolCallId}] User confirmed the action.`
        : `[TOOL_REJECTED:${toolCallId}] User rejected the action.`,
    });
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !apiKey) return;
    handleSubmit(e);
  };

  const displayMessages: Message[] = messages.map((m) => ({
    id: m.id,
    threadId: thread?.id || '',
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt || new Date(),
  }));

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth" ref={scrollRef}>
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
            <div className="text-3xl md:text-4xl border-2 border-current p-2">_</div>
            <div className="text-[10px] md:text-xs font-bold tracking-widest">AWAITING_INPUT...</div>
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
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onOpenTable={() => onOpenSpreadsheet('Sheet1')}
        disabled={isLoading || !apiKey || !!pendingConfirmation}
        placeholder={
          !apiKey
            ? 'Set API key to chat...'
            : pendingConfirmation
            ? 'Waiting for confirmation...'
            : 'Type message... [CTRL+ENTER]'
        }
      />
    </>
  );
};


// Static mode chat component (GitHub Pages)
const StaticChat: React.FC<ChatAreaProps & { scrollRef: React.RefObject<HTMLDivElement | null> }> = ({
  thread,
  initialMessages,
  apiKey,
  onOpenSpreadsheet,
  onMessagesChange,
  scrollRef,
}) => {
  const {
    messages,
    input,
    setInput,
    handleSubmit,
    isLoading,
    setMessages,
  } = useStaticChat({
    threadId: thread?.id || '',
    apiKey,
    initialMessages: initialMessages.map((m) => ({
      id: m.id,
      role: m.role as 'user' | 'assistant',
      content: m.content,
      createdAt: new Date(m.createdAt),
    })),
    onFinish: onMessagesChange,
  });

  useEffect(() => {
    setMessages(
      initialMessages.map((m) => ({
        id: m.id,
        role: m.role as 'user' | 'assistant',
        content: m.content,
        createdAt: new Date(m.createdAt),
      }))
    );
  }, [thread?.id, initialMessages, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, scrollRef]);

  const handleToolConfirm = async (_toolCallId: string, _confirmed: boolean) => {
    // Tool confirmation not supported in static mode
  };

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || !apiKey) return;
    handleSubmit(e);
  };

  const displayMessages: Message[] = messages.map((m: ChatMessage) => ({
    id: m.id,
    threadId: thread?.id || '',
    role: m.role as 'user' | 'assistant',
    content: m.content,
    createdAt: m.createdAt || new Date(),
  }));

  return (
    <>
      <div className="flex-1 overflow-y-auto p-3 md:p-6 scroll-smooth" ref={scrollRef}>
        {displayMessages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-gray-300 opacity-50 space-y-2">
            <div className="text-3xl md:text-4xl border-2 border-current p-2">_</div>
            <div className="text-[10px] md:text-xs font-bold tracking-widest">AWAITING_INPUT...</div>
            <div className="text-[8px] text-yellow-600 mt-4">STATIC MODE - Direct OpenAI API</div>
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
      <MessageInput
        value={input}
        onChange={setInput}
        onSend={handleSend}
        onOpenTable={() => onOpenSpreadsheet('Sheet1')}
        disabled={isLoading || !apiKey}
        placeholder={!apiKey ? 'Set API key to chat...' : 'Type message... [CTRL+ENTER]'}
      />
    </>
  );
};

export const ChatArea: React.FC<ChatAreaProps> = (props) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [staticMode, setStaticMode] = useState(false);

  useEffect(() => {
    setStaticMode(isStaticMode());
  }, []);

  const { thread } = props;

  if (!thread) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
        <div className="text-6xl md:text-8xl mb-6 md:mb-8 border-4 border-black p-3 md:p-4">_</div>
        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 uppercase tracking-[0.15em] md:tracking-[0.2em]">
          System Initialized
        </h2>
        <p className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-8 max-w-sm leading-relaxed px-4">
          Welcome to the XLSX Analyzer Terminal. Select an existing thread or
          create a new session to begin processing spreadsheet data.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden pt-14 md:pt-0">
      <header className="h-12 md:h-14 px-3 md:px-4 border-b border-black flex items-center">
        <div className="truncate">
          <span className="text-[10px] text-gray-500 mr-2">ACTIVE_THREAD:</span>
          <span className="text-xs font-bold">{thread.title}</span>
          {staticMode && (
            <span className="ml-2 text-[8px] text-yellow-600 uppercase">[STATIC]</span>
          )}
        </div>
      </header>

      {staticMode ? (
        <StaticChat {...props} scrollRef={scrollRef} />
      ) : (
        <ServerChat {...props} scrollRef={scrollRef} />
      )}
    </div>
  );
};

export default ChatArea;
