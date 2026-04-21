import { useState } from 'react'
import { Dialog } from '@base-ui/react/dialog'
import { X, Search } from 'lucide-react'

interface CreateConversationModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateConversation: () => void
}

interface AvailableUser {
  id: string
  username: string
  displayName: string
}

const availableUsers: AvailableUser[] = [
  { id: 'user-2', username: 'sophie_martin', displayName: 'Sophie Martin' },
  { id: 'user-3', username: 'thomas_dupont', displayName: 'Thomas Dupont' },
  { id: 'user-4', username: 'marie_laurent', displayName: 'Marie Laurent' },
  { id: 'user-5', username: 'jean_claude', displayName: 'Jean Claude' },
  { id: 'user-6', username: 'lisa_moreau', displayName: 'Lisa Moreau' },
]

export function CreateConversationModal({
  isOpen,
  onClose,
  onCreateConversation,
}: CreateConversationModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isGroup, setIsGroup] = useState(false)
  const [groupName, setGroupName] = useState('')

  const filteredUsers = availableUsers.filter(user =>
    user.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleToggleUser = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    )
  }

  const handleCreate = () => {
    if (selectedUsers.length === 0) return

    if (isGroup && !groupName.trim()) return

    // Mock: just close the modal for now
    setSearchQuery('')
    setSelectedUsers([])
    setIsGroup(false)
    setGroupName('')
    onCreateConversation()
    onClose()
  }

  const isValid = selectedUsers.length > 0 && (!isGroup || groupName.trim())

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col">
          <div className="bg-popover border border-border rounded-2xl shadow-2xl flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <Dialog.Title className="text-xl font-bold text-popover-foreground">
                Nouvelle conversation
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-muted rounded-lg transition-colors text-popover-foreground">
                <X className="w-5 h-5" />
              </Dialog.Close>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {/* Search Bar */}
              <div className="mb-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-background border border-input rounded-lg">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Rechercher des utilisateurs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent border-0 outline-none text-foreground placeholder-muted-foreground"
                  />
                </div>
              </div>

              {/* Users List */}
              <div className="space-y-1 mb-2">
                {filteredUsers.map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleToggleUser(user.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${
                      selectedUsers.includes(user.id)
                        ? 'bg-primary/10 border border-primary'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {user.displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-popover-foreground truncate">
                        {user.displayName}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                    <div
                      className={`flex-shrink-0 w-5 h-5 rounded border transition-colors ${
                        selectedUsers.includes(user.id)
                          ? 'bg-primary border-primary'
                          : 'border-border'
                      } flex items-center justify-center`}
                    >
                      {selectedUsers.includes(user.id) && (
                        <span className="text-white text-sm">✓</span>
                      )}
                    </div>
                  </button>
                ))}

                {filteredUsers.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>

              {/* Group Toggle */}
              {selectedUsers.length > 1 && (
                <div className="pt-4 border-t border-border space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isGroup}
                      onChange={(e) => setIsGroup(e.target.checked)}
                      className="w-4 h-4 rounded border border-input cursor-pointer"
                    />
                    <span className="text-sm font-medium text-popover-foreground">
                      Créer un groupe
                    </span>
                  </label>

                  {isGroup && (
                    <input
                      type="text"
                      placeholder="Nom du groupe"
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-lg outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground"
                    />
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-4 border-t border-border bg-muted/30">
              <Dialog.Close className="flex-1 px-4 py-2 rounded-lg border border-border hover:bg-muted transition-colors text-foreground font-medium">
                Annuler
              </Dialog.Close>
              <button
                onClick={handleCreate}
                disabled={!isValid}
                className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isGroup ? 'Créer le groupe' : 'Créer'}
              </button>
            </div>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
