import { z } from 'zod';
import { tool } from 'ai';

// Tool schemas using Zod for validation
export const confirmActionSchema = z.object({
  question: z.string().describe('The question to ask the user for confirmation'),
  actionType: z.enum(['DELETE', 'UPDATE']).describe('Type of action being confirmed'),
  targetDescription: z.string().optional().describe('Description of what will be affected'),
});

export const openTableSchema = z.object({
  sheetName: z.string().describe('Name of the sheet to open'),
});

export const highlightCellsSchema = z.object({
  sheetName: z.string().describe('Name of the sheet'),
  range: z.string().describe('Cell range to highlight (e.g., A1:B10)'),
});

export const getRangeSchema = z.object({
  sheetName: z.string().describe('Name of the sheet'),
  range: z.string().describe('Cell range to read (e.g., A1:B10)'),
});

export const updateCellSchema = z.object({
  sheetName: z.string().describe('Name of the sheet'),
  cell: z.string().describe('Cell address (e.g., A1)'),
  value: z.string().describe('New value for the cell'),
  confirmed: z.boolean().optional().describe('Whether the action has been confirmed by user'),
});

// Tool definitions for AI SDK
export const tools = {
  confirmAction: tool({
    description: 'Request user confirmation before performing a dangerous action like update or delete',
    parameters: confirmActionSchema,
  }),
  
  openTable: tool({
    description: 'Open the spreadsheet viewer to display data to the user',
    parameters: openTableSchema,
  }),
  
  highlightCells: tool({
    description: 'Highlight specific cells or ranges within the spreadsheet viewer',
    parameters: highlightCellsSchema,
  }),
  
  getRange: tool({
    description: 'Read data from a cell range in the spreadsheet',
    parameters: getRangeSchema,
  }),
  
  updateCell: tool({
    description: 'Update a cell value in the spreadsheet. Requires user confirmation first.',
    parameters: updateCellSchema,
  }),
};

// Type exports for tool arguments
export type ConfirmActionArgs = z.infer<typeof confirmActionSchema>;
export type OpenTableArgs = z.infer<typeof openTableSchema>;
export type HighlightCellsArgs = z.infer<typeof highlightCellsSchema>;
export type GetRangeArgs = z.infer<typeof getRangeSchema>;
export type UpdateCellArgs = z.infer<typeof updateCellSchema>;
