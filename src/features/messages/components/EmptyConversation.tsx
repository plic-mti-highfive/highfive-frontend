import { ChevronRight } from 'lucide-react'

interface EmptyConversationProps {
  isListCollapsed: boolean
  onToggleListCollapse: () => void
}

export function EmptyConversation({ isListCollapsed, onToggleListCollapse }: EmptyConversationProps) {
  return (
    <div className="flex flex-col h-full items-center justify-center gap-4">
      {isListCollapsed && (
        <button
          onClick={onToggleListCollapse}
          className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground mb-4"
          title="Afficher les conversations"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Aucune conversation sélectionnée</h2>
        <p className="text-muted-foreground">
          Sélectionnez une conversation ou {!isListCollapsed ? 'créez une nouvelle' : 'ouvrez la liste pour en créer une'}
        </p>
      </div>
    </div>
  )
}
