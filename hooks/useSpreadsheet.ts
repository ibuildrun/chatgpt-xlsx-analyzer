'use client';

import { useState, useCallback } from 'react';

interface UseSpreadsheetReturn {
  isModalOpen: boolean;
  activeSheet: string;
  highlightRange: string | undefined;
  openSpreadsheet: (sheetName?: string, range?: string) => void;
  closeSpreadsheet: () => void;
  sheets: string[];
  loadSheets: () => Promise<void>;
}

export function useSpreadsheet(): UseSpreadsheetReturn {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSheet, setActiveSheet] = useState('Sheet1');
  const [highlightRange, setHighlightRange] = useState<string | undefined>();
  const [sheets, setSheets] = useState<string[]>([]);

  const openSpreadsheet = useCallback((sheetName = 'Sheet1', range?: string) => {
    setActiveSheet(sheetName);
    setHighlightRange(range);
    setIsModalOpen(true);
  }, []);

  const closeSpreadsheet = useCallback(() => {
    setIsModalOpen(false);
    setHighlightRange(undefined);
  }, []);

  const loadSheets = useCallback(async () => {
    try {
      const response = await fetch('/api/xlsx?action=sheets');
      if (response.ok) {
        const data = await response.json();
        setSheets(data.sheets || []);
      }
    } catch (err) {
      console.error('Failed to load sheets:', err);
    }
  }, []);

  return {
    isModalOpen,
    activeSheet,
    highlightRange,
    openSpreadsheet,
    closeSpreadsheet,
    sheets,
    loadSheets,
  };
}

export default useSpreadsheet;
