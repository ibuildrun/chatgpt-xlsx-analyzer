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
  placeholder = 'Type message... [CTRL+ENTER]',
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
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
    <form onSubmit={handleSubmit} className="p-2 md:p-4 border-t border-black bg-gray-50 safe-bottom">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-white border border-black p-2 md:p-3 text-xs focus:outline-none focus:ring-1 focus:ring-black min-h-[60px] md:min-h-[80px] max-h-[150px] resize-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <div className="absolute bottom-1.5 md:bottom-2 right-1.5 md:right-2 flex gap-1 md:gap-2">
            {onOpenTable && (
              <button
                type="button"
                onClick={onOpenTable}
                className="text-[10px] border border-gray-300 px-1.5 md:px-2 py-0.5 bg-gray-100 hover:bg-gray-200 flex items-center gap-1"
                title="Open spreadsheet"
              >
                <TableIcon size={12} />
                <span className="hidden sm:inline">GRID</span>
              </button>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={disabled || !value.trim()}
          className="bg-black text-white px-3 md:px-6 font-bold border border-black hover:bg-gray-800 disabled:bg-gray-300 disabled:border-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 md:gap-2"
        >
          <SendIcon size={14} />
          <span className="hidden sm:inline">SEND</span>
        </button>
      </div>
    </form>
  );
};

export default MessageInput;
