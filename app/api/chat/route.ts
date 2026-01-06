import { streamText, convertToCoreMessages } from 'ai';
import { NextRequest } from 'next/server';
import { createAIClient, SYSTEM_PROMPT } from '@/lib/ai';
import { tools } from '@/lib/tools/definitions';
import { getDatabase } from '@/lib/db';

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'API key is required' } }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();
    const { messages, threadId } = body;

    if (!messages || !Array.isArray(messages)) {
      return new Response(
        JSON.stringify({ error: { code: 'VALIDATION_ERROR', message: 'Messages array is required' } }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const openai = createAIClient(apiKey);

    if (threadId) {
      const db = getDatabase();
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage && lastUserMessage.role === 'user') {
        db.createMessage({
          threadId,
          role: 'user',
          content: lastUserMessage.content,
        });
      }
    }

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: SYSTEM_PROMPT,
      messages: convertToCoreMessages(messages),
      tools,
      maxSteps: 5,
      onFinish: async ({ text, toolCalls, toolResults }) => {
        if (threadId && text) {
          const db = getDatabase();
          db.createMessage({
            threadId,
            role: 'assistant',
            content: text,
            toolCalls: toolCalls?.map(tc => ({
              id: tc.toolCallId,
              name: tc.toolName,
              args: tc.args,
            })),
            toolResults: toolResults?.map(tr => ({
              id: tr.toolCallId,
              name: tr.toolName,
              result: tr.result,
            })),
          });
        }
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('[API] Chat error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const isAuthError = errorMessage.includes('API key') || errorMessage.includes('401');
    
    return new Response(
      JSON.stringify({
        error: {
          code: isAuthError ? 'INVALID_API_KEY' : 'CHAT_ERROR',
          message: isAuthError ? 'Invalid API key' : 'Failed to process chat request',
        },
      }),
      { status: isAuthError ? 401 : 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
