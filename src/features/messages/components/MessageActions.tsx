import { useState } from 'react'
import { MoreVertical, Flag } from 'lucide-react'
import type { Message } from '../types'

interface MessageActionsProps {
  message: Message
  isSent?: boolean
}

export function MessageActions({ message }: MessageActionsProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-1 hover:bg-black/10 dark:hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
        title="Options"
      >
        <MoreVertical className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
          <button
            onClick={() => {
              console.log('Signaler le message:', message.id)
              setIsOpen(false)
            }}
            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-popover-foreground hover:bg-muted transition-colors rounded-lg m-1"
          >
            <Flag className="w-4 h-4" />
            Signaler
          </button>
        </div>
      )}
    </div>
  )
}
