'use client';

import React from 'react';
import type { Message } from '@/types';
import { ToolRenderer } from './ToolRenderer';

interface MessageBubbleProps {
  message: Message;
  onToolConfirm?: (toolCallId: string, confirmed: boolean) => void;
  onOpenSpreadsheet?: (sheetName: string, range?: string) => void;
  onMentionClick?: (mention: string) => void;
}

// Parse mentions like @Sheet1!A1:B3
function parseMentions(content: string): (string | { type: 'mention'; value: string })[] {
  const mentionRegex = /@([A-Za-z0-9_]+![A-Z]+\d+(?::[A-Z]+\d+)?)/g;
  const parts: (string | { type: 'mention'; value: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push(content.slice(lastIndex, match.index));
    }
    parts.push({ type: 'mention', value: match[1] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(content.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [content];
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onToolConfirm,
  onOpenSpreadsheet,
  onMentionClick,
}) => {
  const isUser = message.role === 'user';
  const parts = parseMentions(message.content);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className={`mb-4 ${isUser ? 'text-right' : 'text-left'}`}>
      <div
        className={`inline-block max-w-[80%] text-left ${
          isUser
            ? 'bg-black text-white'
            : 'bg-gray-100 text-black border border-black'
        }`}
      >
        <div className="px-4 py-3">
          <div className="text-[10px] opacity-60 mb-1 uppercase tracking-wider">
            {isUser ? 'USER' : 'ASSISTANT'} / {formatTime(message.createdAt)}
          </div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            {parts.map((part, index) => {
              if (typeof part === 'string') {
                return <span key={index}>{part}</span>;
              }
              return (
                <button
                  key={index}
                  onClick={() => {
                    const [sheet, range] = part.value.split('!');
                    if (onMentionClick) {
                      onMentionClick(part.value);
                    } else if (onOpenSpreadsheet) {
                      onOpenSpreadsheet(sheet, range);
                    }
                  }}
                  className={`font-mono text-xs px-1 py-0.5 mx-0.5 ${
                    isUser
                      ? 'bg-white text-black hover:bg-gray-200'
                      : 'bg-black text-white hover:bg-gray-800'
                  } transition-colors`}
                >
                  @{part.value}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tool Calls */}
        {message.toolCalls && message.toolCalls.length > 0 && (
          <div className="border-t border-gray-300 px-4 py-2">
            {message.toolCalls.map((toolCall) => {
              const result = message.toolResults?.find(
                (r) => r.id === toolCall.id
              );
              return (
                <ToolRenderer
                  key={toolCall.id}
                  toolCall={toolCall}
                  toolResult={result}
                  onConfirm={onToolConfirm}
                  onOpenSpreadsheet={onOpenSpreadsheet}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;
