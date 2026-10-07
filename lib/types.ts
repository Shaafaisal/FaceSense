export const EMOTIONS = ['happy', 'sad', 'angry', 'surprise', 'fear', 'disgust', 'neutral'] as const
export type Emotion = (typeof EMOTIONS)[number]

export type AnalysisMode = 'face' | 'skin' | 'all'

export type SkinCondition = 'acne' | 'skin_type' | 'dark_circles'
export type Severity = 'mild' | 'moderate' | 'severe'
export type SkinType = 'oily' | 'dry' | 'normal'

export interface SkinFinding {
  condition: SkinCondition
  present?: boolean
  severity?: Severity
  type?: SkinType
  confidence: number
  evidence?: string
}

export interface AnalysisResult {
  id: string
  face: { bbox: [number, number, number, number]; quality: 'ok'; warning?: string }
  age?: { estimate: number; range: [number, number] }
  gender?: { label: 'male' | 'female'; confidence: number }
  emotion?: { label: Emotion; confidence: number; probs: Record<Emotion, number>; cues?: string }
  skin?: SkinFinding[]
  recommendations: { wellness: string[]; skincare: string[]; disclaimer: string }
  timing_ms: { detect: number; model: number; total: number }
}

export type ApiErrorCode = 'NO_FACE' | 'MULTIPLE_FACES' | 'LOW_QUALITY' | 'NO_CONSENT' | 'BAD_FILE'

export interface ApiError {
  error: { code: ApiErrorCode; message: string }
}

export const EMOTION_CONFIDENCE_THRESHOLD = 0.4
export const SKIN_CONFIDENCE_THRESHOLD = 0.6
export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
