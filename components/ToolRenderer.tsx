'use client';

import React from 'react';
import { CheckIcon, CloseIcon, TableIcon } from './icons';
import type { ToolCall, ToolResult } from '@/types';

interface ToolRendererProps {
  toolCall: ToolCall;
  toolResult?: ToolResult;
  onConfirm?: (toolCallId: string, confirmed: boolean) => void;
  onOpenSpreadsheet?: (sheetName: string, range?: string) => void;
}

export const ToolRenderer: React.FC<ToolRendererProps> = ({
  toolCall,
  toolResult,
  onConfirm,
  onOpenSpreadsheet,
}) => {
  const { id, name, args } = toolCall;
  const isResolved = !!toolResult;
  const sheetName = String(args.sheetName || 'Sheet1');
  const range = args.range ? String(args.range) : undefined;
  const cell = args.cell ? String(args.cell) : undefined;
  const message = args.message ? String(args.message) : undefined;

  // Render based on tool type
  switch (name) {
    case 'confirmAction':
      return (
        <div className="my-2 p-3 border border-yellow-500 bg-yellow-50">
          <div className="text-[10px] uppercase tracking-wider text-yellow-700 mb-2">
            CONFIRMATION REQUIRED
          </div>
          <div className="text-sm mb-3">{message || 'Confirm this action?'}</div>
          {isResolved ? (
            <div className={`text-xs font-bold ${toolResult.result?.confirmed ? 'text-green-600' : 'text-red-600'}`}>
              {toolResult.result?.confirmed ? 'CONFIRMED' : 'REJECTED'}
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => onConfirm?.(id, true)}
                className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
              >
                <CheckIcon size={12} />
                YES
              </button>
              <button
                onClick={() => onConfirm?.(id, false)}
                className="flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
              >
                <CloseIcon size={12} />
                NO
              </button>
            </div>
          )}
        </div>
      );

    case 'openTable':
      return (
        <div className="my-2 p-3 border border-blue-500 bg-blue-50">
          <div className="text-[10px] uppercase tracking-wider text-blue-700 mb-2">
            SPREADSHEET VIEW
          </div>
          <button
            onClick={() => onOpenSpreadsheet?.(sheetName, range)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
          >
            <TableIcon size={14} />
            Open {sheetName}{range ? ` (${range})` : ''}
          </button>
        </div>
      );

    case 'highlightCells':
      return (
        <div className="my-2 p-3 border border-purple-500 bg-purple-50">
          <div className="text-[10px] uppercase tracking-wider text-purple-700 mb-2">
            HIGHLIGHTED CELLS
          </div>
          <div className="text-sm font-mono">
            {sheetName}!{range}
          </div>
          {message && (
            <div className="text-xs text-gray-600 mt-1">{message}</div>
          )}
          <button
            onClick={() => onOpenSpreadsheet?.(sheetName, range)}
            className="mt-2 text-xs text-purple-600 hover:underline"
          >
            View in spreadsheet
          </button>
        </div>
      );

    case 'getRange':
      if (toolResult?.result?.cells) {
        const cells = toolResult.result.cells;
        return (
          <div className="my-2 p-3 border border-gray-300 bg-white">
            <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
              TABLE DATA: {sheetName}!{range}
            </div>
            <div className="overflow-x-auto">
              <table className="text-xs border-collapse">
                <tbody>
                  {cells.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cellData, colIndex) => (
                        <td
                          key={colIndex}
                          className="border border-gray-300 px-2 py-1 font-mono"
                        >
                          {cellData.value !== null ? String(cellData.value) : ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => onOpenSpreadsheet?.(sheetName, range)}
              className="mt-2 text-xs text-blue-600 hover:underline"
            >
              Open in full view
            </button>
          </div>
        );
      }
      return (
        <div className="my-2 p-2 border border-gray-300 bg-gray-50 text-xs">
          <span className="font-mono">getRange({sheetName}, {range})</span>
          {isResolved && <span className="ml-2 text-green-600">Done</span>}
        </div>
      );

    case 'updateCell':
      return (
        <div className="my-2 p-3 border border-orange-500 bg-orange-50">
          <div className="text-[10px] uppercase tracking-wider text-orange-700 mb-2">
            CELL UPDATE
          </div>
          <div className="text-sm font-mono">
            {sheetName}!{cell} = {JSON.stringify(args.value)}
          </div>
          {isResolved && (
            <div className={`text-xs mt-2 ${toolResult.result?.success ? 'text-green-600' : 'text-red-600'}`}>
              {toolResult.result?.success ? 'Updated successfully' : 'Update failed'}
            </div>
          )}
        </div>
      );

    default:
      return (
        <div className="my-2 p-2 border border-gray-300 bg-gray-50 text-xs">
          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">
            TOOL: {name}
          </div>
          <pre className="font-mono text-[10px] overflow-x-auto">
            {JSON.stringify(args, null, 2)}
          </pre>
          {isResolved && (
            <div className="mt-2 text-green-600 text-[10px]">Completed</div>
          )}
        </div>
      );
  }
};

export default ToolRenderer;
