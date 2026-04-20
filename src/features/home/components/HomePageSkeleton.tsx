import { Skeleton } from '@shared/components/ui/skeleton'

function CardSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-48 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
    </div>
  )
}

function HeroCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-80 w-full rounded-lg" />
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-full" />
        <Skeleton className="h-8 w-24 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  )
}

export function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-6 pt-10">
      <section className="mb-6 pb-16">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.85fr] gap-10 items-start">
          <HeroCardSkeleton />
          <div className="grid grid-cols-2 gap-x-5 gap-y-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 border-t border-border">
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <section className="py-14 border-t border-border">
        <Skeleton className="h-8 w-56 mb-8" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-7 gap-y-10">
          {Array.from({ length: 8 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>

      <div className="pb-20" />
    </div>
  )
}
