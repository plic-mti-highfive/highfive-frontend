import { MessageSquare } from "lucide-react";
import { EmptyState } from "@shared/ui";

export function EmptyConversation() {
  return (
    <div className="flex h-full items-center justify-center">
      <EmptyState
        icon={MessageSquare}
        title="Choisis une conversation"
        description="Sélectionne une discussion dans la liste, ou lance-en une nouvelle."
      />
    </div>
  );
}
