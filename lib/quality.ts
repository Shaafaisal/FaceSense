export interface QualityReport {
  ok: boolean
  issues: string[]
  brightness: number
  sharpness: number
}

const SAMPLE = 256

/** Client-side pre-check mirroring the server quality gate: size, exposure, blur (variance of Laplacian). */
export async function checkImageQuality(src: string): Promise<QualityReport> {
  const img = new Image()
  img.crossOrigin = 'anonymous'
  img.src = src
  await img.decode()

  const issues: string[] = []
  if (Math.min(img.naturalWidth, img.naturalHeight) < 200) {
    issues.push('Image is too small. Move closer or use a higher-resolution photo.')
  }

  const scale = SAMPLE / Math.max(img.naturalWidth, img.naturalHeight)
  const w = Math.max(1, Math.round(img.naturalWidth * scale))
  const h = Math.max(1, Math.round(img.naturalHeight * scale))
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return { ok: issues.length === 0, issues, brightness: 0, sharpness: 0 }
  ctx.drawImage(img, 0, 0, w, h)
  const { data } = ctx.getImageData(0, 0, w, h)

  const gray = new Float32Array(w * h)
  let sum = 0
  for (let i = 0; i < w * h; i++) {
    const v = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2]
    gray[i] = v
    sum += v
  }
  const brightness = sum / (w * h)
  if (brightness < 55) issues.push('Photo is too dark. Move to brighter, even light.')
  if (brightness > 215) issues.push('Photo is overexposed. Avoid direct light or flash.')

  let lapSum = 0
  let lapSq = 0
  let n = 0
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const i = y * w + x
      const lap = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i]
      lapSum += lap
      lapSq += lap * lap
      n++
    }
  }
  const sharpness = n ? lapSq / n - (lapSum / n) ** 2 : 0
  if (sharpness < 15) issues.push('Photo looks blurry. Hold the camera steady and refocus.')

  return { ok: issues.length === 0, issues, brightness, sharpness }
}
