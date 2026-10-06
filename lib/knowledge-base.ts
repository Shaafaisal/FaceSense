import type { Emotion, SkinFinding } from './types'
import { SKIN_CONFIDENCE_THRESHOLD } from './types'

export interface Recommendation {
  title: string
  body: string
  rule: string
}

const WELLNESS: Record<Emotion, Omit<Recommendation, 'rule'>[]> = {
  happy: [
    { title: 'Note what went well', body: 'Write down one thing that lifted your mood today so you can come back to it later.' },
    { title: 'Share it', body: 'Send a quick message to someone you care about. Positive moments grow when shared.' },
    { title: 'Move a little', body: 'Use the energy for a 10-minute walk or light stretch.' },
    { title: 'Stay hydrated', body: 'Keep a glass of water nearby, especially if you are busy and on the go.' },
    { title: 'Protect your sleep', body: 'Keep a consistent bedtime tonight so tomorrow starts just as well.' },
  ],
  sad: [
    { title: 'Box breathing', body: 'Breathe in for 4, hold for 4, out for 4, hold for 4. Repeat for two minutes.' },
    { title: 'Step outside', body: 'A short walk in daylight can help you feel more grounded.' },
    { title: 'Reach out', body: 'Talk to someone you trust, even briefly. You do not have to explain everything.' },
    { title: 'Gentle music', body: 'Put on a calm playlist you enjoy while you take a short break.' },
    { title: 'Rest without guilt', body: 'Aim for regular sleep and give yourself permission to slow down today.' },
  ],
  angry: [
    { title: 'Pause before responding', body: 'Take 10 slow breaths before replying to a message or conversation.' },
    { title: 'Burn it off', body: 'A brisk 10-minute walk or some stairs can release tension.' },
    { title: 'Write it out', body: 'Jot down what is bothering you, then put the note away for an hour.' },
    { title: 'Cool down', body: 'Splash cool water on your face and drink a glass of water.' },
    { title: 'Talk it through', body: 'When ready, speak to someone you trust about what happened.' },
  ],
  surprise: [
    { title: 'Take a moment', body: 'Sit for a minute and let the moment settle before acting.' },
    { title: 'Ground yourself', body: 'Name five things you can see and four you can hear.' },
    { title: 'Hydrate', body: 'Drink a glass of water and take a few deep breaths.' },
    { title: 'Capture it', body: 'If it was good news, note it down. If not, list one next step.' },
    { title: 'Short break', body: 'Step away from screens for five minutes.' },
  ],
  fear: [
    { title: '4-7-8 breathing', body: 'Breathe in for 4, hold for 7, out for 8. Repeat four times.' },
    { title: 'Ground yourself', body: 'Press your feet into the floor and name what is around you.' },
    { title: 'Talk to someone', body: 'Share how you feel with a person you trust.' },
    { title: 'One small step', body: 'Pick one small, manageable action and focus only on that.' },
    { title: 'Calm environment', body: 'Dim harsh lights and play soft background sound for a few minutes.' },
  ],
  disgust: [
    { title: 'Change your space', body: 'Move to a different room or step outside for fresh air.' },
    { title: 'Reset with water', body: 'Drink some water and wash your hands and face.' },
    { title: 'Slow breathing', body: 'Take six slow breaths, making each exhale longer than the inhale.' },
    { title: 'Refocus', body: 'Spend five minutes on something you enjoy, like music or a short video.' },
    { title: 'Talk it out', body: 'If something upset you, mentioning it to a friend can help.' },
  ],
  neutral: [
    { title: 'Hydration check', body: 'Have a glass of water now; most people under-drink during the day.' },
    { title: 'Posture reset', body: 'Roll your shoulders and stretch your neck for one minute.' },
    { title: 'Move every hour', body: 'Stand up and walk around for a few minutes each hour.' },
    { title: 'Screen break', body: 'Follow 20-20-20: every 20 minutes, look 20 feet away for 20 seconds.' },
    { title: 'Sleep hygiene', body: 'Avoid screens 30 minutes before bed for better rest.' },
  ],
}

export function getWellness(emotion: Emotion): Recommendation[] {
  return WELLNESS[emotion].map((r, i) => ({ ...r, rule: `wellness.${emotion}.${i + 1}` }))
}

export interface RoutineStep {
  step: 'Cleanse' | 'Treat' | 'Moisturize' | 'Protect'
  detail: string
}

export interface SkincarePlan {
  morning: RoutineStep[]
  evening: RoutineStep[]
  tips: Recommendation[]
  dermatologist: boolean
}

export function isConfident(f: SkinFinding) {
  return f.confidence >= SKIN_CONFIDENCE_THRESHOLD
}

export function getSkincare(findings: SkinFinding[]): SkincarePlan {
  const confident = findings.filter(isConfident)
  const acne = confident.find((f) => f.condition === 'acne' && f.present)
  const type = confident.find((f) => f.condition === 'skin_type')?.type ?? 'normal'
  const circles = confident.find((f) => f.condition === 'dark_circles' && f.present)

  const cleanser =
    type === 'oily'
      ? 'Gentle foaming cleanser to remove excess oil'
      : type === 'dry'
        ? 'Cream or hydrating non-foaming cleanser'
        : 'Mild, pH-balanced cleanser'
  const moisturizer =
    type === 'oily'
      ? 'Lightweight, oil-free gel moisturizer'
      : type === 'dry'
        ? 'Ceramide or hyaluronic acid moisturizer'
        : 'Light daily moisturizer'

  const morning: RoutineStep[] = [
    { step: 'Cleanse', detail: cleanser },
    ...(circles ? [{ step: 'Treat' as const, detail: 'Light under-eye cream; a cold compress for 5 minutes can help puffiness' }] : []),
    { step: 'Moisturize', detail: moisturizer },
    { step: 'Protect', detail: 'Broad-spectrum sunscreen SPF 30+, reapply every 2–3 hours outdoors' },
  ]

  const evening: RoutineStep[] = [
    { step: 'Cleanse', detail: cleanser },
    ...(acne ? [{ step: 'Treat' as const, detail: 'Salicylic acid or benzoyl peroxide product on acne-prone areas' }] : []),
    { step: 'Moisturize', detail: moisturizer },
  ]

  const tips: Recommendation[] = [
    { title: 'Hydration', body: 'Drink water regularly through the day; skin reflects overall hydration.', rule: 'skincare.general.hydration' },
    { title: 'Sun protection', body: 'Wear SPF 30+ daily, even indoors near windows or on cloudy days.', rule: 'skincare.general.spf' },
  ]
  if (acne) tips.push({ title: 'Hands off', body: 'Avoid picking or squeezing; change pillowcases every few days.', rule: `skincare.acne.${acne.severity}` })
  if (circles) tips.push({ title: 'Rest your eyes', body: 'Aim for 7–9 hours of sleep and take regular screen breaks.', rule: 'skincare.dark_circles.present' })
  if (type === 'dry') tips.push({ title: 'Lukewarm water', body: 'Hot water strips natural oils; wash with lukewarm water instead.', rule: 'skincare.skin_type.dry' })
  if (type === 'oily') tips.push({ title: 'Blot, don’t scrub', body: 'Use blotting paper during the day instead of washing repeatedly.', rule: 'skincare.skin_type.oily' })

  return {
    morning,
    evening,
    tips,
    dermatologist: acne?.severity === 'moderate' || acne?.severity === 'severe',
  }
}

export const DISCLAIMER =
  'This is not medical advice. Results are estimates from facial appearance only. See a dermatologist for persistent or severe skin conditions.'
