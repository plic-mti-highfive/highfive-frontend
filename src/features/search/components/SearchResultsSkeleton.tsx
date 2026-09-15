import { Card, Skeleton } from "@shared/ui";

/** Squelette de la grille de resultats (doc 12 E-02). Aucun balayage anime. */
export function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="flex flex-col gap-3 p-5">
          <Skeleton className="h-5 w-24 rounded-pill" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="mt-2 flex items-center justify-between">
            <Skeleton className="h-6 w-16 rounded-pill" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </Card>
      ))}
    </div>
  );
}
