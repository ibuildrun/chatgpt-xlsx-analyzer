'use client';

import React from 'react';
import { SettingsIcon, KeyIcon } from './icons';

interface SettingsButtonProps {
  hasApiKey: boolean;
  onClick: () => void;
}

export const SettingsButton: React.FC<SettingsButtonProps> = ({
  hasApiKey,
  onClick,
}) => {
  return (
    <div className="flex flex-col items-end gap-1">
      {!hasApiKey && (
        <span className="text-[10px] text-yellow-700 font-bold uppercase tracking-wider">
          API KEY REQUIRED
        </span>
      )}
      <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 text-xs font-bold border transition-colors ${
          hasApiKey
            ? 'border-green-600 text-green-600 hover:bg-green-50'
            : 'border-yellow-600 text-yellow-600 hover:bg-yellow-50'
        }`}
        title={hasApiKey ? 'API key configured' : 'API key required'}
      >
        {hasApiKey ? <KeyIcon size={14} /> : <SettingsIcon size={14} />}
        <span>{hasApiKey ? 'KEY SET' : 'SET KEY'}</span>
      </button>
    </div>
  );
};

export default SettingsButton;
