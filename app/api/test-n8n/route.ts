import { NextRequest, NextResponse } from 'next/server'

async function triggerN8nTest(payload: any) {
  const isProd = process.env.NODE_ENV === 'production'
  const testUrl = process.env.N8N_WEBHOOK_TEST_URL
  const prodUrl = process.env.N8N_WEBHOOK_URL
  const n8nWebhookUrl = isProd ? prodUrl : (testUrl || prodUrl)

  if (!n8nWebhookUrl) {
    return { ok: false, error: 'N8N_WEBHOOK_URL not configured' }
  }

  const body = { event: 'test_ping', data: payload }
  let response: Response | undefined
  let triedGet = false

  try {
    response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  } catch {}

  if (!response || response.status === 404 || response.status === 405) {
    triedGet = true
    const url = new URL(n8nWebhookUrl)
    url.searchParams.set('event', 'test_ping')
    url.searchParams.set('env', process.env.NODE_ENV || 'development')
    try { url.searchParams.set('payload', encodeURIComponent(JSON.stringify(body))) } catch {}
    response = await fetch(url.toString(), { method: 'GET' })
  }

  if (!response.ok) {
    return { ok: false, status: response.status, statusText: response.statusText, triedGet }
  }
  if (response.status === 204) return { ok: true, triedGet }
  const text = await response.text()
  try { return { ok: true, triedGet, body: JSON.parse(text) } } catch { return { ok: true, triedGet, body: text } }
}

export async function GET(_req: NextRequest) {
  const result = await triggerN8nTest({ timestamp: new Date().toISOString() })
  const status = result.ok ? 200 : 502
  return NextResponse.json(result, { status })
}

export async function POST(request: NextRequest) {
  let json: any = {}
  try { json = await request.json() } catch {}
  const result = await triggerN8nTest({ timestamp: new Date().toISOString(), ...json })
  const status = result.ok ? 200 : 502
  return NextResponse.json(result, { status })
}


