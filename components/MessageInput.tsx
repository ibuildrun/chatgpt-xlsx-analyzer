'use client';

import React, { useRef, useEffect } from 'react';
import { SendIcon, TableIcon } from './icons';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onOpenTable?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  value,
  onChange,
  onSend,
  onOpenTable,
  disabled = false,
  placeholder = 'Type message or paste range... [CTRL+ENTER to send]',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!disabled && value.trim()) {
        onSend();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!disabled && value.trim()) {
      onSend();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border-t border-black bg-gray-50">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-white border border-black p-3 text-xs focus:outline-none focus:ring-1 focus:ring-black min-h-[80px] max-h-[200px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-2 right-2 flex gap-2">
            {onOpenTable && (
              <button
                type="button"
                onClick={onOpenTable}
                className="text-[10px] border border-gray-300 px-2 py-0.5 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
                title="Open spreadsheet"
              >
                <TableIcon size={12} />
                <span>GRID</span>
              </button>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-black text-white px-6 font-bold border border-black hover:bg-gray-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <SendIcon size={14} />
          <span>SEND</span>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
