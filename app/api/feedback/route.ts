import { NextResponse } from 'next/server'
import { persistFeedback } from '@/lib/supabase/persist'
import { EMOTIONS, type Emotion } from '@/lib/types'

/**
 * `POST /api/feedback` stores prediction-level records (never images).
 * Set FLASK_API_URL to also proxy to the model service.
 */
export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  if (!body || typeof body.predictionId !== 'string') {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'predictionId is required.' } }, { status: 400 })
  }
  if (body.helpful !== undefined && typeof body.helpful !== 'boolean') {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'helpful must be a boolean.' } }, { status: 400 })
  }
  if (body.emotionCorrection !== undefined && !EMOTIONS.includes(body.emotionCorrection)) {
    return NextResponse.json({ error: { code: 'BAD_REQUEST', message: 'Unknown emotion.' } }, { status: 400 })
  }

  const flaskUrl = process.env.FLASK_API_URL
  if (flaskUrl) {
    const res = await fetch(`${flaskUrl}/api/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    if (res.ok) {
      const saved = await persistFeedback({
        predictionId: body.predictionId,
        emotionCorrection: body.emotionCorrection as Emotion | undefined,
        helpful: body.helpful,
      })
      if (!saved.ok) {
        return NextResponse.json({ error: { code: 'PERSIST_FAILED', message: saved.message } }, { status: 500 })
      }
    }
    return NextResponse.json(data, { status: res.status })
  }

  const saved = await persistFeedback({
    predictionId: body.predictionId,
    emotionCorrection: body.emotionCorrection as Emotion | undefined,
    helpful: body.helpful,
  })
  if (!saved.ok) {
    return NextResponse.json({ error: { code: 'PERSIST_FAILED', message: saved.message } }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
