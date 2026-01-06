'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { CloseIcon, CheckIcon } from './icons';
import type { SpreadsheetData, CellData } from '@/types';

interface SpreadsheetModalProps {
  isOpen: boolean;
  sheetName: string;
  initialHighlight?: string;
  onClose: () => void;
  onInsertMention: (mention: string) => void;
}

interface CellPosition {
  row: number;
  col: number;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  sheetName,
  initialHighlight: _initialHighlight,
  onClose,
  onInsertMention,
}) => {
  const [data, setData] = useState<SpreadsheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<{ start: CellPosition; end: CellPosition } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/xlsx?action=data&sheet=${encodeURIComponent(sheetName)}`);
      if (!response.ok) {
        throw new Error('Failed to load spreadsheet data');
      }
      const result = await response.json();
      setData(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [sheetName]);

  useEffect(() => {
    if (isOpen && sheetName) {
      loadData();
    }
  }, [isOpen, sheetName, loadData]);

  const numberToColumn = (num: number): string => {
    let result = '';
    while (num >= 0) {
      result = String.fromCharCode((num % 26) + 65) + result;
      num = Math.floor(num / 26) - 1;
    }
    return result;
  };

  const getCellAddress = (row: number, col: number): string => {
    return `${numberToColumn(col)}${row + 1}`;
  };

  const handleCellMouseDown = (row: number, col: number) => {
    setIsSelecting(true);
    setSelection({ start: { row, col }, end: { row, col } });
  };

  const handleCellMouseEnter = (row: number, col: number) => {
    if (isSelecting && selection) {
      setSelection({ ...selection, end: { row, col } });
    }
  };

  const handleMouseUp = () => {
    setIsSelecting(false);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const getSelectionRange = (): string | null => {
    if (!selection) return null;
    const { start, end } = selection;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);

    const startAddr = getCellAddress(minRow, minCol);
    const endAddr = getCellAddress(maxRow, maxCol);

    if (startAddr === endAddr) {
      return startAddr;
    }
    return `${startAddr}:${endAddr}`;
  };

  const isCellSelected = (row: number, col: number): boolean => {
    if (!selection) return false;
    const { start, end } = selection;
    const minRow = Math.min(start.row, end.row);
    const maxRow = Math.max(start.row, end.row);
    const minCol = Math.min(start.col, end.col);
    const maxCol = Math.max(start.col, end.col);
    return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
  };

  const handleInsertMention = () => {
    const range = getSelectionRange();
    if (range) {
      onInsertMention(`@${sheetName}!${range}`);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Build grid from data
  const rows: CellData[][] = [];
  if (data) {
    for (let r = 0; r < data.rowCount; r++) {
      const row: CellData[] = [];
      for (let c = 0; c < data.colCount; c++) {
        const addr = getCellAddress(r, c);
        row.push(data.cells[addr] || { address: addr, value: null });
      }
      rows.push(row);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border-4 border-black max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-black flex items-center justify-between">
          <div>
            <span className="text-[10px] text-gray-500 mr-2">SPREADSHEET:</span>
            <span className="text-sm font-bold">{sheetName}</span>
          </div>
          <div className="flex items-center gap-4">
            {selection && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 border border-gray-300">
                  {getSelectionRange()}
                </span>
                <button
                  onClick={handleInsertMention}
                  className="flex items-center gap-1 px-3 py-1 bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors"
                >
                  <CheckIcon size={12} />
                  INSERT MENTION
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 transition-colors"
              title="Close"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {loading && (
            <div className="flex items-center justify-center h-32">
              <div className="text-xs text-gray-500 animate-pulse">LOADING_DATA...</div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-500 text-red-700 text-sm">
              {error}
            </div>
          )}

          {data && !loading && (
            <div className="overflow-auto">
              <table className="border-collapse text-xs select-none">
                <thead>
                  <tr>
                    <th className="border border-gray-300 bg-gray-100 px-2 py-1 w-8"></th>
                    {Array.from({ length: data.colCount }, (_, i) => (
                      <th
                        key={i}
                        className="border border-gray-300 bg-gray-100 px-3 py-1 font-bold text-center min-w-[80px]"
                      >
                        {numberToColumn(i)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      <td className="border border-gray-300 bg-gray-100 px-2 py-1 font-bold text-center">
                        {rowIndex + 1}
                      </td>
                      {row.map((cell, colIndex) => (
                        <td
                          key={colIndex}
                          onMouseDown={() => handleCellMouseDown(rowIndex, colIndex)}
                          onMouseEnter={() => handleCellMouseEnter(rowIndex, colIndex)}
                          className={`border border-gray-300 px-2 py-1 cursor-cell font-mono ${
                            isCellSelected(rowIndex, colIndex)
                              ? 'bg-blue-100 border-blue-500'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          {cell.value !== null ? String(cell.value) : ''}
                          {cell.formula && (
                            <span className="text-[8px] text-gray-400 ml-1" title={`=${cell.formula}`}>
                              fx
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black bg-gray-50 text-[10px] text-gray-500">
          Click and drag to select cells. Click &quot;INSERT MENTION&quot; to add reference to chat.
        </div>
      </div>
    </div>
  );
};

export default SpreadsheetModal;
