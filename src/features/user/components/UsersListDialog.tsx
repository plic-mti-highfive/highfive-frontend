import { Dialog } from '@base-ui/react/dialog'
import { X } from 'lucide-react'

export interface UserListItem {
  username: string
  displayName: string
  avatar: string
}

interface UsersListDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  users: UserListItem[]
}

export function UsersListDialog({ open, onOpenChange, title, users }: UsersListDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

        <Dialog.Popup className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md max-h-[80vh] overflow-y-auto">
          <div className="bg-popover border border-border rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <Dialog.Title className="text-2xl font-heading font-semibold text-popover-foreground">
                {title}
              </Dialog.Title>
              <Dialog.Close className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors">
                <X className="w-5 h-5 text-popover-foreground" />
              </Dialog.Close>
            </div>

            {users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-body-md text-muted-foreground">Aucun utilisateur</p>
              </div>
            ) : (
              <div className="space-y-2">
                {users.map((user) => (
                  <div
                    key={user.username}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-popover-foreground truncate">
                        {user.displayName}
                      </p>
                      <p className="text-body-sm text-muted-foreground truncate">
                        @{user.username}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
