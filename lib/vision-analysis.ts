import 'server-only'
import { generateText, Output } from 'ai'
import { z } from 'zod'
import { EMOTIONS, type AnalysisMode, type Emotion, type SkinFinding } from './types'

export const VISION_MODEL = 'google/gemini-3.8-flash'

const unit = z.number().min(0).max(1)

const analysisSchema = z.object({
  face_count: z.number().int().min(0).describe('Number of clearly visible human faces in the image.'),
  face_box: z
    .object({ x: unit, y: unit, width: unit, height: unit })
    .describe('Bounding box of the main face, normalized 0-1 relative to full image width/height. x,y is the top-left corner.'),
  image_issue: z
    .string()
    .describe('Empty string if the face is clearly visible. Otherwise a short note (e.g. "heavy filter", "face partly covered", "very blurry").'),
  age: z.object({
    estimate: z.number().min(1).max(100),
    low: z.number().min(1).max(100),
    high: z.number().min(1).max(100),
  }),
  gender: z.object({
    label: z.enum(['male', 'female']),
    confidence: unit,
  }),
  emotion: z.object({
    cues: z
      .string()
      .describe('Describe the visible facial action units first: mouth corners, teeth, cheeks, eyes, brows, nose. One or two sentences.'),
    probs: z.object(Object.fromEntries(EMOTIONS.map((e) => [e, unit])) as Record<Emotion, typeof unit>),
  }),
  skin: z.object({
    acne: z.object({
      evidence: z.string().describe('What you see on the skin that supports the decision.'),
      present: z.boolean(),
      severity: z.enum(['none', 'mild', 'moderate', 'severe']),
      confidence: unit,
    }),
    skin_type: z.object({
      evidence: z.string().describe('Shine, pores, flakiness or texture you observe, and where.'),
      type: z.enum(['oily', 'dry', 'normal']),
      confidence: unit,
    }),
    dark_circles: z.object({
      evidence: z.string().describe('How the under-eye area compares to the surrounding cheek skin.'),
      present: z.boolean(),
      confidence: unit,
    }),
  }),
})

export type VisionAnalysis = z.infer<typeof analysisSchema>

const INSTRUCTIONS = `You are FaceSense, a careful facial-appearance analysis system used for a wellness and skincare app.
Judge ONLY from what is visibly present in the photo. Observe first, then decide. Never guess randomly.

EMOTION (facial expression, 7 classes: happy, sad, angry, surprise, fear, disgust, neutral)
- First describe the visible cues, then give a probability for each class. Probabilities must sum to 1.
- happy: lip corners pulled up (smile), with or without teeth, cheeks raised, crow's feet / squinted lower eyelids. Any genuine or social smile means happy should be clearly dominant.
- disgust: nose wrinkled AND upper lip raised, often with lowered brows. Do NOT label a smile as disgust. Squinting from a big smile is happiness, not disgust.
- sad: inner brows raised, lip corners pulled down. angry: brows lowered and drawn together, lips pressed or tense, glaring eyes.
- surprise: brows raised high, eyes wide, jaw dropped. fear: brows raised and pulled together, eyes wide, lips stretched.
- neutral: relaxed face with no clear action units.

AGE AND GENDER
- Estimate apparent age from skin texture, facial structure and features; give a realistic range (about +/- 3 to 5 years).
- Gender is apparent presentation (male/female) with a calibrated confidence.

SKIN (be conservative and evidence based; lighting, flash, makeup and filters can mislead you)
- skin_type:
  - oily: visible shine / specular highlights on forehead, nose, chin or cheeks (T-zone), greasy look, enlarged pores. Shine across the T-zone is the strongest sign of oily skin.
  - dry: dull matte look, flakiness, rough or tight-looking texture, visible fine dry lines.
  - normal: balanced, even texture, neither noticeably shiny nor flaky.
- acne: present ONLY if active lesions are visible (red or inflamed bumps, papules, pustules, whiteheads, blackheads, cysts). Freckles, moles, birthmarks, light texture or faint old marks are NOT acne. If the skin looks clear, present=false and severity="none".
  - mild: a few small lesions. moderate: many lesions or several inflamed ones. severe: widespread inflamed lesions, nodules or cysts.
- dark_circles: present ONLY if the under-eye skin is clearly darker (brown, blue or purple pigmentation) or noticeably hollow compared to the cheek skin right below it. Normal soft shadows from overhead lighting or the natural eye socket are NOT dark circles. When the under-eye area looks similar in tone to the cheeks, present=false.

CONFIDENCE
- Use calibrated values between 0 and 1. Use high confidence (0.8+) when evidence is clear, and lower it when resolution, angle, makeup, filters or lighting make the judgment uncertain.
- Lower confidence is better than a wrong confident answer.

If there is no human face, set face_count to 0 and fill the remaining fields with your best neutral defaults.`

export async function runVisionAnalysis(image: Uint8Array, mediaType: string, mode: AnalysisMode) {
  const focus =
    mode === 'face'
      ? 'Focus on age, gender and facial expression. Still fill the skin fields.'
      : mode === 'skin'
        ? 'Focus on the skin assessment. Still fill the face fields.'
        : 'Give a complete assessment of face and skin.'

  const { output } = await generateText({
    model: VISION_MODEL,
    instructions: INSTRUCTIONS,
    output: Output.object({ schema: analysisSchema }),
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: `Analyze the face in this photo. ${focus}` },
          { type: 'file', mediaType, data: image },
        ],
      },
    ],
  })

  return output
}

const round = (n: number) => Math.round(n * 100) / 100

export function toEmotionResult(v: VisionAnalysis['emotion']) {
  const total = EMOTIONS.reduce((sum, e) => sum + v.probs[e], 0) || 1
  const probs = Object.fromEntries(EMOTIONS.map((e) => [e, round(v.probs[e] / total)])) as Record<Emotion, number>
  const label = EMOTIONS.reduce((best, e) => (probs[e] > probs[best] ? e : best), EMOTIONS[0])
  return { label, confidence: probs[label], probs, cues: v.cues }
}

export function toSkinFindings(s: VisionAnalysis['skin']): SkinFinding[] {
  const acnePresent = s.acne.present && s.acne.severity !== 'none'
  const acne: SkinFinding = {
    condition: 'acne',
    present: acnePresent,
    confidence: round(s.acne.confidence),
    evidence: s.acne.evidence,
  }
  if (acnePresent && s.acne.severity !== 'none') acne.severity = s.acne.severity

  return [
    acne,
    { condition: 'skin_type', type: s.skin_type.type, confidence: round(s.skin_type.confidence), evidence: s.skin_type.evidence },
    {
      condition: 'dark_circles',
      present: s.dark_circles.present,
      confidence: round(s.dark_circles.confidence),
      evidence: s.dark_circles.evidence,
    },
  ]
}

export function toAgeResult(a: VisionAnalysis['age']) {
  const low = Math.round(Math.min(a.low, a.estimate))
  const high = Math.round(Math.max(a.high, a.estimate))
  return { estimate: round(a.estimate), range: [low, high] as [number, number] }
}

export function toFaceBox(b: VisionAnalysis['face_box']): [number, number, number, number] {
  const x = Math.min(Math.max(b.x, 0), 1)
  const y = Math.min(Math.max(b.y, 0), 1)
  return [round(x), round(y), round(Math.min(b.width, 1 - x)), round(Math.min(b.height, 1 - y))]
}
