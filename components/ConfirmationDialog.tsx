'use client';

import React from 'react';
import { CheckIcon, CloseIcon } from './icons';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  details?: Record<string, unknown>;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title = 'Confirm Action',
  message,
  details,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onCancel}
      />

      {/* Dialog */}
      <div className="relative bg-white border-4 border-black max-w-md w-full mx-4">
        <div className="p-6">
          <div className="text-xs font-black uppercase tracking-widest mb-4 text-yellow-600">
            {title}
          </div>

          <p className="text-sm mb-4">{message}</p>

          {details && (
            <div className="bg-gray-100 border border-gray-300 p-3 mb-4">
              <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-2">
                DETAILS
              </div>
              <pre className="text-xs font-mono overflow-x-auto">
                {JSON.stringify(details, null, 2)}
              </pre>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 border border-black text-xs font-bold hover:bg-gray-100 transition-colors"
            >
              <CloseIcon size={12} />
              NO, CANCEL
            </button>
            <button
              onClick={onConfirm}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs font-bold hover:bg-gray-800 transition-colors"
            >
              <CheckIcon size={12} />
              YES, CONFIRM
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
