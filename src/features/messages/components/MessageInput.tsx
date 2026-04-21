import { useState, useRef, useEffect } from 'react'
import { Send } from 'lucide-react'

interface MessageInputProps {
  onSendMessage: (content: string) => void
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-expand textarea as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`
    }
  }, [message])

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message)
      setMessage('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="flex items-end gap-3">
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Tapez votre message..."
          rows={1}
          className="flex-1 p-3 bg-background border border-input rounded-lg resize-none outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground max-h-30"
        />
        <button
          onClick={handleSendMessage}
          disabled={!message.trim()}
          className="flex-shrink-0 p-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Envoyer"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
