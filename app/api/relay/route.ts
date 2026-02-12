import { NextRequest, NextResponse } from 'next/server';

/**
 * HTTPS Proxy Bridge for Worker Communication
 * 
 * Purpose: Bypass browser "Mixed Content" blocking by providing an HTTPS endpoint
 * that relays requests to the HTTP VPS worker.
 * 
 * Flow:
 * 1. Frontend (HTTPS) -> Vercel API (HTTPS) -> VPS Worker (HTTP)
 * 2. This route accepts POST requests and forwards them to the configured worker URL
 */

const WORKER_URL = process.env.WORKER_URL || 'http://168.231.126.162:8080';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { endpoint, data } = body;

        if (!endpoint || !data) {
            return NextResponse.json(
                { error: 'Missing endpoint or data' },
                { status: 400 }
            );
        }

        // Forward request to VPS worker
        const workerResponse = await fetch(`${WORKER_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        const responseData = await workerResponse.json();

        return NextResponse.json(responseData, {
            status: workerResponse.status,
        });
    } catch (error: any) {
        console.error('Relay error:', error);
        console.error('WORKER_URL:', WORKER_URL);
        console.error('Error details:', {
            message: error.message,
            cause: error.cause,
            stack: error.stack
        });
        return NextResponse.json(
            {
                error: 'Relay failed',
                details: error.message,
                workerUrl: WORKER_URL,
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Enable CORS for frontend requests
export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
