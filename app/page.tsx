'use client';

import { useState, useEffect } from 'react';
import { HomePage } from '@/components/HomePage';
import { LoadingIcon } from '@/components/icons';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading only on server or before mount
  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white border-4 border-black">
        <div className="text-center">
          <div className="mb-6 animate-pulse flex justify-center">
            <LoadingIcon size={64} className="text-black" />
          </div>
          <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">
            LOADING SYSTEM...
          </div>
        </div>
      </div>
    );
  }

  // Once mounted, show HomePage immediately
  return <HomePage />;
}
