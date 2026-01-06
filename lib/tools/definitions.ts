import { tool } from 'ai';
import { z } from 'zod';

// Tool definitions using AI SDK's tool() helper
export const tools = {
  confirmAction: tool({
    description: 'Request user confirmation before performing a dangerous action like update or delete',
    parameters: z.object({
      question: z.string().describe('The question to ask the user for confirmation'),
      actionType: z.enum(['DELETE', 'UPDATE']).describe('Type of action being confirmed'),
      targetDescription: z.string().optional().describe('Description of what will be affected'),
    }),
  }),
  
  openTable: tool({
    description: 'Open the spreadsheet viewer to display data to the user',
    parameters: z.object({
      sheetName: z.string().describe('Name of the sheet to open'),
    }),
  }),
  
  highlightCells: tool({
    description: 'Highlight specific cells or ranges within the spreadsheet viewer',
    parameters: z.object({
      sheetName: z.string().describe('Name of the sheet'),
      range: z.string().describe('Cell range to highlight (e.g., A1:B10)'),
    }),
  }),
  
  getRange: tool({
    description: 'Read data from a cell range in the spreadsheet',
    parameters: z.object({
      sheetName: z.string().describe('Name of the sheet'),
      range: z.string().describe('Cell range to read (e.g., A1:B10)'),
    }),
  }),
  
  updateCell: tool({
    description: 'Update a cell value in the spreadsheet. Requires user confirmation first.',
    parameters: z.object({
      sheetName: z.string().describe('Name of the sheet'),
      cell: z.string().describe('Cell address (e.g., A1)'),
      value: z.string().describe('New value for the cell'),
      confirmed: z.boolean().optional().describe('Whether the action has been confirmed by user'),
    }),
  }),
};

// Type exports for tool arguments
export type ConfirmActionArgs = z.infer<typeof tools.confirmAction.parameters>;
export type OpenTableArgs = z.infer<typeof tools.openTable.parameters>;
export type HighlightCellsArgs = z.infer<typeof tools.highlightCells.parameters>;
export type GetRangeArgs = z.infer<typeof tools.getRange.parameters>;
export type UpdateCellArgs = z.infer<typeof tools.updateCell.parameters>;
