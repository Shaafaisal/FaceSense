import type { AnalysisMode, AnalysisResult, Emotion } from '@/lib/types'
import { getSupabaseAdmin } from './server'

const TRAINING_BUCKET = 'training-images'

export type AnalysisSource = 'mock' | 'flask'

function logPersistError(scope: string, error: unknown) {
  console.error(`[supabase:${scope}]`, error)
}

export async function persistAnalysis(options: {
  result: AnalysisResult
  mode: AnalysisMode
  consent: boolean
  storeForTraining: boolean
  source: AnalysisSource
  image?: File | null
}): Promise<void> {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return

    const { result, consent, storeForTraining, source, image } = options
    const mode: AnalysisMode = options.mode === 'face' || options.mode === 'skin' || options.mode === 'all' ? options.mode : 'all'
    let imagePath: string | null = null

    if (storeForTraining && image instanceof File) {
      const ext = image.type === 'image/png' ? 'png' : 'jpg'
      const path = `${result.id}.${ext}`
      const { error: uploadError } = await supabase.storage.from(TRAINING_BUCKET).upload(path, image, {
        contentType: image.type || 'image/jpeg',
        upsert: true,
      })
      if (uploadError) {
        logPersistError('storage.upload', uploadError)
      } else {
        imagePath = path
      }
    }

    const { error } = await supabase.from('analyses').upsert(
      {
        id: result.id,
        mode,
        consent,
        store_for_training: storeForTraining,
        age_estimate: result.age?.estimate ?? null,
        age_range_low: result.age?.range[0] ?? null,
        age_range_high: result.age?.range[1] ?? null,
        gender_label: result.gender?.label ?? null,
        gender_confidence: result.gender?.confidence ?? null,
        emotion_label: result.emotion?.label ?? null,
        emotion_confidence: result.emotion?.confidence ?? null,
        emotion_probs: result.emotion?.probs ?? null,
        skin: result.skin ?? null,
        bbox: result.face?.bbox ?? null,
        timing: result.timing_ms ?? null,
        image_path: imagePath,
        source,
      },
      { onConflict: 'id' },
    )

    if (error) logPersistError('analyses.upsert', error)
  } catch (error) {
    logPersistError('analyses', error)
  }
}

export async function persistFeedback(options: {
  predictionId: string
  emotionCorrection?: Emotion
  helpful?: boolean
}): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const supabase = getSupabaseAdmin()
    if (!supabase) return { ok: true }

    const row: {
      prediction_id: string
      emotion_correction?: Emotion
      helpful?: boolean
    } = { prediction_id: options.predictionId }

    if (options.emotionCorrection !== undefined) row.emotion_correction = options.emotionCorrection
    if (options.helpful !== undefined) row.helpful = options.helpful

    const { error } = await supabase.from('feedback').upsert(row, { onConflict: 'prediction_id' })
    if (error) {
      logPersistError('feedback.upsert', error)
      return { ok: false, message: 'Could not save feedback.' }
    }
    return { ok: true }
  } catch (error) {
    logPersistError('feedback', error)
    return { ok: false, message: 'Could not save feedback.' }
  }
}

export function isAnalysisResult(value: unknown): value is AnalysisResult {
  if (!value || typeof value !== 'object') return false
  const v = value as Partial<AnalysisResult>
  return typeof v.id === 'string' && typeof v.face === 'object' && v.face !== null
}
