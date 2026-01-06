import { NextRequest, NextResponse } from 'next/server';
import { getXlsxService } from '@/lib/xlsx';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sheet = searchParams.get('sheet');
    const range = searchParams.get('range');
    const action = searchParams.get('action');

    const xlsxService = getXlsxService();

    if (action === 'sheets') {
      const sheets = xlsxService.getSheetNames();
      return NextResponse.json({ sheets });
    }

    if (action === 'data' && sheet) {
      const data = xlsxService.getSpreadsheetData(sheet);
      return NextResponse.json({ data });
    }

    if (sheet && range) {
      const cells = xlsxService.getRange(sheet, range);
      return NextResponse.json({ sheet, range, cells });
    }

    if (action === 'formula' && sheet) {
      const cell = searchParams.get('cell');
      if (!cell) {
        return NextResponse.json({ error: 'Cell address required' }, { status: 400 });
      }
      const formula = xlsxService.getCellFormula(sheet, cell);
      return NextResponse.json({ sheet, cell, formula });
    }

    return NextResponse.json(
      { error: 'Invalid request. Provide sheet and range, or action=sheets' },
      { status: 400 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sheet, cell, value, confirmed } = body;

    if (!sheet || !cell || value === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: sheet, cell, value' },
        { status: 400 }
      );
    }

    if (!confirmed) {
      return NextResponse.json({
        requiresConfirmation: true,
        action: 'updateCell',
        details: { sheet, cell, value, message: `Update cell ${cell} in ${sheet} to "${value}"?` },
      });
    }

    const xlsxService = getXlsxService();
    xlsxService.updateCell(sheet, cell, value);
    xlsxService.saveWorkbook();

    return NextResponse.json({ success: true, sheet, cell, value });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
