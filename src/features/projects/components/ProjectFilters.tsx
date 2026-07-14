import { Menu } from "@base-ui/react/menu";
import { ChevronDown, Filter, ArrowUpDown } from "lucide-react";
import { useState } from "react";

type SortOption = "name" | "date" | "popularity";
type FilterTag = string;

const popupCls =
  "bg-cream border border-cream-mid rounded-xl shadow-lg py-1.5 min-w-48 z-50";
const itemCls =
  "flex items-center gap-3 w-full px-3 py-2 text-body-md text-ink rounded-lg cursor-pointer hover:bg-cream-dark outline-none select-none transition-colors data-[highlighted]:bg-cream-dark";

export function ProjectFiltersBar({
  onSortChange,
  onFilterChange,
}: {
  onSortChange?: (sort: SortOption) => void;
  onFilterChange?: (filters: FilterTag[]) => void;
}) {
  const [activeSort, setActiveSort] = useState<SortOption>("date");
  const [activeFilters, setActiveFilters] = useState<FilterTag[]>([]);

  const handleSort = (sort: SortOption) => {
    setActiveSort(sort);
    onSortChange?.(sort);
  };

  const handleToggleFilter = (tag: FilterTag) => {
    const newFilters = activeFilters.includes(tag)
      ? activeFilters.filter((t) => t !== tag)
      : [...activeFilters, tag];
    setActiveFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const AVAILABLE_TAGS = [
    "React",
    "Python",
    "Design",
    "Open Source",
    "Machine Learning",
    "Web",
  ];

  const SORT_OPTIONS = [
    { value: "name" as const, label: "Par nom" },
    { value: "date" as const, label: "Plus récent" },
    { value: "popularity" as const, label: "Populaire" },
  ];

  return (
    <div className="flex items-center justify-end gap-3 mb-4">
      {/* Sort Menu */}
      <Menu.Root>
        <Menu.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-mid bg-white hover:bg-cream-dark transition-colors outline-none">
          <ArrowUpDown className="w-4 h-4 text-ink" />
          <span className="text-body-md font-medium text-ink">
            {SORT_OPTIONS.find((o) => o.value === activeSort)?.label}
          </span>
          <ChevronDown className="w-4 h-4 text-ink-muted" />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={4}>
            <Menu.Popup className={popupCls}>
              {SORT_OPTIONS.map((option) => (
                <Menu.Item
                  key={option.value}
                  className={itemCls}
                  onClick={() => handleSort(option.value)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activeSort === option.value ? "bg-ink" : "bg-cream-mid"
                      }`}
                    />
                    <span>{option.label}</span>
                  </div>
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Filter Menu */}
      <Menu.Root>
        <Menu.Trigger className="flex items-center gap-2 px-4 py-2 rounded-lg border border-cream-mid bg-white hover:bg-cream-dark transition-colors outline-none">
          <Filter className="w-4 h-4 text-ink" />
          <span className="text-body-md font-medium text-ink">Filtrer</span>
          {activeFilters.length > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full bg-rose-light text-rose-dark text-xs font-semibold">
              {activeFilters.length}
            </span>
          )}
          <ChevronDown className="w-4 h-4 text-ink-muted" />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner side="bottom" align="end" sideOffset={4}>
            <Menu.Popup className={popupCls}>
              {AVAILABLE_TAGS.map((tag) => (
                <Menu.Item
                  key={tag}
                  className={itemCls}
                  onClick={() => handleToggleFilter(tag)}
                >
                  <div className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-4 h-4 rounded border ${
                        activeFilters.includes(tag)
                          ? "bg-ink border-ink"
                          : "border-cream-mid bg-white"
                      } flex items-center justify-center`}
                    >
                      {activeFilters.includes(tag) && (
                        <span className="text-white text-xs">[x]</span>
                      )}
                    </div>
                    <span>{tag}</span>
                  </div>
                </Menu.Item>
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
