export function SiteFooter() {
  return (
    <footer className="border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:justify-between">
        <p>FaceSense · Research prototype. Not a medical device.</p>
        <p>No face recognition. Photos are processed in memory and discarded.</p>
      </div>
    </footer>
  )
}
