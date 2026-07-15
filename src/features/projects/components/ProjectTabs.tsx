type TabId = "overview" | "tasks" | "announcement";

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: "overview", label: "Aperçu" },
  { id: "announcement", label: "Annonces" },
  { id: "tasks", label: "Tâches" },
];

interface ProjectTabsProps {
  activeTab: TabId;
  onChange: (tab: TabId) => void;
}

export function ProjectTabs({ activeTab, onChange }: ProjectTabsProps) {
  return (
    <div className="border-b border-border mb-6">
      <div className="flex gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-4 py-3 text-sm font-medium transition-colors relative
              ${
                activeTab === tab.id
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }
            `}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export type { TabId };
