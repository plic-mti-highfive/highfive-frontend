import type { Conversation } from '../types'
import { format, isToday, isYesterday } from 'date-fns'
import { frCA } from 'date-fns/locale'

interface ConversationListItemProps {
  conversation: Conversation
  isSelected: boolean
  onSelect: (id: string) => void
}

function formatMessageTime(date: Date): string {
  if (isToday(date)) {
    return format(date, 'HH:mm', { locale: frCA })
  }
  if (isYesterday(date)) {
    return 'Hier'
  }
  return format(date, 'd MMM', { locale: frCA })
}

function getConversationName(conversation: Conversation, currentUserId = 'user-1'): string {
  if (conversation.type === 'group') {
    return conversation.name || 'Groupe sans nom'
  }

  // Pour les conversations directes, afficher le nom de l'autre participant
  // Pour le mock, on affiche juste un nom générique
  const otherUserId = conversation.participants.find(id => id !== currentUserId)
  const names: { [key: string]: string } = {
    'user-2': 'Sophie Martin',
    'user-3': 'Thomas Dupont',
    'user-4': 'Marie Laurent',
    'user-5': 'Jean Claude',
    'user-6': 'Lisa Moreau',
  }

  return names[otherUserId || 'user-1'] || 'Utilisateur'
}

export function ConversationListItem({ conversation, isSelected, onSelect }: ConversationListItemProps) {
  const name = getConversationName(conversation)
  const timestamp = formatMessageTime(conversation.lastMessage.timestamp)
  const truncatedContent = conversation.lastMessage.content.substring(0, 40) + (conversation.lastMessage.content.length > 40 ? '...' : '')

  return (
    <button
      onClick={() => onSelect(conversation.id)}
      className={`w-full px-4 py-3 text-left border-b border-border transition-colors ${
        isSelected
          ? 'bg-muted'
          : 'hover:bg-muted/50 bg-sidebar'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate">{name}</h3>
            <span className="text-xs text-muted-foreground flex-shrink-0">{timestamp}</span>
          </div>
          <p className="text-sm text-muted-foreground truncate">{truncatedContent}</p>
        </div>

        {conversation.unreadCount > 0 && (
          <div className="flex-shrink-0 flex items-center gap-2">
            <span className="inline-flex items-center justify-center min-w-6 h-6 bg-primary text-primary-foreground text-xs font-medium rounded-full">
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </div>
    </button>
  )
}
