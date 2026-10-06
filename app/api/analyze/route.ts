import { NextResponse } from 'next/server'
import { DISCLAIMER, getSkincare, getWellness } from '@/lib/knowledge-base'
import { isAnalysisResult, persistAnalysis } from '@/lib/supabase/persist'
import {
  ACCEPTED_TYPES,
  EMOTIONS,
  MAX_FILE_BYTES,
  type AnalysisMode,
  type AnalysisResult,
  type ApiErrorCode,
  type Emotion,
  type SkinFinding,
} from '@/lib/types'

/**
 * Mock of the Flask `POST /api/analyze` contract from the PRD.
 * Set FLASK_API_URL to proxy requests to the real model service instead.
 * Successful results are persisted to Supabase (metadata only; photos only if store_for_training).
 */
function fail(code: ApiErrorCode, message: string, status = 400) {
  return NextResponse.json({ error: { code, message } }, { status })
}

function seededRandom(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

const round = (n: number) => Math.round(n * 100) / 100

function analysisContext(form: FormData) {
  const mode = ((form.get('mode') as AnalysisMode) || 'all') as AnalysisMode
  const image = form.get('image')
  return {
    mode,
    consent: form.get('consent') === 'true',
    storeForTraining: form.get('store_for_training') === 'true',
    image: image instanceof File ? image : null,
  }
}

export async function POST(request: Request) {
  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail('BAD_FILE', 'Could not read the upload. Please try again.')
  }

  const ctx = analysisContext(form)
  const flaskUrl = process.env.FLASK_API_URL
  if (flaskUrl) {
    const res = await fetch(`${flaskUrl}/api/analyze`, { method: 'POST', body: form })
    const data = await res.json()
    if (res.ok && isAnalysisResult(data)) {
      await persistAnalysis({
        result: data,
        mode: ctx.mode,
        consent: ctx.consent,
        storeForTraining: ctx.storeForTraining,
        source: 'flask',
        image: ctx.image,
      })
    }
    return NextResponse.json(data, { status: res.status })
  }

  if (form.get('consent') !== 'true') {
    return fail('NO_CONSENT', 'Consent is required before analysis.', 403)
  }

  const image = form.get('image')
  const mode = (form.get('mode') as AnalysisMode) ?? 'all'
  if (!(image instanceof File)) return fail('BAD_FILE', 'No image was attached.')
  if (!ACCEPTED_TYPES.includes(image.type)) return fail('BAD_FILE', 'Only JPG and PNG images are supported.')
  if (image.size > MAX_FILE_BYTES) return fail('BAD_FILE', 'Image is larger than 5 MB.')

  const started = performance.now()
  const bytes = new Uint8Array(await image.arrayBuffer())
  let seed = bytes.length
  for (let i = 0; i < bytes.length; i += 997) seed = (seed * 31 + bytes[i]) | 0
  const rand = seededRandom(seed)

  // Image bytes are only held in memory for this request unless store_for_training is true.
  const detect = 14 + Math.round(rand() * 10)
  const model = 52 + Math.round(rand() * 30)
  await new Promise((r) => setTimeout(r, 600))

  const result: AnalysisResult = {
    id: crypto.randomUUID(),
    face: { bbox: [0.22, 0.14, 0.56, 0.68], quality: 'ok' },
    recommendations: { wellness: [], skincare: [], disclaimer: DISCLAIMER },
    timing_ms: { detect, model, total: 0 },
  }

  if (mode !== 'skin') {
    const age = 18 + rand() * 22
    result.age = { estimate: round(age), range: [Math.floor(age - 4), Math.ceil(age + 4)] }
    result.gender = { label: rand() > 0.5 ? 'male' : 'female', confidence: round(0.82 + rand() * 0.16) }

    const raw = EMOTIONS.map((e) => (e === 'neutral' || e === 'happy' ? 1.6 : 0.4) * rand() + 0.05)
    const dominant = Math.floor(rand() * EMOTIONS.length)
    raw[dominant] += 1.2
    const total = raw.reduce((a, b) => a + b, 0)
    const probs = Object.fromEntries(EMOTIONS.map((e, i) => [e, round(raw[i] / total)])) as Record<Emotion, number>
    const label = EMOTIONS.reduce((best, e) => (probs[e] > probs[best] ? e : best), EMOTIONS[0])
    result.emotion = { label, confidence: probs[label], probs }
    result.recommendations.wellness = getWellness(label).map((r) => r.body)
  }

  if (mode !== 'face') {
    const severities = ['mild', 'moderate', 'severe'] as const
    const types = ['oily', 'dry', 'normal'] as const
    const skin: SkinFinding[] = [
      {
        condition: 'acne',
        present: rand() > 0.4,
        severity: severities[Math.floor(rand() * 2.4)],
        confidence: round(0.62 + rand() * 0.3),
      },
      { condition: 'skin_type', type: types[Math.floor(rand() * 3)], confidence: round(0.5 + rand() * 0.35) },
      { condition: 'dark_circles', present: rand() > 0.5, confidence: round(0.55 + rand() * 0.38) },
    ]
    if (!skin[0].present) delete skin[0].severity
    result.skin = skin
    const plan = getSkincare(skin)
    result.recommendations.skincare = [...plan.morning, ...plan.evening].map((s) => `${s.step}: ${s.detail}`)
  }

  result.timing_ms.total = detect + model + (Math.round(performance.now() - started) % 20) + 8

  await persistAnalysis({
    result,
    mode,
    consent: true,
    storeForTraining: ctx.storeForTraining,
    source: 'mock',
    image,
  })

  return NextResponse.json(result)
}
