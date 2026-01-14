# ChatGPT XLSX Analyzer

## Project Overview
A Next.js application for analyzing Excel spreadsheets using ChatGPT API.

## Tech Stack
- Next.js 16 with App Router
- React 19
- TypeScript
- Tailwind CSS
- AI SDK (Vercel)
- xlsx library for spreadsheet parsing

## Key Features
- Thread-based chat interface
- Spreadsheet data visualization
- Cell reference mentions (@Sheet1!A1:B3)
- Code syntax highlighting
- Keyboard shortcuts
- Static mode for GitHub Pages deployment

## Keyboard Shortcuts
- `Ctrl+N` - New thread
- `Ctrl+Enter` - Send message
- `Ctrl+B` - Toggle sidebar
- `Ctrl+,` - Open settings
- `Ctrl+G` - Open spreadsheet
- `/` - Focus message input
- `Alt+↑/↓` - Navigate threads
- `Esc` - Close modal
- `?` - Show shortcuts help

## Development
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm run typecheck # TypeScript check
```

## Static Export (GitHub Pages)
```bash
npm run build:static
```
