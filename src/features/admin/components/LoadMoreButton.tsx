import { Button, Spinner } from "@shared/ui";

/** Libelle du doc 17 ("Charger la suite") pour toutes les listes admin paginees. */
export function LoadMoreButton({
  hasNextPage,
  isFetchingNextPage,
  onClick,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onClick: () => void;
}) {
  if (!hasNextPage) return null;
  return (
    <div className="flex justify-center py-3">
      <Button variant="outline" onClick={onClick} disabled={isFetchingNextPage}>
        {isFetchingNextPage && <Spinner size="sm" />}
        Charger la suite
      </Button>
    </div>
  );
}
