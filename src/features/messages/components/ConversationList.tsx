import { useState } from 'react'
import { ChevronLeft, Plus, Search } from 'lucide-react'
import type { Conversation } from '../types'
import { ConversationListItem } from './ConversationListItem'
import { CreateConversationModal } from './CreateConversationModal'

interface ConversationListProps {
  conversations: Conversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onToggleCollapse: () => void
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onToggleCollapse,
}: ConversationListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Simple mock for conversation names
  const getConversationName = (conv: Conversation): string => {
    if (conv.type === 'group') {
      return conv.name || 'Groupe sans nom'
    }
    const names: { [key: string]: string } = {
      'user-2': 'Sophie Martin',
      'user-3': 'Thomas Dupont',
      'user-4': 'Marie Laurent',
      'user-5': 'Jean Claude',
      'user-6': 'Lisa Moreau',
    }
    const otherUserId = conv.participants.find(id => id !== 'user-1')
    return names[otherUserId || 'user-1'] || 'Utilisateur'
  }

  // Filter conversations based on search query
  const filteredConversations = conversations
    .sort((a, b) => new Date(b.lastMessage.timestamp).getTime() - new Date(a.lastMessage.timestamp).getTime())
    .filter(conv => {
      const name = getConversationName(conv)
      return name.toLowerCase().includes(searchQuery.toLowerCase())
    })

  return (
    <div className="flex flex-col h-full bg-sidebar">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <h2 className="text-xl font-bold text-foreground">Messages</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            title="Nouvelle conversation"
          >
            <Plus className="w-5 h-5" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground lg:hidden"
            title="Réduire"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2 px-3 py-2 bg-background rounded-lg border border-input">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length > 0 ? (
          filteredConversations.map(conversation => (
            <ConversationListItem
              key={conversation.id}
              conversation={conversation}
              isSelected={selectedConversationId === conversation.id}
              onSelect={onSelectConversation}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Aucune conversation trouvée</p>
          </div>
        )}
      </div>

      {/* Create Conversation Modal */}
      <CreateConversationModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreateConversation={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
