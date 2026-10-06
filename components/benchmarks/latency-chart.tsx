const BARS = [
  { label: 'Shared multi-task', ms: 118, size: '14 MB', highlight: true },
  { label: '4 single-task models', ms: 412, size: '52 MB', highlight: false },
]

const MAX = 450

export function LatencyChart() {
  return (
    <section aria-labelledby="latency-heading" className="flex flex-col rounded-xl border bg-card p-5 shadow-sm">
      <h2 id="latency-heading" className="font-medium">
        CPU latency per image
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Intel i5, batch size 1, after face detection.</p>
      <ul className="mt-6 flex flex-col gap-5">
        {BARS.map((b) => (
          <li key={b.label}>
            <div className="mb-1.5 flex items-baseline justify-between text-sm">
              <span className={b.highlight ? 'font-medium' : 'text-muted-foreground'}>{b.label}</span>
              <span className="font-mono tabular-nums">
                {b.ms} ms <span className="text-muted-foreground">· {b.size}</span>
              </span>
            </div>
            <div className="relative h-3 rounded-full bg-secondary" aria-hidden="true">
              <span
                className={`block h-full rounded-full ${b.highlight ? 'bg-primary' : 'bg-foreground/30'}`}
                style={{ width: `${(b.ms / MAX) * 100}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
      <div className="relative mt-3 h-4 text-[11px] text-muted-foreground" aria-hidden="true">
        <span
          className="absolute -top-[52px] h-[60px] border-l border-dashed border-system-foreground"
          style={{ left: `${(150 / MAX) * 100}%` }}
        />
        <span className="absolute font-mono text-system-foreground" style={{ left: `${(150 / MAX) * 100}%` }}>
          &nbsp;150 ms target
        </span>
      </div>
      <p className="mt-auto pt-6 text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">3.5× faster</span> and <span className="font-semibold text-foreground">73% smaller</span> than running each task separately.
      </p>
    </section>
  )
}
