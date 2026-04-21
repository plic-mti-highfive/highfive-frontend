'use client'

import { useState } from 'react'
import { Header } from '@features/layout'
import { ConversationList } from '../components/ConversationList'
import { ConversationDetail } from '../components/ConversationDetail'
import { EmptyConversation } from '../components/EmptyConversation'
import type { Conversation } from '../types'
import { mockConversations } from '@/api/services/mock/data/mockConversations'

export function MessagesPage() {
  const [conversations] = useState<Conversation[]>(mockConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [isListCollapsed, setIsListCollapsed] = useState(false)

  const selectedConversation = conversations.find(c => c.id === selectedConversationId)

  return (
    <>
      <Header />
      <div className="bg-background" style={{ height: '2.75rem' }} />
      <main className="relative z-0 min-h-screen bg-background">
        <div className="flex flex-col lg:flex-row h-[calc(100vh-4.375rem)]">
          {/* Sidebar - Conversation List */}
          <aside
            className={`${
              isListCollapsed ? 'hidden' : 'w-full lg:w-1/3'
            } border-r border-border bg-sidebar lg:flex lg:flex-col`}
          >
            <ConversationList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
              onToggleCollapse={() => setIsListCollapsed(!isListCollapsed)}
            />
          </aside>

          {/* Main Content - Conversation Detail */}
          <section className={`flex-1 ${isListCollapsed ? 'w-full' : 'hidden lg:flex'} flex flex-col bg-muted/30`}>
            {selectedConversation ? (
              <ConversationDetail
                conversation={selectedConversation}
                onToggleListCollapse={() => setIsListCollapsed(!isListCollapsed)}
              />
            ) : (
              <EmptyConversation
                isListCollapsed={isListCollapsed}
                onToggleListCollapse={() => setIsListCollapsed(!isListCollapsed)}
              />
            )}
          </section>
        </div>
      </main>
    </>
  )
}
