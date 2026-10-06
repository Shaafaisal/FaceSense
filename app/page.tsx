import { Analyzer } from '@/components/analyzer/analyzer'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default function Page() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader active="analyze" />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:py-12">
        <Analyzer />
      </main>
      <SiteFooter />
    </div>
  )
}
