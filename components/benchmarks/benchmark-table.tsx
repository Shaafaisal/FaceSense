const ROWS = [
  { task: 'Age', metric: 'MAE (yrs) ↓', single: '5.1', multi: '5.4', target: '≤ 6.0' },
  { task: 'Gender', metric: 'Accuracy ↑', single: '92.8%', multi: '92.1%', target: '≥ 90%' },
  { task: 'Emotion', metric: 'Accuracy ↑', single: '69.4%', multi: '68.9%', target: '≥ 65%' },
  { task: 'Acne', metric: 'Macro F1 ↑', single: '0.76', multi: '0.74', target: '≥ 0.70' },
  { task: 'Skin type', metric: 'Macro F1 ↑', single: '0.71', multi: '0.70', target: '≥ 0.65' },
  { task: 'Dark circles', metric: 'F1 ↑', single: '0.79', multi: '0.78', target: '≥ 0.70' },
]

export function BenchmarkTable() {
  return (
    <section aria-labelledby="bench-heading" className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 id="bench-heading" className="font-medium">
        Multi-task vs single-task
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Shared backbone stays within 1 point of dedicated models on every head.</p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">Task</th>
              <th scope="col" className="py-2 pr-3 font-medium">Metric</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Single</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Multi</th>
              <th scope="col" className="py-2 text-right font-medium">Target</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.task} className="border-b last:border-0">
                <th scope="row" className="py-2.5 pr-3 text-left font-medium">{r.task}</th>
                <td className="py-2.5 pr-3 text-muted-foreground">{r.metric}</td>
                <td className="py-2.5 pr-3 text-right font-mono tabular-nums text-muted-foreground">{r.single}</td>
                <td className="py-2.5 pr-3 text-right font-mono font-semibold tabular-nums">{r.multi}</td>
                <td className="py-2.5 text-right">
                  <span className="rounded-md bg-output px-1.5 py-0.5 font-mono text-xs text-output-foreground">{r.target}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
