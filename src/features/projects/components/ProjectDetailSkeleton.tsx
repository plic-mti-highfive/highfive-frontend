import { Skeleton } from '@shared/components/ui/skeleton'

export function ProjectDetailSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="bg-card border-b border-border">
        <div className="max-w-[1400px] mx-auto px-6 py-12">
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-5 w-1/2 mb-6" />
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-32 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-12 w-40 rounded-lg" />
            <Skeleton className="h-12 w-32 rounded-lg" />
          </div>
        </div>
      </div>

      <div className="border-b border-border bg-background py-12">
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex gap-6 border-b border-border pb-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-28" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="rounded-lg border border-border p-6 space-y-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              <div className="rounded-lg border border-border p-6 space-y-4">
                <Skeleton className="h-5 w-24" />
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="border-b border-border bg-background py-16">
        <div className="max-w-[1400px] mx-auto px-6 space-y-6">
          <Skeleton className="h-8 w-40" />
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border border-border rounded-lg">
                <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
