import { Card, Skeleton } from "@shared/ui";

/**
 * 6 squelettes de `ProjectCard` a la forme exacte, plus le squelette de la
 * colonne d'appui (doc 12 E-01). Aucun balayage anime (le `Skeleton`
 * primitif pulse, il ne "balaie" pas).
 */
function ProjectCardSkeleton({ featured = false }: { featured?: boolean }) {
  return (
    <Card
      className={
        featured ? "flex flex-col gap-3 p-7" : "flex flex-col gap-3 p-5"
      }
    >
      <Skeleton className="h-5 w-24 rounded-pill" />
      <Skeleton className={featured ? "h-8 w-2/3" : "h-5 w-3/4"} />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
      <div className="flex gap-1.5">
        <Skeleton className="h-5 w-14 rounded-pill" />
        <Skeleton className="h-5 w-16 rounded-pill" />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <Skeleton className="h-6 w-20 rounded-pill" />
        <Skeleton className="h-8 w-24 rounded-md" />
      </div>
    </Card>
  );
}

function ListRowSkeleton() {
  return (
    <div className="flex items-center gap-4 py-4">
      <Skeleton className="size-11 shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <Skeleton className="h-8 w-20 shrink-0 rounded-md" />
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="flex flex-col gap-9 py-8">
      <ProjectCardSkeleton featured />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
      <div className="flex flex-col">
        {Array.from({ length: 4 }).map((_, i) => (
          <ListRowSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
