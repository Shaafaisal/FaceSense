const STAGES = ['Detecting and aligning face', 'Running shared backbone', 'Scoring task heads', 'Applying recommendation rules']

export function AnalyzingStep({ preview }: { preview: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-6 text-center" role="status" aria-live="polite">
      <div className="relative aspect-square w-56 overflow-hidden rounded-2xl border bg-muted shadow-sm">
        {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
        <img src={preview} alt="" className="size-full object-cover" />
        <div className="absolute inset-0 bg-system-foreground/10" aria-hidden="true" />
        <div className="scan-line absolute inset-x-0 h-0.5 bg-primary shadow-[0_0_16px_4px_var(--primary)]" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Analyzing your photo</h1>
        <p className="text-sm text-muted-foreground">Processed in memory. Nothing is stored.</p>
      </div>
      <ol className="flex w-full flex-col gap-2 text-left text-sm">
        {STAGES.map((s, i) => (
          <li
            key={s}
            className="stage-in flex items-center gap-3 rounded-lg border border-system-foreground/20 bg-system px-3 py-2 text-system-foreground"
            style={{ animationDelay: `${i * 140}ms` }}
          >
            <span className="font-mono text-xs opacity-70">{String(i + 1).padStart(2, '0')}</span>
            {s}
          </li>
        ))}
      </ol>
    </div>
  )
}
