# ChatGPT XLSX Analyzer

A simplified ChatGPT-like interface with thread management, message persistence, and XLSX spreadsheet analysis capabilities.

## Features

- Thread-based chat interface
- Message persistence with SQLite
- XLSX file reading and editing
- Cell range selection and mentions
- Generative UI with tool confirmations
- API key management (stored locally)

## Tech Stack

- Next.js 15 (App Router)
- Vercel AI SDK
- Bun runtime with SQLite
- TypeScript
- Tailwind CSS

## Getting Started

### Prerequisites

- Bun 1.1+ or Docker

### Installation

```bash
# Install dependencies
bun install

# Create example XLSX file
bun run setup:xlsx

# Initialize database
bun run db:init

# Start development server
bun run dev
```

### Using Docker

```bash
# Build and run
docker-compose up --build

# Or just run
docker-compose up
```

The application will be available at `http://localhost:3000`.

## Configuration

### API Key

1. Click the "SET KEY" button in the top right
2. Enter your OpenAI API key (starts with `sk-`)
3. The key is stored locally in your browser

### XLSX File

The example spreadsheet is located at `data/example.xlsx` with:
- Sheet1: Employee data (Name, Email, Amount, Tax, Total)
- Products: Product inventory (Product, Category, Price, Quantity, Revenue)

## Project Structure

```
chatgpt-xlsx-analyzer/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint
│   │   ├── messages/      # Message CRUD
│   │   ├── threads/       # Thread CRUD
│   │   └── xlsx/          # XLSX operations
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── icons/             # SVG icons
│   ├── ApiKeyManager.tsx
│   ├── ChatArea.tsx
│   ├── ConfirmationDialog.tsx
│   ├── MessageBubble.tsx
│   ├── MessageInput.tsx
│   ├── SettingsButton.tsx
│   ├── SpreadsheetModal.tsx
│   ├── ThreadList.tsx
│   └── ToolRenderer.tsx
├── hooks/
│   ├── useApiKey.ts
│   ├── useSpreadsheet.ts
│   └── useThreads.ts
├── lib/
│   ├── ai/                # AI service config
│   ├── db/                # SQLite database
│   ├── mentions/          # Mention parser
│   ├── tools/             # Tool definitions
│   └── xlsx/              # XLSX service
├── tests/
│   ├── e2e/               # Playwright tests
│   └── properties/        # Property-based tests
├── types/                 # TypeScript types
└── data/                  # XLSX files
```

## Scripts

```bash
bun run dev          # Start development server
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run typecheck    # Run TypeScript check
bun run test         # Run property tests
bun run test:e2e     # Run E2E tests
bun run setup:xlsx   # Create example XLSX
bun run db:init      # Initialize database
```

## Mentions

Use `@SheetName!CellRange` format to reference spreadsheet cells:
- Single cell: `@Sheet1!A1`
- Range: `@Sheet1!A1:B5`

Click on a mention to open the spreadsheet at that location.

## Tools

The AI assistant has access to:
- `getRange` - Read cell data from spreadsheet
- `updateCell` - Update a cell value (requires confirmation)
- `openTable` - Display spreadsheet in modal
- `highlightCells` - Highlight specific cells
- `confirmAction` - Request user confirmation

## Limitations

- Single XLSX file support
- No real-time collaboration
- API key required for chat functionality
- Formulas are read-only (values can be updated)

## License

MIT
