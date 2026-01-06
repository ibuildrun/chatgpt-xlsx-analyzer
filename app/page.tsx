'use client';

import React, { useState } from 'react';
import { ThreadList } from '@/components/ThreadList';
import { ChatArea } from '@/components/ChatArea';
import { SpreadsheetModal } from '@/components/SpreadsheetModal';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { SettingsButton } from '@/components/SettingsButton';
import { useThreads } from '@/hooks/useThreads';
import { useSpreadsheet } from '@/hooks/useSpreadsheet';
import { useApiKey } from '@/hooks/useApiKey';

export default function Home() {
  const {
    threads,
    activeThread,
    activeThreadId,
    messages,
    setActiveThreadId,
    createThread,
    deleteThread,
    refreshMessages,
  } = useThreads();

  const {
    isModalOpen,
    activeSheet,
    highlightRange,
    openSpreadsheet,
    closeSpreadsheet,
  } = useSpreadsheet();

  const { apiKey, setApiKey, removeApiKey, isValid, maskedKey } = useApiKey();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const handleInsertMention = (mention: string) => {
    setInputValue((prev) => (prev ? `${prev} ${mention}` : mention));
  };

  return (
    <div className="flex h-screen w-full overflow-hidden border-4 border-black">
      {/* Sidebar */}
      <ThreadList
        threads={threads}
        activeThreadId={activeThreadId}
        onSelectThread={setActiveThreadId}
        onCreateThread={createThread}
        onDeleteThread={deleteThread}
      />

      {/* Main Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top Bar with Settings */}
        <div className="absolute top-6 right-6 z-10">
          <SettingsButton
            hasApiKey={!!apiKey && isValid}
            onClick={() => setIsSettingsOpen(true)}
          />
        </div>

        {/* Chat Area */}
        {activeThread ? (
          <ChatArea
            thread={activeThread}
            initialMessages={messages}
            apiKey={apiKey}
            onOpenSpreadsheet={openSpreadsheet}
            onMessagesChange={refreshMessages}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="text-8xl mb-8 border-4 border-black p-4">_</div>
            <h2 className="text-xl font-bold mb-4 uppercase tracking-[0.2em]">
              System Initialized
            </h2>
            <p className="text-xs text-gray-500 mb-8 max-w-sm leading-relaxed">
              Welcome to the XLSX Analyzer Terminal. Select an existing thread
              or create a new session to begin processing spreadsheet data.
            </p>
            <button
              onClick={createThread}
              className="bg-black text-white px-12 py-3 font-bold text-sm border border-black hover:bg-white hover:text-black transition-all"
            >
              [ INITIALIZE_NEW_THREAD ]
            </button>
          </div>
        )}
      </main>

      {/* Spreadsheet Modal */}
      <SpreadsheetModal
        isOpen={isModalOpen}
        sheetName={activeSheet}
        initialHighlight={highlightRange}
        onClose={closeSpreadsheet}
        onInsertMention={handleInsertMention}
      />

      {/* API Key Manager */}
      <ApiKeyManager
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        maskedKey={maskedKey}
        isValid={isValid}
        onSave={setApiKey}
        onRemove={removeApiKey}
      />
    </div>
  );
}
