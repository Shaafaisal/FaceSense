const GROUPS = [
  { group: 'Female', ageMae: 5.3, gender: 91.6, emotion: 69.8 },
  { group: 'Male', ageMae: 5.5, gender: 92.6, emotion: 68.1 },
  { group: 'Lighter skin tones', ageMae: 5.1, gender: 93.4, emotion: 70.2 },
  { group: 'Medium skin tones', ageMae: 5.4, gender: 92.0, emotion: 68.7 },
  { group: 'Darker skin tones', ageMae: 6.0, gender: 89.7, emotion: 66.9 },
  { group: 'Age 60+', ageMae: 7.2, gender: 90.8, emotion: 64.3 },
]

const BEST_GENDER = Math.max(...GROUPS.map((g) => g.gender))
const GAP_LIMIT = 3

export function FairnessTable() {
  return (
    <section aria-labelledby="fairness-heading" className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 id="fairness-heading" className="font-medium">
            Per-group results
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Groups with a gender-accuracy gap above {GAP_LIMIT} points from the best group are flagged for rebalancing.
          </p>
        </div>
        <span className="w-fit rounded-md bg-warning px-2 py-1 text-xs text-warning-foreground">Known gap: Age 60+, darker tones</span>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b text-left text-xs text-muted-foreground">
              <th scope="col" className="py-2 pr-3 font-medium">Group</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Age MAE</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Gender acc.</th>
              <th scope="col" className="py-2 pr-3 text-right font-medium">Emotion acc.</th>
              <th scope="col" className="py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {GROUPS.map((g) => {
              const flagged = BEST_GENDER - g.gender > GAP_LIMIT || g.ageMae > 7
              return (
                <tr key={g.group} className="border-b last:border-0">
                  <th scope="row" className="py-2.5 pr-3 text-left font-medium">{g.group}</th>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{g.ageMae.toFixed(1)}</td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{g.gender.toFixed(1)}%</td>
                  <td className="py-2.5 pr-3 text-right font-mono tabular-nums">{g.emotion.toFixed(1)}%</td>
                  <td className="py-2.5 text-right">
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-xs ${flagged ? 'bg-warning text-warning-foreground' : 'bg-output text-output-foreground'}`}
                    >
                      {flagged ? 'Needs work' : 'Within range'}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}
