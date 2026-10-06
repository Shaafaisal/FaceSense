'use client'

import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Camera, CheckCircle2, ImageUp, Lightbulb, RotateCcw, ScanLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { checkImageQuality, type QualityReport } from '@/lib/quality'
import { ACCEPTED_TYPES, MAX_FILE_BYTES } from '@/lib/types'
import { cn } from '@/lib/utils'

interface CaptureStepProps {
  onBack: () => void
  onAnalyze: (file: File, previewUrl: string) => void
  serverError: string | null
}

type Source = 'upload' | 'webcam'

const HINTS = ['Face the camera straight on', 'Use bright, even light', 'Remove glasses if possible', 'Fill most of the frame']

export function CaptureStep({ onBack, onAnalyze, serverError }: CaptureStepProps) {
  const [source, setSource] = useState<Source>('upload')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [quality, setQuality] = useState<QualityReport | null>(null)
  const [checking, setChecking] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  async function accept(next: File) {
    setFileError(null)
    if (!ACCEPTED_TYPES.includes(next.type)) return setFileError('Please choose a JPG or PNG image.')
    if (next.size > MAX_FILE_BYTES) return setFileError('That image is larger than 5 MB. Please choose a smaller one.')

    const url = URL.createObjectURL(next)
    if (preview) URL.revokeObjectURL(preview)
    setFile(next)
    setPreview(url)
    setChecking(true)
    try {
      setQuality(await checkImageQuality(url))
    } catch {
      setFileError('We could not read that image. Try a different file.')
      setFile(null)
      setPreview(null)
    } finally {
      setChecking(false)
    }
  }

  function reset() {
    if (preview) URL.revokeObjectURL(preview)
    setFile(null)
    setPreview(null)
    setQuality(null)
    setFileError(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Add a photo</h1>
        <p className="mt-1 text-muted-foreground">JPG or PNG, up to 5 MB. One clear, front-facing face works best.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="flex flex-col gap-4">
          {!preview && (
            <div role="tablist" aria-label="Photo source" className="inline-flex w-fit rounded-lg bg-secondary p-1">
              {(['upload', 'webcam'] as const).map((s) => (
                <button
                  key={s}
                  role="tab"
                  type="button"
                  aria-selected={source === s}
                  onClick={() => setSource(s)}
                  className={cn(
                    'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
                    source === s ? 'bg-card font-medium shadow-sm' : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  {s === 'upload' ? <ImageUp className="size-4" aria-hidden="true" /> : <Camera className="size-4" aria-hidden="true" />}
                  {s === 'upload' ? 'Upload' : 'Webcam'}
                </button>
              ))}
            </div>
          )}

          {preview ? (
            <PreviewPanel preview={preview} checking={checking} quality={quality} />
          ) : source === 'upload' ? (
            <UploadZone onFile={accept} />
          ) : (
            <WebcamPanel onCapture={accept} />
          )}

          {(fileError || serverError) && (
            <p role="alert" className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {fileError ?? serverError}
            </p>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="lg" className="h-10 px-4" onClick={onBack}>
              Back
            </Button>
            {preview && (
              <Button variant="outline" size="lg" className="h-10 px-4" onClick={reset}>
                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                Retake
              </Button>
            )}
            {preview && (
              <Button
                size="lg"
                className="h-10 px-4"
                disabled={!file || checking || !quality?.ok}
                onClick={() => file && preview && onAnalyze(file, preview)}
              >
                <ScanLine data-icon="inline-start" aria-hidden="true" />
                Analyze photo
              </Button>
            )}
          </div>
        </div>

        <aside className="h-fit rounded-xl border bg-card p-4">
          <p className="flex items-center gap-2 text-sm font-medium">
            <Lightbulb className="size-4 text-warning-foreground" aria-hidden="true" />
            Tips for a good photo
          </p>
          <ul className="mt-3 flex flex-col gap-2 text-sm text-muted-foreground">
            {HINTS.map((h) => (
              <li key={h} className="flex gap-2">
                <span className="mt-2 size-1 shrink-0 rounded-full bg-muted-foreground" aria-hidden="true" />
                {h}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

function UploadZone({ onFile }: { onFile: (f: File) => void }) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const f = e.dataTransfer.files[0]
        if (f) onFile(f)
      }}
      className={cn(
        'flex aspect-[4/3] max-h-[420px] w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed bg-card p-6 text-center transition-colors',
        dragging ? 'border-primary bg-system' : 'border-input',
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-secondary">
        <ImageUp className="size-5" aria-hidden="true" />
      </span>
      <div>
        <p className="font-medium">Drag and drop a photo here</p>
        <p className="text-sm text-muted-foreground">or choose a file from your device</p>
      </div>
      <Button variant="outline" size="lg" className="h-9 px-4" onClick={() => inputRef.current?.click()}>
        Choose file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="sr-only"
        aria-label="Upload a face photo"
        onChange={(e) => {
          const f = e.target.files?.[0]
          if (f) onFile(f)
          e.target.value = ''
        }}
      />
    </div>
  )
}

function WebcamPanel({ onCapture }: { onCapture: (f: File) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream
    return () => stream?.getTracks().forEach((t) => t.stop())
  }, [stream])

  async function start() {
    setError(null)
    try {
      setStream(await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 1280, height: 960 } }))
    } catch {
      setError('Camera access was blocked or is unavailable. Allow camera access, or upload a photo instead.')
    }
  }

  function capture() {
    const video = videoRef.current
    if (!video) return
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(video, 0, 0)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        onCapture(new File([blob], 'webcam.jpg', { type: 'image/jpeg' }))
        setStream(null)
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <div className="relative flex aspect-[4/3] max-h-[420px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border bg-foreground/95">
      {stream ? (
        <>
          <video ref={videoRef} autoPlay playsInline muted className="size-full -scale-x-100 object-cover" aria-label="Live camera preview" />
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[70%] aspect-[3/4] -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-dashed border-background/70"
            aria-hidden="true"
          />
          <p className="absolute top-3 rounded-full bg-foreground/60 px-3 py-1 text-xs text-background">
            Center your face in the oval
          </p>
          <Button size="lg" className="absolute bottom-4 h-10 px-5" onClick={capture}>
            <Camera data-icon="inline-start" aria-hidden="true" />
            Capture
          </Button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-3 p-6 text-center text-background">
          <Camera className="size-8 opacity-80" aria-hidden="true" />
          <p className="max-w-xs text-sm opacity-80">
            {error ?? 'Your camera feed stays in your browser until you capture a frame.'}
          </p>
          <Button variant="secondary" size="lg" className="h-9 px-4" onClick={start}>
            Start camera
          </Button>
        </div>
      )}
    </div>
  )
}

function PreviewPanel({ preview, checking, quality }: { preview: string; checking: boolean; quality: QualityReport | null }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] max-h-[420px] w-full overflow-hidden rounded-xl border bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        <img src={preview} alt="Selected photo preview" className="size-full object-contain" />
      </div>
      <div
        role="status"
        className={cn(
          'flex items-start gap-2 rounded-lg border px-3 py-2.5 text-sm',
          checking && 'border-system-foreground/30 bg-system text-system-foreground',
          !checking && quality?.ok && 'border-output-foreground/30 bg-output text-output-foreground',
          !checking && quality && !quality.ok && 'border-warning-foreground/30 bg-warning text-warning-foreground',
        )}
      >
        {checking ? (
          <span>Running quality gate…</span>
        ) : quality?.ok ? (
          <>
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <span>Quality gate passed: lighting and sharpness look good.</span>
          </>
        ) : quality ? (
          <>
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
              <p className="font-medium">Please retake this photo</p>
              <ul className="mt-1 list-disc pl-4">
                {quality.issues.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}
