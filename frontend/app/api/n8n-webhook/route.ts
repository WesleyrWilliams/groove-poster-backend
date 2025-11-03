import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Forward the request to backend API
    const backendUrl = process.env.BACKEND_URL || 
                      'http://localhost:3001'
    
    // Determine endpoint based on request
    let endpoint = '/api/process-video';
    if (body.channelId) {
      endpoint = '/api/process-channel';
    }
    
    const response = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error || `Backend returned ${response.status}`)
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    console.error('API error:', error)
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

