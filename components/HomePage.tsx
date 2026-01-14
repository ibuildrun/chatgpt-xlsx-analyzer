'use client';

import { useState, useEffect, useCallback } from 'react';
import { ThreadList } from '@/components/ThreadList';
import { ChatArea } from '@/components/ChatArea';
import { SpreadsheetModal } from '@/components/SpreadsheetModal';
import { ApiKeyManager } from '@/components/ApiKeyManager';
import { SettingsButton } from '@/components/SettingsButton';
import { HotkeysHelp } from '@/components/HotkeysHelp';
import { LoadingIcon, TerminalIcon, MenuIcon, KeyboardIcon } from '@/components/icons';
import { useThreads } from '@/hooks/useThreads';
import { useSpreadsheet } from '@/hooks/useSpreadsheet';
import { useApiKey } from '@/hooks/useApiKey';
import { useHotkeys } from '@/hooks/useHotkeys';

export function HomePage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isHotkeysHelpOpen, setIsHotkeysHelpOpen] = useState(false);
  
  const {
    threads,
    activeThread,
    activeThreadId,
    messages,
    loading,
    setActiveThreadId,
    createThread,
    deleteThread,
    refreshMessages,
  } = useThreads();
  
  // Mark as initialized once threads are loaded OR after timeout
  useEffect(() => {
    if (!loading) {
      setIsInitialized(true);
      return;
    }
    
    // Fallback: force initialize after 5 seconds even if still loading
    const timeout = setTimeout(() => {
      setIsInitialized(true);
    }, 5000);
    
    return () => clearTimeout(timeout);
  }, [loading]);

  // Close sidebar when thread is selected on mobile
  const handleSelectThread = (id: string) => {
    setActiveThreadId(id);
    setIsSidebarOpen(false);
  };

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
    setInputValue((prev: string) => (prev ? `${prev} ${mention}` : mention));
  };

  // Navigate to next/prev thread
  const navigateThread = useCallback((direction: 'next' | 'prev') => {
    if (threads.length === 0) return;
    const currentIndex = threads.findIndex(t => t.id === activeThreadId);
    let newIndex: number;
    
    if (direction === 'next') {
      newIndex = currentIndex < threads.length - 1 ? currentIndex + 1 : 0;
    } else {
      newIndex = currentIndex > 0 ? currentIndex - 1 : threads.length - 1;
    }
    
    setActiveThreadId(threads[newIndex].id);
  }, [threads, activeThreadId, setActiveThreadId]);

  // Focus message input
  const focusInput = useCallback(() => {
    // Find textarea in the DOM
    const textarea = document.querySelector('textarea');
    if (textarea) {
      textarea.focus();
    }
  }, []);

  // Global hotkeys
  useHotkeys([
    {
      key: 'n',
      ctrl: true,
      description: 'New thread',
      action: () => {
        createThread();
        setIsSidebarOpen(false);
      },
    },
    {
      key: 'b',
      ctrl: true,
      description: 'Toggle sidebar',
      action: () => setIsSidebarOpen(prev => !prev),
    },
    {
      key: ',',
      ctrl: true,
      description: 'Open settings',
      action: () => setIsSettingsOpen(true),
    },
    {
      key: 'g',
      ctrl: true,
      description: 'Open spreadsheet',
      action: () => openSpreadsheet('Sheet1'),
    },
    {
      key: '/',
      description: 'Focus input',
      action: focusInput,
    },
    {
      key: 'Escape',
      description: 'Close modal',
      action: () => {
        if (isHotkeysHelpOpen) setIsHotkeysHelpOpen(false);
        else if (isSettingsOpen) setIsSettingsOpen(false);
        else if (isModalOpen) closeSpreadsheet();
        else if (isSidebarOpen) setIsSidebarOpen(false);
      },
    },
    {
      key: 'ArrowDown',
      alt: true,
      description: 'Next thread',
      action: () => navigateThread('next'),
    },
    {
      key: 'ArrowUp',
      alt: true,
      description: 'Previous thread',
      action: () => navigateThread('prev'),
    },
    {
      key: '?',
      shift: true,
      description: 'Show hotkeys help',
      action: () => setIsHotkeysHelpOpen(true),
    },
  ]);

  // Use inputValue in a no-op to satisfy ESLint (value is used by SpreadsheetModal callback)
  void inputValue;

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white border-4 border-black">
        <div className="text-center">
          <div className="mb-6 animate-pulse flex justify-center">
            <LoadingIcon size={64} className="text-black" />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">
            INITIALIZING SYSTEM...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden border-2 md:border-4 border-black">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on md+ */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50 
        transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:block
        w-[280px] md:w-1/4 md:min-w-[240px] md:max-w-[320px]
      `}>
        <ThreadList
          threads={threads}
          activeThreadId={activeThreadId}
          onSelectThread={handleSelectThread}
          onCreateThread={() => {
            createThread();
            setIsSidebarOpen(false);
          }}
          onDeleteThread={deleteThread}
          onClose={() => setIsSidebarOpen(false)}
          isMobile={true}
        />
      </div>

      {/* Main Area */}
      <main className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Top Bar with Menu and Settings - centered vertically with header */}
        <div className="absolute top-2 md:top-3 right-2 md:right-6 left-2 md:left-auto z-10 flex items-center justify-between md:justify-end gap-2 md:gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 border border-black bg-white text-xs font-bold hover:bg-gray-100"
          >
            <MenuIcon size={16} />
            <span>THREADS</span>
          </button>
          
          <div className="flex items-center gap-2">
            {/* Hotkeys Help Button */}
            <button
              onClick={() => setIsHotkeysHelpOpen(true)}
              className="hidden md:flex items-center gap-1 px-2 py-1.5 border border-gray-300 bg-white text-[10px] font-bold hover:bg-gray-100 text-gray-600"
              title="Keyboard shortcuts (?)"
            >
              <KeyboardIcon size={14} />
              <span>?</span>
            </button>
            
            <SettingsButton
              hasApiKey={!!apiKey && isValid}
              onClick={() => setIsSettingsOpen(true)}
            />
          </div>
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
          <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 text-center">
            <div className="mb-6 md:mb-8 border-4 border-black p-3 md:p-4">
              <TerminalIcon size={48} className="text-black md:hidden" />
              <TerminalIcon size={64} className="text-black hidden md:block" />
            </div>
            <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 uppercase tracking-[0.15em] md:tracking-[0.2em]">
              System Initialized
            </h2>
            <p className="text-[10px] md:text-xs text-gray-500 mb-6 md:mb-8 max-w-sm leading-relaxed px-4">
              Welcome to the XLSX Analyzer Terminal. Select an existing thread
              or create a new session to begin processing spreadsheet data.
            </p>
            <button
              onClick={() => {
                createThread();
              }}
              className="bg-black text-white px-6 md:px-12 py-3 font-bold text-xs md:text-sm border border-black hover:bg-white hover:text-black transition-all"
            >
              [ NEW_THREAD ]
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

      {/* Hotkeys Help */}
      <HotkeysHelp
        isOpen={isHotkeysHelpOpen}
        onClose={() => setIsHotkeysHelpOpen(false)}
      />
    </div>
  );
}

export default HomePage;
