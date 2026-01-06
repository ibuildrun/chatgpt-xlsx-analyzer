import type { CellRange } from '@/types';

/**
 * Parse a cell address like "A1" into column and row
 */
export function parseCellAddress(cell: string): { col: string; row: number } | null {
  const match = cell.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  return {
    col: match[1].toUpperCase(),
    row: parseInt(match[2], 10),
  };
}

/**
 * Parse a range string like "A1:B10" into start and end cells
 */
export function parseRange(range: string): { start: string; end: string } | null {
  const parts = range.split(':');
  if (parts.length === 1) {
    // Single cell
    return { start: parts[0].toUpperCase(), end: parts[0].toUpperCase() };
  }
  if (parts.length === 2) {
    return { start: parts[0].toUpperCase(), end: parts[1].toUpperCase() };
  }
  return null;
}

/**
 * Convert column letter to number (A=0, B=1, ..., Z=25, AA=26, etc.)
 */
export function columnToNumber(col: string): number {
  let result = 0;
  for (let i = 0; i < col.length; i++) {
    result = result * 26 + (col.charCodeAt(i) - 64);
  }
  return result - 1;
}

/**
 * Convert column number to letter (0=A, 1=B, ..., 25=Z, 26=AA, etc.)
 */
export function numberToColumn(num: number): string {
  let result = '';
  num++;
  while (num > 0) {
    num--;
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}

/**
 * Get all cell addresses in a range
 */
export function getCellsInRange(range: string): string[] {
  const parsed = parseRange(range);
  if (!parsed) return [];

  const start = parseCellAddress(parsed.start);
  const end = parseCellAddress(parsed.end);
  if (!start || !end) return [];

  const startCol = columnToNumber(start.col);
  const endCol = columnToNumber(end.col);
  const startRow = start.row;
  const endRow = end.row;

  const cells: string[] = [];
  for (let row = startRow; row <= endRow; row++) {
    for (let col = startCol; col <= endCol; col++) {
      cells.push(`${numberToColumn(col)}${row}`);
    }
  }
  return cells;
}

/**
 * Parse a mention string like "@Sheet1!A1:B3"
 */
export function parseMention(mention: string): CellRange | null {
  const match = mention.match(/^@([\w\d]+)!([A-Z]+\d+)(?::([A-Z]+\d+))?$/i);
  if (!match) return null;
  
  return {
    sheet: match[1],
    startCell: match[2].toUpperCase(),
    endCell: match[3]?.toUpperCase(),
  };
}

/**
 * Format a cell range as a mention string
 */
export function formatMention(range: CellRange): string {
  if (range.endCell && range.endCell !== range.startCell) {
    return `@${range.sheet}!${range.startCell}:${range.endCell}`;
  }
  return `@${range.sheet}!${range.startCell}`;
}
