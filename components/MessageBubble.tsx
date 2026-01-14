'use client';

import React from 'react';
import type { Message } from '@/types';
import { ToolRenderer } from './ToolRenderer';
import { CodeBlock } from './CodeBlock';

interface MessageBubbleProps {
  message: Message;
  onToolConfirm?: (toolCallId: string, confirmed: boolean) => void;
  onOpenSpreadsheet?: (sheetName: string, range?: string) => void;
  onMentionClick?: (mention: string) => void;
}

type ContentPart = 
  | { type: 'text'; value: string }
  | { type: 'mention'; value: string }
  | { type: 'code'; language: string; code: string }
  | { type: 'inline-code'; value: string };

// Parse content with code blocks, inline code, and mentions
function parseContent(content: string): ContentPart[] {
  const parts: ContentPart[] = [];
  
  // First, extract code blocks (```language\ncode```)
  const codeBlockRegex = /```(\w*)\n?([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    // Process text before code block
    if (match.index > lastIndex) {
      const textBefore = content.slice(lastIndex, match.index);
      parts.push(...parseTextWithMentionsAndInlineCode(textBefore));
    }
    
    // Add code block
    parts.push({
      type: 'code',
      language: match[1] || 'text',
      code: match[2],
    });
    
    lastIndex = match.index + match[0].length;
  }

  // Process remaining text
  if (lastIndex < content.length) {
    parts.push(...parseTextWithMentionsAndInlineCode(content.slice(lastIndex)));
  }

  return parts.length > 0 ? parts : [{ type: 'text', value: content }];
}

// Parse text for inline code and mentions
function parseTextWithMentionsAndInlineCode(text: string): ContentPart[] {
  const parts: ContentPart[] = [];
  
  // Combined regex for inline code and mentions
  const combinedRegex = /(`[^`]+`)|(@[A-Za-z0-9_]+![A-Z]+\d+(?::[A-Z]+\d+)?)/g;
  let lastIndex = 0;
  let match;

  while ((match = combinedRegex.exec(text)) !== null) {
    // Add text before match
    if (match.index > lastIndex) {
      parts.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }

    if (match[1]) {
      // Inline code
      parts.push({ type: 'inline-code', value: match[1].slice(1, -1) });
    } else if (match[2]) {
      // Mention
      parts.push({ type: 'mention', value: match[2].slice(1) });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return parts;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onToolConfirm,
  onOpenSpreadsheet,
  onMentionClick,
}) => {
  const isUser = message.role === 'user';
  const parts = parseContent(message.content);

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const renderPart = (part: ContentPart, index: number) => {
    switch (part.type) {
      case 'text':
        return <span key={index}>{part.value}</span>;
      
      case 'code':
        return (
          <CodeBlock
            key={index}
            code={part.code}
            language={part.language}
            isDarkBg={isUser}
          />
        );
      
      case 'inline-code':
        return (
          <code
            key={index}
            className={`font-mono text-xs px-1.5 py-0.5 rounded ${
              isUser
                ? 'bg-gray-700 text-green-300'
                : 'bg-gray-200 text-pink-600'
            }`}
          >
            {part.value}
          </code>
        );
      
      case 'mention':
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
      
      default:
        return null;
    }
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
            {parts.map(renderPart)}
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
