import { useState } from 'react'
import type { ProjectMessageDto } from '@/api/types'
import { MessageCard } from './MessageCard'
import { projectService } from '@/api/services'

interface DiscussionThreadProps {
  projectId: string
  messages: ProjectMessageDto[]
  onMessageSent?: (message: ProjectMessageDto) => void
}

export function DiscussionThread({ projectId, messages, onMessageSent }: DiscussionThreadProps) {
  const [newMessage, setNewMessage] = useState('')
  const [isSending, setIsSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || isSending) return

    try {
      setIsSending(true)
      const message = await projectService.createMessage(projectId, {
        content: newMessage.trim(),
      })

      setNewMessage('')
      onMessageSent?.(message)
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error)
    } finally {
      setIsSending(false)
    }
  }

  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="space-y-4">
      {sortedMessages.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Aucun message pour le moment. Soyez le premier à écrire.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedMessages.map((message) => (
            <MessageCard key={message.id} message={message} />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6">
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Écrivez un message..."
            className="w-full p-4 bg-transparent text-foreground resize-none focus:outline-none"
            rows={3}
            disabled={isSending}
          />
          <div className="flex justify-end px-4 pb-4">
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className="px-4 py-2 bg-foreground text-background font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            >
              {isSending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
