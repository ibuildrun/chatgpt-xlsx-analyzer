import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import {
  parseMention,
  extractMentions,
  formatMention,
  hasMentions,
  replaceMentions,
} from '@/lib/mentions';

describe('Mention Parser Property Tests', () => {
  // Property 18: Mention Rendering and Interaction
  describe('Property 18: Mention Rendering and Interaction', () => {
    it('should correctly identify text with mentions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Sheet1', 'Data', 'Sales_2024'),
          fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D'), { minLength: 1, maxLength: 2 }),
          fc.integer({ min: 1, max: 1000 }),
          (sheet, col, row) => {
            const mention = `@${sheet}!${col}${row}`;
            const text = `Check this cell: ${mention} for details`;
            
            expect(hasMentions(text)).toBe(true);
            expect(hasMentions('No mentions here')).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should extract all mentions from text', () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              sheet: fc.constantFrom('Sheet1', 'Data', 'Report'),
              col: fc.constantFrom('A', 'B', 'C'),
              row: fc.integer({ min: 1, max: 100 }),
            }),
            { minLength: 1, maxLength: 5 }
          ),
          (mentions) => {
            const mentionStrings = mentions.map(m => `@${m.sheet}!${m.col}${m.row}`);
            const text = `Here are cells: ${mentionStrings.join(' and ')}`;
            
            const extracted = extractMentions(text);
            expect(extracted.length).toBe(mentions.length);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 19: Mention Parsing
  describe('Property 19: Mention Parsing', () => {
    it('should parse valid single cell mentions', () => {
      fc.assert(
        fc.property(
          fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D', 'E'), { minLength: 1, maxLength: 3 }).filter(s => /^[A-E]+$/.test(s)),
          fc.integer({ min: 1, max: 9999 }),
          (col, row) => {
            const mention = `@Sheet1!${col}${row}`;
            const parsed = parseMention(mention);
            
            expect(parsed).not.toBeNull();
            expect(parsed!.sheet).toBe('Sheet1');
            expect(parsed!.startCell).toBe(`${col.toUpperCase()}${row}`);
            expect(parsed!.isRange).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should parse valid range mentions', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('A', 'B', 'C'),
          fc.integer({ min: 1, max: 100 }),
          fc.constantFrom('D', 'E', 'F'),
          fc.integer({ min: 1, max: 100 }),
          (startCol, startRow, endCol, endRow) => {
            const mention = `@Sheet1!${startCol}${startRow}:${endCol}${endRow}`;
            const parsed = parseMention(mention);
            
            expect(parsed).not.toBeNull();
            expect(parsed!.sheet).toBe('Sheet1');
            expect(parsed!.startCell).toBe(`${startCol}${startRow}`);
            expect(parsed!.endCell).toBe(`${endCol}${endRow}`);
            expect(parsed!.isRange).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null for invalid mentions', () => {
      const invalidMentions = [
        '@!A1', // Missing sheet name
        '@Sheet1!', // Missing cell
        '@Sheet1!1A', // Invalid cell format (number before letter)
        '@Sheet1!A', // Missing row number
        '@Sheet1!123', // Missing column letter
      ];
      
      invalidMentions.forEach(mention => {
        expect(parseMention(mention)).toBeNull();
      });
    });
  });

  // Property: Format mention round-trip
  describe('Format Mention Round-Trip', () => {
    it('should format and parse mentions consistently', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('Sheet1', 'Data', 'Report'),
          fc.constantFrom('A', 'B', 'C'),
          fc.integer({ min: 1, max: 100 }),
          fc.option(
            fc.record({
              col: fc.constantFrom('D', 'E', 'F'),
              row: fc.integer({ min: 1, max: 100 }),
            })
          ),
          (sheet, startCol, startRow, endOpt) => {
            const startCell = `${startCol}${startRow}`;
            const endCell = endOpt ? `${endOpt.col}${endOpt.row}` : undefined;
            
            const formatted = formatMention(sheet, startCell, endCell);
            const parsed = parseMention(formatted);
            
            expect(parsed).not.toBeNull();
            expect(parsed!.sheet).toBe(sheet);
            expect(parsed!.startCell).toBe(startCell);
            if (endCell) {
              expect(parsed!.endCell).toBe(endCell);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property: Replace mentions preserves non-mention text
  describe('Replace Mentions', () => {
    it('should preserve non-mention text', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 50 }).filter(s => !s.includes('@')),
          (text) => {
            const result = replaceMentions(text, () => '[REPLACED]');
            expect(result).toBe(text);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should replace all mentions', () => {
      const text = 'Check @Sheet1!A1 and @Sheet1!B2:C3 for data';
      const result = replaceMentions(text, (mention) => `[${mention.sheet}]`);
      
      expect(result).toBe('Check [Sheet1] and [Sheet1] for data');
    });
  });
});
