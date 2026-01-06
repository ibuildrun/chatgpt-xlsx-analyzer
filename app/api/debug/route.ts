import { NextRequest, NextResponse } from 'next/server';

// GET /api/debug - Simple health check
export async function GET() {
  return NextResponse.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'Debug endpoint is working'
  });
}

// POST /api/debug - Echo back the request for debugging
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type');
    const contentLength = request.headers.get('content-length');
    
    let body = null;
    let bodyText = '';
    let parseError = null;
    
    try {
      bodyText = await request.text();
      if (bodyText) {
        body = JSON.parse(bodyText);
      }
    } catch (e) {
      parseError = String(e);
    }
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      request: {
        method: request.method,
        url: request.url,
        contentType,
        contentLength,
        bodyText,
        bodyTextLength: bodyText.length,
        parsedBody: body,
        parseError,
        headers: Object.fromEntries(request.headers.entries())
      }
    });
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      error: String(error)
    }, { status: 500 });
  }
}
