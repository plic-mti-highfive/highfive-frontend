import { MessageSquare } from "lucide-react";
import { EmptyState } from "@shared/ui";

export function EmptyConversation() {
  return (
    <div className="flex h-full min-w-0 flex-1 items-center justify-center bg-muted">
      <EmptyState
        icon={MessageSquare}
        title="Pas de conversation sélectionnée"
      />
    </div>
  );
}
