# ChatGPT XLSX Analyzer

Упрощённый аналог интерфейса ChatGPT с тредами, хранением сообщений в базе и генеративным UI на основе Vercel AI SDK.

## Соответствие ТЗ

### Стек и общие требования

| Требование | Статус | Реализация |
|------------|--------|------------|
| Next.js 16 (App Router, TypeScript) | ✅ | Next.js 16.1.1, App Router, TypeScript strict mode |
| Vercel AI SDK useChat | ✅ | `useChat` из `ai/react` в ChatArea.tsx |
| Generative UI / tools | ✅ | 5 tools: confirmAction, openTable, highlightCells, getRange, updateCell |
| Bun 1.3+ SQLite | ⚠️ | `better-sqlite3` вместо `bun:sqlite`* |
| Хранение тредов | ✅ | Таблица `threads` в SQLite |
| Хранение сообщений | ✅ | Таблица `messages` в SQLite |
| Tailwind стилизация | ✅ | Programmer minimalist стиль |
| Структура проекта | ✅ | API/UI/DB разделены |
| README | ✅ | Инструкции по запуску |

*Примечание: Next.js 16 использует Node.js workers для сборки, которые не поддерживают Bun-специфичные модули (`bun:sqlite`). Использован `better-sqlite3` — стандартная SQLite библиотека с идентичным функционалом.

### Функциональные требования

| Требование | Статус |
|------------|--------|
| Список тредов (слева) | ✅ |
| Создание нового треда | ✅ |
| Переключение между тредами | ✅ |
| Загрузка сообщений из БД | ✅ |
| Чат через useChat | ✅ |
| Стриминг ответов | ✅ |
| Сохранение сообщений в БД | ✅ |
| Client-side tools | ✅ |
| Подтверждение опасных действий (Да/Нет) | ✅ |
| Чтение XLSX диапазонов (getRange) | ✅ |
| Запись в XLSX с подтверждением (updateCell) | ✅ |
| Модальное окно таблицы | ✅ |
| Выделение ячеек (клик и drag) | ✅ |
| Меншоны диапазонов (@Sheet1!A1:B3) | ✅ |
| E2E тесты (Playwright) | ✅ |

### Ограничения

- Один XLSX файл (data/example.xlsx)
- API ключ хранится в localStorage браузера
- Формулы только для чтения (значения можно обновлять)

## Tech Stack

- Next.js 16 (App Router)
- Vercel AI SDK (useChat, streamText, tools)
- SQLite (better-sqlite3)
- TypeScript
- Tailwind CSS

## Быстрый старт

### Docker (рекомендуется)

```bash
# Запуск в Docker
docker-compose up --build

# Приложение доступно на http://localhost:3003
```

### Локальная разработка

```bash
# Установка зависимостей
npm install

# Создание примера XLSX
npm run setup:xlsx

# Запуск dev сервера
npm run dev

# Приложение доступно на http://localhost:3000
```

## Структура проекта

```
chatgpt-xlsx-analyzer/
├── app/
│   ├── api/
│   │   ├── chat/          # AI chat endpoint (streaming)
│   │   ├── messages/      # Message CRUD
│   │   ├── threads/       # Thread CRUD
│   │   └── xlsx/          # XLSX operations
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── icons/             # SVG icons
│   ├── ApiKeyManager.tsx  # API key modal
│   ├── ChatArea.tsx       # Chat with useChat
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
└── data/                  # XLSX files + SQLite DB
```

## Скрипты

```bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run start        # Запуск production сервера
npm run lint         # ESLint
npm run typecheck    # TypeScript проверка
npm run test         # Property тесты
npm run test:e2e     # E2E тесты (Playwright)
npm run setup:xlsx   # Создание примера XLSX
```

## Использование

### API Key

1. Нажмите кнопку "SET KEY" в правом верхнем углу
2. Введите OpenAI API ключ (начинается с `sk-`)
3. Ключ сохраняется в localStorage браузера

### Меншоны

Используйте формат `@SheetName!CellRange` для ссылок на ячейки:
- Одна ячейка: `@Sheet1!A1`
- Диапазон: `@Sheet1!A1:B5`

Клик на меншон открывает таблицу с выделенным диапазоном.

### Tools

AI ассистент имеет доступ к:
- `getRange` — чтение данных из таблицы
- `updateCell` — обновление ячейки (требует подтверждения)
- `openTable` — открытие таблицы в модальном окне
- `highlightCells` — подсветка ячеек
- `confirmAction` — запрос подтверждения пользователя

## XLSX файл

Пример таблицы находится в `data/example.xlsx`:

**Sheet1** — данные сотрудников:
| Name | Email | Amount | Tax | Total |
|------|-------|--------|-----|-------|
| Alice Johnson | alice@example.com | 1500 | =C2*0.1 | =C2+D2 |
| ... | ... | ... | ... | ... |

**Products** — данные о товарах:
| Product | Category | Price | Quantity | Revenue |
|---------|----------|-------|----------|---------|
| Widget A | Electronics | 29.99 | 150 | =C2*D2 |
| ... | ... | ... | ... | ... |

## License

MIT
