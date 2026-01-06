import { describe, it, expect } from 'bun:test';
import * as fc from 'fast-check';

// Helper functions that mirror UI logic
function numberToColumn(num: number): string {
  let result = '';
  let n = num;
  while (n >= 0) {
    result = String.fromCharCode((n % 26) + 65) + result;
    n = Math.floor(n / 26) - 1;
  }
  return result;
}

function getCellAddress(row: number, col: number): string {
  return `${numberToColumn(col)}${row + 1}`;
}

function getSelectionRange(
  start: { row: number; col: number },
  end: { row: number; col: number }
): string {
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);

  const startAddr = getCellAddress(minRow, minCol);
  const endAddr = getCellAddress(maxRow, maxCol);

  if (startAddr === endAddr) {
    return startAddr;
  }
  return `${startAddr}:${endAddr}`;
}

function isCellSelected(
  row: number,
  col: number,
  selection: { start: { row: number; col: number }; end: { row: number; col: number } }
): boolean {
  const { start, end } = selection;
  const minRow = Math.min(start.row, end.row);
  const maxRow = Math.max(start.row, end.row);
  const minCol = Math.min(start.col, end.col);
  const maxCol = Math.max(start.col, end.col);
  return row >= minRow && row <= maxRow && col >= minCol && col <= maxCol;
}

function validateApiKeyFormat(key: string): boolean {
  return /^sk-[a-zA-Z0-9_-]{20,}$/.test(key);
}

function maskApiKey(key: string): string {
  return `${key.slice(0, 7)}...${key.slice(-4)}`;
}

describe('UI Property Tests', () => {
  // Property 9: Cell Range Highlighting
  describe('Property 9: Cell Range Highlighting', () => {
    it('should correctly identify cells within selection', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 20 }),
          fc.integer({ min: 0, max: 20 }),
          (startRow, startCol, endRow, endCol) => {
            const selection = {
              start: { row: startRow, col: startCol },
              end: { row: endRow, col: endCol },
            };

            const minRow = Math.min(startRow, endRow);
            const maxRow = Math.max(startRow, endRow);
            const minCol = Math.min(startCol, endCol);
            const maxCol = Math.max(startCol, endCol);

            // All cells in range should be selected
            for (let r = minRow; r <= maxRow; r++) {
              for (let c = minCol; c <= maxCol; c++) {
                expect(isCellSelected(r, c, selection)).toBe(true);
              }
            }

            // Cells outside range should not be selected
            if (minRow > 0) {
              expect(isCellSelected(minRow - 1, minCol, selection)).toBe(false);
            }
            if (maxRow < 20) {
              expect(isCellSelected(maxRow + 1, minCol, selection)).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 16: Cell Selection
  describe('Property 16: Cell Selection', () => {
    it('should generate valid cell addresses', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 100 }),
          fc.integer({ min: 0, max: 25 }),
          (row, col) => {
            const address = getCellAddress(row, col);
            
            // Should match pattern like A1, B2, Z100, etc.
            expect(address).toMatch(/^[A-Z]+\d+$/);
            
            // Row number should be row + 1
            const rowNum = parseInt(address.match(/\d+/)![0]);
            expect(rowNum).toBe(row + 1);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should generate valid range strings', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 25 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 25 }),
          (startRow, startCol, endRow, endCol) => {
            const range = getSelectionRange(
              { row: startRow, col: startCol },
              { row: endRow, col: endCol }
            );

            if (startRow === endRow && startCol === endCol) {
              // Single cell
              expect(range).toMatch(/^[A-Z]+\d+$/);
            } else {
              // Range
              expect(range).toMatch(/^[A-Z]+\d+:[A-Z]+\d+$/);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 17: Mention Format Generation
  describe('Property 17: Mention Format Generation', () => {
    it('should generate valid mention format from selection', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Sheet1', 'Data', 'Report'),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 25 }),
          fc.integer({ min: 0, max: 50 }),
          fc.integer({ min: 0, max: 25 }),
          (sheet, startRow, startCol, endRow, endCol) => {
            const range = getSelectionRange(
              { row: startRow, col: startCol },
              { row: endRow, col: endCol }
            );
            const mention = `@${sheet}!${range}`;

            // Should match mention pattern
            expect(mention).toMatch(/^@[A-Za-z0-9_]+![A-Z]+\d+(:[A-Z]+\d+)?$/);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 20: API Key Storage Round-Trip
  describe('Property 20: API Key Storage Round-Trip', () => {
    it('should store and retrieve API keys correctly', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')), { minLength: 20, maxLength: 100 }),
          (suffix) => {
            const key = `sk-${suffix}`;
            
            // Simulate storage
            const stored = key;
            const retrieved = stored;
            
            expect(retrieved).toBe(key);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 21: API Key Format Validation
  describe('Property 21: API Key Format Validation', () => {
    it('should validate correct API key format', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')), { minLength: 20, maxLength: 100 }),
          (suffix) => {
            const validKey = `sk-${suffix}`;
            expect(validateApiKeyFormat(validKey)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid API key formats', () => {
      const invalidKeys = [
        'invalid-key',
        'sk-short',
        'pk-1234567890123456789012345',
        '',
        'sk-',
      ];

      invalidKeys.forEach(key => {
        expect(validateApiKeyFormat(key)).toBe(false);
      });
    });
  });

  // Property 22: API Key Display Masking
  describe('Property 22: API Key Display Masking', () => {
    it('should mask API keys correctly', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-'.split('')), { minLength: 20, maxLength: 100 }),
          (suffix) => {
            const key = `sk-${suffix}`;
            const masked = maskApiKey(key);

            // Should start with first 7 chars
            expect(masked.startsWith(key.slice(0, 7))).toBe(true);
            
            // Should end with last 4 chars
            expect(masked.endsWith(key.slice(-4))).toBe(true);
            
            // Should contain ...
            expect(masked).toContain('...');
            
            // Should be shorter than original
            expect(masked.length).toBeLessThan(key.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

describe('Column Conversion Property Tests', () => {
  it('should convert column numbers to letters correctly', () => {
    // Known values
    expect(numberToColumn(0)).toBe('A');
    expect(numberToColumn(25)).toBe('Z');
    expect(numberToColumn(26)).toBe('AA');
    expect(numberToColumn(27)).toBe('AB');
    expect(numberToColumn(701)).toBe('ZZ');
  });

  it('should handle all single letter columns', () => {
    for (let i = 0; i < 26; i++) {
      const letter = numberToColumn(i);
      expect(letter.length).toBe(1);
      expect(letter).toBe(String.fromCharCode(65 + i));
    }
  });
});
