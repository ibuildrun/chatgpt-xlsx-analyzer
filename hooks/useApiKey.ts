'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'openai-api-key';

interface UseApiKeyReturn {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  removeApiKey: () => void;
  isValid: boolean;
  maskedKey: string | null;
}

export function useApiKey(): UseApiKeyReturn {
  const [apiKey, setApiKeyState] = useState<string | null>(null);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setApiKeyState(stored);
    }
  }, []);

  const setApiKey = useCallback((key: string) => {
    localStorage.setItem(STORAGE_KEY, key);
    setApiKeyState(key);
  }, []);

  const removeApiKey = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setApiKeyState(null);
  }, []);

  // Validate format: sk-... or sk-proj-...
  const isValid = apiKey !== null && /^sk-[a-zA-Z0-9_-]{20,}$/.test(apiKey);

  // Mask key for display: sk-...xxxx
  const maskedKey = apiKey
    ? `${apiKey.slice(0, 7)}...${apiKey.slice(-4)}`
    : null;

  return {
    apiKey,
    setApiKey,
    removeApiKey,
    isValid,
    maskedKey,
  };
}

export default useApiKey;
