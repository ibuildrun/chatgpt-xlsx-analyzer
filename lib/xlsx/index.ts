import * as XLSX from 'xlsx';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { CellData, SpreadsheetData } from '@/types';
import { parseRange, parseCellAddress, columnToNumber, numberToColumn } from './parser';

const DEFAULT_XLSX_PATH = 'data/example.xlsx';

export class XlsxService {
  private workbook: XLSX.WorkBook | null = null;
  private filePath: string;

  constructor(filePath: string = DEFAULT_XLSX_PATH) {
    this.filePath = filePath;
  }

  loadWorkbook(): void {
    if (!existsSync(this.filePath)) {
      throw new Error(`XLSX file not found: ${this.filePath}`);
    }
    const buffer = readFileSync(this.filePath);
    this.workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: true });
  }

  getSheetNames(): string[] {
    if (!this.workbook) {
      this.loadWorkbook();
    }
    return this.workbook!.SheetNames;
  }

  getRange(sheetName: string, range: string): CellData[][] {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook!.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const parsed = parseRange(range);
    if (!parsed) {
      throw new Error(`Invalid range: ${range}`);
    }

    const start = parseCellAddress(parsed.start);
    const end = parseCellAddress(parsed.end);
    if (!start || !end) {
      throw new Error(`Invalid cell addresses in range: ${range}`);
    }

    const startCol = columnToNumber(start.col);
    const endCol = columnToNumber(end.col);
    const startRow = start.row;
    const endRow = end.row;

    const result: CellData[][] = [];

    for (let row = startRow; row <= endRow; row++) {
      const rowData: CellData[] = [];
      for (let col = startCol; col <= endCol; col++) {
        const address = `${numberToColumn(col)}${row}`;
        const cell = sheet[address];
        
        rowData.push({
          address,
          value: cell ? (cell.v ?? null) : null,
          formula: cell?.f,
        });
      }
      result.push(rowData);
    }

    return result;
  }

  getSpreadsheetData(sheetName: string): SpreadsheetData {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook!.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const ref = sheet['!ref'];
    if (!ref) {
      return { sheetName, cells: {}, rowCount: 0, colCount: 0 };
    }

    const range = XLSX.utils.decode_range(ref);
    const cells: Record<string, CellData> = {};

    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const address = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = sheet[address];
        
        if (cell) {
          cells[address] = {
            address,
            value: cell.v ?? null,
            formula: cell.f,
          };
        }
      }
    }

    return {
      sheetName,
      cells,
      rowCount: range.e.r - range.s.r + 1,
      colCount: range.e.c - range.s.c + 1,
    };
  }

  updateCell(sheetName: string, cellAddress: string, value: string | number): void {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook!.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const parsed = parseCellAddress(cellAddress);
    if (!parsed) {
      throw new Error(`Invalid cell address: ${cellAddress}`);
    }

    // Update the cell
    const cell: XLSX.CellObject = {
      t: typeof value === 'number' ? 'n' : 's',
      v: value,
    };
    sheet[cellAddress.toUpperCase()] = cell;

    // Update sheet range if necessary
    const ref = sheet['!ref'];
    if (ref) {
      const range = XLSX.utils.decode_range(ref);
      const col = columnToNumber(parsed.col);
      const row = parsed.row - 1;
      
      if (col > range.e.c) range.e.c = col;
      if (row > range.e.r) range.e.r = row;
      if (col < range.s.c) range.s.c = col;
      if (row < range.s.r) range.s.r = row;
      
      sheet['!ref'] = XLSX.utils.encode_range(range);
    }
  }

  getCellFormula(sheetName: string, cellAddress: string): string | null {
    if (!this.workbook) {
      this.loadWorkbook();
    }

    const sheet = this.workbook!.Sheets[sheetName];
    if (!sheet) {
      throw new Error(`Sheet not found: ${sheetName}`);
    }

    const cell = sheet[cellAddress.toUpperCase()];
    return cell?.f ?? null;
  }

  saveWorkbook(): void {
    if (!this.workbook) {
      throw new Error('No workbook loaded');
    }
    const buffer = XLSX.write(this.workbook, { type: 'buffer', bookType: 'xlsx' });
    writeFileSync(this.filePath, buffer);
  }
}

// Singleton instance
let xlsxInstance: XlsxService | null = null;

export function getXlsxService(): XlsxService {
  if (!xlsxInstance) {
    xlsxInstance = new XlsxService();
  }
  return xlsxInstance;
}
