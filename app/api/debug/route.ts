import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to check what data is received
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const contentLength = request.headers.get('content-length');
    
    let body = null;
    let rawBody = '';
    
    try {
      rawBody = await request.text();
      if (rawBody) {
        body = JSON.parse(rawBody);
      }
    } catch (e) {
      // Keep rawBody as is
    }
    
    return NextResponse.json({
      method: request.method,
      url: request.url,
      contentType,
      contentLength,
      rawBodyLength: rawBody.length,
      rawBody: rawBody.substring(0, 500),
      parsedBody: body,
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    return NextResponse.json({
      error: String(error),
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok', message: 'Debug endpoint working' });
}
