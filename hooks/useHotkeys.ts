'use client';

import { useEffect, useCallback } from 'react';

export interface HotkeyConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
  enabled?: boolean;
}

export function useHotkeys(hotkeys: HotkeyConfig[]) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger hotkeys when typing in inputs (except for specific combos)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.isContentEditable;

    for (const hotkey of hotkeys) {
      if (hotkey.enabled === false) continue;

      const keyMatch = event.key.toLowerCase() === hotkey.key.toLowerCase();
      const ctrlMatch = hotkey.ctrl ? (event.ctrlKey || event.metaKey) : !event.ctrlKey && !event.metaKey;
      const shiftMatch = hotkey.shift ? event.shiftKey : !event.shiftKey;
      const altMatch = hotkey.alt ? event.altKey : !event.altKey;

      // For Ctrl/Cmd combos, allow even in inputs
      const isModifierCombo = hotkey.ctrl || hotkey.meta;
      
      if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
        if (!isInput || isModifierCombo) {
          event.preventDefault();
          hotkey.action();
          return;
        }
      }
    }
  }, [hotkeys]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Predefined hotkey sets
export const defaultHotkeys = {
  newThread: { key: 'n', ctrl: true, description: 'New thread' },
  focusInput: { key: '/', description: 'Focus message input' },
  toggleSidebar: { key: 'b', ctrl: true, description: 'Toggle sidebar' },
  openSettings: { key: ',', ctrl: true, description: 'Open settings' },
  openSpreadsheet: { key: 'g', ctrl: true, description: 'Open spreadsheet' },
  closeModal: { key: 'Escape', description: 'Close modal/dialog' },
  nextThread: { key: 'ArrowDown', alt: true, description: 'Next thread' },
  prevThread: { key: 'ArrowUp', alt: true, description: 'Previous thread' },
};

export default useHotkeys;
