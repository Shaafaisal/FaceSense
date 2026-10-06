'use client'

import { useState } from 'react'
import type { AnalysisMode, AnalysisResult, ApiError, Emotion } from '@/lib/types'
import { AnalyzingStep } from './analyzing-step'
import { CaptureStep } from './capture-step'
import { ConfirmEmotionStep } from './confirm-emotion-step'
import { ConsentStep } from './consent-step'
import { ModeStep } from './mode-step'
import { ResultsStep } from './results-step'
import { Stepper, type StepId } from './stepper'

const NEGATIVE: Emotion[] = ['sad', 'fear', 'angry']

export function Analyzer() {
  const [step, setStep] = useState<StepId>('consent')
  const [agreed, setAgreed] = useState(false)
  const [improveModel, setImproveModel] = useState(false)
  const [mode, setMode] = useState<AnalysisMode>('all')
  const [image, setImage] = useState<{ file: File; url: string } | null>(null)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [selectedEmotion, setSelectedEmotion] = useState<Emotion>('neutral')
  const [confirmedEmotion, setConfirmedEmotion] = useState<Emotion | null>(null)
  const [negativeCount, setNegativeCount] = useState(0)
  const [serverError, setServerError] = useState<string | null>(null)

  async function analyze(file: File, url: string, runMode = mode) {
    setImage({ file, url })
    setServerError(null)
    setStep('analyzing')

    const form = new FormData()
    form.append('image', file)
    form.append('mode', runMode)
    form.append('consent', String(agreed))
    form.append('store_for_training', String(improveModel))

    try {
      const res = await fetch('/api/analyze', { method: 'POST', body: form })
      const data = (await res.json()) as AnalysisResult | ApiError
      if ('error' in data) {
        setServerError(data.error.message)
        setStep('capture')
        return
      }
      setResult(data)
      setConfirmedEmotion(null)
      if (data.emotion) {
        setSelectedEmotion(data.emotion.label)
        setStep('confirm')
      } else {
        setStep('results')
      }
    } catch {
      setServerError('The analysis service is unavailable. Please try again.')
      setStep('capture')
    }
  }

  async function confirmEmotion() {
    setConfirmedEmotion(selectedEmotion)
    if (NEGATIVE.includes(selectedEmotion)) setNegativeCount((c) => c + 1)
    setStep('results')
    if (result) {
      fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ predictionId: result.id, emotionCorrection: selectedEmotion }),
      }).catch(() => {})
    }
  }

  function restart() {
    if (image) URL.revokeObjectURL(image.url)
    setImage(null)
    setResult(null)
    setStep('capture')
  }

  function switchMode(next: AnalysisMode) {
    setMode(next)
    if (image) analyze(image.file, image.url, next)
  }

  return (
    <div className="flex flex-col gap-8">
      {step !== 'consent' && <Stepper current={step} skipConfirm={mode === 'skin'} />}

      {step === 'consent' && (
        <ConsentStep
          agreed={agreed}
          improveModel={improveModel}
          onAgreedChange={setAgreed}
          onImproveModelChange={setImproveModel}
          onContinue={() => setStep('mode')}
        />
      )}
      {step === 'mode' && (
        <ModeStep value={mode} onChange={setMode} onBack={() => setStep('consent')} onContinue={() => setStep('capture')} />
      )}
      {step === 'capture' && <CaptureStep onBack={() => setStep('mode')} onAnalyze={analyze} serverError={serverError} />}
      {step === 'analyzing' && image && <AnalyzingStep preview={image.url} />}
      {step === 'confirm' && result?.emotion && image && (
        <ConfirmEmotionStep
          emotion={result.emotion}
          preview={image.url}
          selected={selectedEmotion}
          onSelect={setSelectedEmotion}
          onConfirm={confirmEmotion}
        />
      )}
      {step === 'results' && result && image && (
        <ResultsStep
          result={result}
          preview={image.url}
          mode={mode}
          confirmedEmotion={confirmedEmotion}
          showSupportNote={negativeCount >= 2}
          onRestart={restart}
          onSwitchMode={switchMode}
        />
      )}
    </div>
  )
}
