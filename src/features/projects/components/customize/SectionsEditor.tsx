import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";

import { Checkbox, IconButton } from "@shared/ui";
import type { CustomizationSection } from "@/domain";
import { moveItem, SECTION_LABEL } from "../../lib/customization";
import { SortableList } from "./SortableList";

/**
 * Ordre et visibilite des sections de l'Apercu. Reordonnancement par
 * glisser-deposer (poignee) ou par boutons ↑/↓ (alternative sans glisser,
 * WCAG 2.5.7) ; chaque deplacement
 * est annonce dans une region `role="status"`. Les boutons aux extremites
 * restent focusables (`focusableWhenDisabled`) pour que le focus ne soit
 * pas perdu quand l'element atteint le haut ou le bas.
 */
export function SectionsEditor({
  sections,
  onChange,
}: {
  sections: CustomizationSection[];
  onChange: (sections: CustomizationSection[]) => void;
}) {
  const [announcement, setAnnouncement] = useState("");

  function move(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= sections.length) return;
    onChange(moveItem(sections, index, direction));
    setAnnouncement(
      `${SECTION_LABEL[sections[index].id]} déplacée en position ${target + 1} sur ${sections.length}.`,
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-body-sm text-muted-foreground">
        Coche pour afficher une section, et change son ordre avec les flèches.
        La colonne « Équipe » reste toujours à droite.
      </p>
      <SortableList
        items={sections}
        getLabel={(section) => SECTION_LABEL[section.id]}
        onReorder={(next) => onChange(next)}
        className="flex flex-col gap-2"
        itemClassName="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
        renderItem={(section, index, handle) => {
          const label = SECTION_LABEL[section.id];
          return (
            <>
              {handle}
              <label className="flex flex-1 items-center gap-3 text-body-md text-foreground">
                <Checkbox
                  checked={section.visible}
                  onCheckedChange={(checked) =>
                    onChange(
                      sections.map((item) =>
                        item.id === section.id
                          ? { ...item, visible: checked }
                          : item,
                      ),
                    )
                  }
                />
                {label}
              </label>
              <IconButton
                aria-label={`Monter « ${label} »`}
                variant="outline"
                focusableWhenDisabled
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ArrowUp size={16} />
              </IconButton>
              <IconButton
                aria-label={`Descendre « ${label} »`}
                variant="outline"
                focusableWhenDisabled
                disabled={index === sections.length - 1}
                onClick={() => move(index, 1)}
              >
                <ArrowDown size={16} />
              </IconButton>
            </>
          );
        }}
      />
      <p role="status" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
