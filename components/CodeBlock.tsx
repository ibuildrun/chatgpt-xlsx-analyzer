'use client';

import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  isDarkBg?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({ code, language = 'text', isDarkBg = false }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Map common language aliases
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    py: 'python',
    rb: 'ruby',
    sh: 'bash',
    shell: 'bash',
    yml: 'yaml',
    md: 'markdown',
  };

  const normalizedLang = languageMap[language.toLowerCase()] || language.toLowerCase();

  return (
    <div className="my-2 rounded overflow-hidden border border-gray-300">
      {/* Header */}
      <div className={`flex items-center justify-between px-3 py-1.5 text-[10px] ${
        isDarkBg ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
      }`}>
        <span className="font-mono uppercase tracking-wider">{normalizedLang || 'code'}</span>
        <button
          onClick={handleCopy}
          className={`px-2 py-0.5 rounded transition-colors ${
            isDarkBg 
              ? 'hover:bg-gray-600 text-gray-300' 
              : 'hover:bg-gray-300 text-gray-600'
          }`}
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      {/* Code */}
      <SyntaxHighlighter
        language={normalizedLang}
        style={isDarkBg ? oneDark : oneLight}
        customStyle={{
          margin: 0,
          padding: '12px',
          fontSize: '12px',
          lineHeight: '1.5',
          borderRadius: 0,
        }}
        wrapLongLines
      >
        {code.trim()}
      </SyntaxHighlighter>
    </div>
  );
};

export default CodeBlock;
