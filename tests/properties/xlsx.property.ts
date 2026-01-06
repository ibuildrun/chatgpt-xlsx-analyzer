import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fc from 'fast-check';
import * as XLSX from 'xlsx';
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs';
import { XlsxService } from '@/lib/xlsx';
import { parseRange, parseCellAddress, columnToNumber, numberToColumn } from '@/lib/xlsx/parser';

const TEST_XLSX_PATH = 'data/test-property.xlsx';

// Helper to create test xlsx file
function createTestXlsx() {
  if (!existsSync('data')) {
    mkdirSync('data', { recursive: true });
  }

  const workbook = XLSX.utils.book_new();
  
  const data = [
    ['A', 'B', 'C', 'D', 'E'],
    [1, 2, 3, null, null],
    [4, 5, 6, null, null],
    [7, 8, 9, null, null],
    [10, 11, 12, null, null],
  ];
  
  const worksheet = XLSX.utils.aoa_to_sheet(data);
  
  // Add formulas
  worksheet['D2'] = { t: 'n', f: 'A2+B2+C2' };
  worksheet['D3'] = { t: 'n', f: 'A3+B3+C3' };
  worksheet['E2'] = { t: 'n', f: 'D2*2' };
  
  worksheet['!ref'] = 'A1:E5';
  
  XLSX.utils.book_append_sheet(workbook, worksheet, 'TestSheet');
  
  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  writeFileSync(TEST_XLSX_PATH, buffer);
}

function cleanupTestXlsx() {
  if (existsSync(TEST_XLSX_PATH)) {
    unlinkSync(TEST_XLSX_PATH);
  }
}

describe('XLSX Property Tests', () => {
  let xlsxService: XlsxService;

  beforeAll(() => {
    createTestXlsx();
    xlsxService = new XlsxService(TEST_XLSX_PATH);
  });

  afterAll(() => {
    cleanupTestXlsx();
  });

  // Property 13: XLSX Range Reading
  describe('Property 13: XLSX Range Reading', () => {
    it('should read valid ranges and return correct dimensions', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }), // startCol (A-C)
          fc.integer({ min: 2, max: 5 }), // startRow
          fc.integer({ min: 0, max: 2 }), // colSpan
          fc.integer({ min: 0, max: 2 }), // rowSpan
          (startCol, startRow, colSpan, rowSpan) => {
            const endCol = Math.min(startCol + colSpan, 5);
            const endRow = Math.min(startRow + rowSpan, 5);
            
            const startColLetter = numberToColumn(startCol - 1);
            const endColLetter = numberToColumn(endCol - 1);
            const range = `${startColLetter}${startRow}:${endColLetter}${endRow}`;
            
            const result = xlsxService.getRange('TestSheet', range);
            
            // Check dimensions
            const expectedRows = endRow - startRow + 1;
            const expectedCols = endCol - startCol + 1;
            
            expect(result.length).toBe(expectedRows);
            result.forEach(row => {
              expect(row.length).toBe(expectedCols);
            });
            
            // Each cell should have address property
            result.forEach(row => {
              row.forEach(cell => {
                expect(cell).toHaveProperty('address');
                expect(cell).toHaveProperty('value');
              });
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // Property 14: XLSX Cell Update Round-Trip
  describe('Property 14: XLSX Cell Update Round-Trip', () => {
    it('should persist cell updates correctly', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.integer({ min: -1000, max: 1000 }),
            fc.string({ minLength: 1, maxLength: 20 }).filter(s => !s.includes('\n'))
          ),
          (value) => {
            // Create fresh service for each test
            createTestXlsx();
            const service = new XlsxService(TEST_XLSX_PATH);
            
            // Update cell A2
            service.updateCell('TestSheet', 'A2', value);
            service.saveWorkbook();
            
            // Read back
            const freshService = new XlsxService(TEST_XLSX_PATH);
            const result = freshService.getRange('TestSheet', 'A2:A2');
            
            expect(result[0][0].value).toBe(value);
          }
        ),
        { numRuns: 50 }
      );
    });
  });

  // Property 15: Formula and Value Reading
  describe('Property 15: Formula and Value Reading', () => {
    it('should read cells and return value property', () => {
      // Test that cells can be read and have value property
      const valueCells = ['A1', 'B2', 'C3'];
      
      valueCells.forEach(cell => {
        const result = xlsxService.getRange('TestSheet', `${cell}:${cell}`);
        expect(result[0][0]).toHaveProperty('value');
        expect(result[0][0]).toHaveProperty('address');
      });
    });

    it('should read range and return correct structure', () => {
      const result = xlsxService.getRange('TestSheet', 'A1:C3');
      
      // Should return 3x3 grid
      expect(result.length).toBe(3);
      result.forEach((row: { address: string; value: unknown }[]) => {
        expect(row.length).toBe(3);
        row.forEach((cell: { address: string; value: unknown }) => {
          expect(cell).toHaveProperty('value');
          expect(cell).toHaveProperty('address');
        });
      });
    });
  });
});

describe('Range Parser Property Tests', () => {
  // Property: Column conversion is reversible
  it('column number to letter and back should be identity', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 701 }), // A to ZZ
        (colNum) => {
          const letter = numberToColumn(colNum);
          const backToNum = columnToNumber(letter);
          expect(backToNum).toBe(colNum);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Valid cell addresses are parsed correctly
  it('should parse valid cell addresses', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom('A', 'B', 'C', 'D', 'E'), { minLength: 1, maxLength: 2 }),
        fc.integer({ min: 1, max: 1000 }),
        (col, row) => {
          const address = `${col}${row}`;
          const parsed = parseCellAddress(address);
          
          expect(parsed).not.toBeNull();
          expect(parsed!.col.toUpperCase()).toBe(col.toUpperCase());
          expect(parsed!.row).toBe(row);
        }
      ),
      { numRuns: 100 }
    );
  });

  // Property: Valid ranges are parsed correctly
  it('should parse valid ranges', () => {
    fc.assert(
      fc.property(
        fc.constantFrom('A', 'B', 'C'),
        fc.integer({ min: 1, max: 100 }),
        fc.constantFrom('D', 'E', 'F'),
        fc.integer({ min: 1, max: 100 }),
        (startCol, startRow, endCol, endRow) => {
          const range = `${startCol}${startRow}:${endCol}${endRow}`;
          const parsed = parseRange(range);
          
          expect(parsed).not.toBeNull();
          expect(parsed!.start).toBe(`${startCol}${startRow}`);
          expect(parsed!.end).toBe(`${endCol}${endRow}`);
        }
      ),
      { numRuns: 100 }
    );
  });
});
