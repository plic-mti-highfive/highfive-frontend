import { useState } from 'react'

interface Tab {
  id: string
  label: string
  icon: React.ReactNode
  content: React.ReactNode
}

interface ProfileTabsProps {
  tabs: Tab[]
}

export function ProfileTabs({ tabs }: ProfileTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id || '')

  const activeTabData = tabs.find(t => t.id === activeTab)

  return (
    <div className="space-y-4">
      {/* Tab buttons */}
      <div className="flex gap-0 border-b border-ink-muted/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-3 px-6 py-5 text-heading-md font-semibold
              transition-colors border-b-4 outline-none
              ${activeTab === tab.id
                ? 'text-ink border-b-ink'
                : 'text-ink-muted border-b-transparent hover:text-ink'
              }
            `}
          >
            {tab.icon && <span className="text-2xl">{tab.icon}</span>}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="animate-fade-in">
        {activeTabData?.content}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-full bg-ink-muted/10 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold text-ink mb-2">
        {title}
      </h3>
      <p className="text-body-md text-ink-muted max-w-sm">
        {description}
      </p>
    </div>
  )
}

