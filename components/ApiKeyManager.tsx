'use client';

import React, { useState, useEffect } from 'react';
import { CloseIcon, CheckIcon, KeyIcon, TrashIcon } from './icons';

interface ApiKeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string | null;
  maskedKey: string | null;
  isValid: boolean;
  onSave: (key: string) => void;
  onRemove: () => void;
}

export const ApiKeyManager: React.FC<ApiKeyManagerProps> = ({
  isOpen,
  onClose,
  apiKey,
  maskedKey,
  isValid,
  onSave,
  onRemove,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setInputValue('');
      setError(null);
    }
  }, [isOpen]);

  const validateKey = (key: string): boolean => {
    return /^sk-[a-zA-Z0-9_-]{20,}$/.test(key);
  };

  const handleSave = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) {
      setError('API key is required');
      return;
    }
    if (!validateKey(trimmed)) {
      setError('Invalid API key format. Should start with "sk-"');
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleRemove = () => {
    onRemove();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border-4 border-black max-w-md w-full mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <KeyIcon size={20} />
              <h2 className="text-sm font-black uppercase tracking-widest">
                API Key Settings
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 transition-colors"
            >
              <CloseIcon size={16} />
            </button>
          </div>

          {/* Current Key Status */}
          {apiKey && (
            <div className="mb-6 p-3 bg-gray-100 border border-gray-300">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
                CURRENT KEY
              </div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm">{maskedKey}</span>
                <span className={`text-xs ${isValid ? 'text-green-600' : 'text-red-600'}`}>
                  {isValid ? 'VALID' : 'INVALID'}
                </span>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              {apiKey ? 'REPLACE API KEY' : 'ENTER API KEY'}
            </label>
            <input
              type="password"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                setError(null);
              }}
              placeholder="sk-..."
              className="w-full border border-black p-3 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-black"
            />
            {error && (
              <div className="mt-2 text-xs text-red-600">{error}</div>
            )}
          </div>

          {/* Info */}
          <div className="mb-6 text-[10px] text-gray-500">
            Your API key is stored locally in your browser and never sent to our servers.
            Get your key from{' '}
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-black"
            >
              OpenAI Platform
            </a>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            {apiKey && (
              <button
                onClick={handleRemove}
                className="flex items-center gap-2 px-4 py-2 border border-red-600 text-red-600 text-xs font-bold hover:bg-red-50 transition-colors"
              >
                <TrashIcon size={12} />
                REMOVE
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={!inputValue.trim()}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <CheckIcon size={12} />
              SAVE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
