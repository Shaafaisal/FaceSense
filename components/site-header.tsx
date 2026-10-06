import Link from 'next/link'
import { ScanFace } from 'lucide-react'

export function SiteHeader({ active }: { active: 'analyze' | 'benchmarks' }) {
  const linkClass = (isActive: boolean) =>
    `rounded-md px-3 py-1.5 text-sm transition-colors ${
      isActive ? 'bg-secondary font-medium text-foreground' : 'text-muted-foreground hover:text-foreground'
    }`

  return (
    <header className="border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ScanFace className="size-4" aria-hidden="true" />
          </span>
          FaceSense
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1">
          <Link href="/" className={linkClass(active === 'analyze')} aria-current={active === 'analyze' ? 'page' : undefined}>
            Analyze
          </Link>
          <Link
            href="/benchmarks"
            className={linkClass(active === 'benchmarks')}
            aria-current={active === 'benchmarks' ? 'page' : undefined}
          >
            Benchmarks
          </Link>
        </nav>
      </div>
    </header>
  )
}
