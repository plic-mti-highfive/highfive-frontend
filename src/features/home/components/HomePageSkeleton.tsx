import { Skeleton } from "@shared/components/ui/skeleton";

function FeedCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-border">
      <div className="p-5 space-y-2.5">
        <div className="flex items-center gap-1.5">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="p-5 space-y-2.5">
        <Skeleton className="h-3.5 w-full" />
        <Skeleton className="h-3.5 w-2/3" />
        <div className="flex gap-2 pt-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
      </div>
      <div className="p-4 flex items-center justify-between">
        <Skeleton className="h-3.5 w-24" />
        <Skeleton className="h-3.5 w-8" />
      </div>
    </div>
  );
}

function HeroCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-border">
      <div className="px-8 py-7 space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-6 h-6 rounded-full" />
          <Skeleton className="h-3 w-24" />
        </div>
        <Skeleton className="h-8 w-2/3" />
      </div>
      <div className="px-8 py-7 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="flex gap-2">
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-24 rounded-full" />
        </div>
      </div>
      <div className="px-8 py-4 flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-10" />
      </div>
    </div>
  );
}

function ProfilePanelSkeleton() {
  return (
    <div className="hidden xl:flex flex-col gap-5 w-[260px] shrink-0">
      <Skeleton className="w-16 h-16 rounded-full" />
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-24" />
      <div className="flex flex-col gap-2 pt-2">
        <Skeleton className="h-10 w-full rounded-lg" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

function TrendingPanelSkeleton() {
  return (
    <div className="hidden xl:flex flex-col gap-9 w-[280px] shrink-0">
      <div className="flex flex-col gap-5">
        <Skeleton className="h-5 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="w-11 h-11 rounded-full shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3.5">
        <Skeleton className="h-5 w-24" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <div className="flex items-start gap-10 py-10">
      <ProfilePanelSkeleton />

      <div className="flex-1 min-w-0 flex flex-col gap-11 xl:px-10 xl:border-x xl:border-border">
        <section>
          <Skeleton className="h-6 w-52 mb-5" />
          <HeroCardSkeleton />
        </section>

        {Array.from({ length: 3 }).map((_, sectionIndex) => (
          <section key={sectionIndex} className="pt-9 border-t border-border">
            <Skeleton className="h-5 w-40 mb-5" />
            <div className="flex flex-col gap-3.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <FeedCardSkeleton key={i} />
              ))}
            </div>
          </section>
        ))}
      </div>

      <TrendingPanelSkeleton />
    </div>
  );
}
