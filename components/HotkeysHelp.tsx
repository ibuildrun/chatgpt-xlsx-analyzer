'use client';

import React from 'react';
import { CloseIcon } from './icons';

interface HotkeyItem {
  keys: string[];
  description: string;
}

interface HotkeysHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

const hotkeys: HotkeyItem[] = [
  { keys: ['Ctrl', 'N'], description: 'Create new thread' },
  { keys: ['Ctrl', 'Enter'], description: 'Send message' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar' },
  { keys: ['Ctrl', ','], description: 'Open settings' },
  { keys: ['Ctrl', 'G'], description: 'Open spreadsheet' },
  { keys: ['/'], description: 'Focus message input' },
  { keys: ['Alt', '↑'], description: 'Previous thread' },
  { keys: ['Alt', '↓'], description: 'Next thread' },
  { keys: ['Esc'], description: 'Close modal/dialog' },
  { keys: ['?'], description: 'Show this help' },
];

export const HotkeysHelp: React.FC<HotkeysHelpProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white border-4 border-black w-full max-w-md">
        {/* Header */}
        <div className="p-4 border-b border-black flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 transition-colors"
            title="Close"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            {hotkeys.map((hotkey, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
              >
                <span className="text-xs text-gray-600">{hotkey.description}</span>
                <div className="flex gap-1">
                  {hotkey.keys.map((key, keyIndex) => (
                    <React.Fragment key={keyIndex}>
                      <kbd className="px-2 py-1 text-[10px] font-mono bg-gray-100 border border-gray-300 rounded">
                        {key}
                      </kbd>
                      {keyIndex < hotkey.keys.length - 1 && (
                        <span className="text-gray-400 text-xs">+</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-black bg-gray-50 text-[10px] text-gray-500 text-center">
          Press <kbd className="px-1 py-0.5 bg-gray-200 border border-gray-300 rounded text-[9px]">?</kbd> anytime to show this help
        </div>
      </div>
    </div>
  );
};

export default HotkeysHelp;
