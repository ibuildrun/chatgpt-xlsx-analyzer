'use client';

import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('@/components/HomePage'), {
  ssr: false,
  loading: () => (
    <div className="flex h-screen w-full items-center justify-center bg-white border-4 border-black">
      <div className="text-center">
        <div className="text-6xl mb-6 animate-pulse">⚡</div>
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-gray-600">
          LOADING SYSTEM...
        </div>
      </div>
    </div>
  ),
});

export default function Page() {
  return <HomePage />;
}
