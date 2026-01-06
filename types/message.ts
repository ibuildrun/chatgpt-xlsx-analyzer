export type MessageRole = 'user' | 'assistant' | 'tool';

export interface ToolCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

export interface ToolResultData {
  confirmed?: boolean;
  success?: boolean;
  cells?: Array<Array<{ value: unknown }>>;
  message?: string;
  [key: string]: unknown;
}

export interface ToolResult {
  id: string;
  name: string;
  result: ToolResultData;
}

export interface Message {
  id: string;
  threadId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
  createdAt: Date;
}

export interface CreateMessageInput {
  threadId: string;
  role: MessageRole;
  content: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}

export interface UpdateMessageInput {
  content?: string;
  toolCalls?: ToolCall[];
  toolResults?: ToolResult[];
}
