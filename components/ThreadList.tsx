'use client';

import React from 'react';
import { PlusIcon, TrashIcon } from './icons';
import type { Thread } from '@/types';

interface ThreadListProps {
  threads: Thread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onCreateThread: () => void;
  onDeleteThread: (id: string) => void;
}

export const ThreadList: React.FC<ThreadListProps> = ({
  threads,
  activeThreadId,
  onSelectThread,
  onCreateThread,
  onDeleteThread,
}) => {
  return (
    <aside className="w-1/4 min-w-[240px] max-w-[320px] border-r border-black flex flex-col bg-white">
      <header className="p-4 border-b border-black">
        <h1 className="text-xs font-black uppercase tracking-widest mb-4">Threads</h1>
        <button
          onClick={onCreateThread}
          className="w-full bg-black text-white px-4 py-2 text-xs font-bold hover:bg-gray-800 transition-colors border border-black flex items-center justify-center gap-2"
        >
          <PlusIcon size={12} />
          <span>NEW THREAD</span>
        </button>
      </header>

      <nav className="flex-1 overflow-y-auto">
        {threads.length === 0 && (
          <div className="p-4 text-[10px] text-gray-400 italic">
            No threads yet...
          </div>
        )}
        {threads.map((thread) => (
          <div
            key={thread.id}
            onClick={() => onSelectThread(thread.id)}
            className={`p-4 border-b border-black cursor-pointer group transition-colors flex justify-between items-start
              ${activeThreadId === thread.id ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-gray-500 mb-1">
                ID: #{thread.id.slice(0, 8)}
              </div>
              <div className="text-xs font-bold uppercase truncate">
                {thread.title}
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteThread(thread.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-[10px] hover:text-red-600 transition-opacity ml-2 p-1"
              title="Delete thread"
            >
              <TrashIcon size={14} />
            </button>
          </div>
        ))}
      </nav>

      <footer className="p-4 border-t border-black bg-gray-50 text-[8px] text-gray-400 flex flex-col gap-1">
        <div>XLSX ANALYZER v1.0.0</div>
        <div>STATUS: SYSTEM_READY</div>
      </footer>
    </aside>
  );
};

export default ThreadList;
