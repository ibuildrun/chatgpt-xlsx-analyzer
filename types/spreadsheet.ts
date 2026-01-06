export interface CellData {
  value: string | number | null;
  formula?: string;
  address: string;
}

export interface SpreadsheetData {
  sheetName: string;
  cells: Record<string, CellData>;
  rowCount: number;
  colCount: number;
}

export interface CellRange {
  sheet: string;
  startCell: string;
  endCell?: string;
}

export interface ParsedMention {
  raw: string;
  sheet: string;
  startCell: string;
  endCell?: string;
  isRange: boolean;
}
