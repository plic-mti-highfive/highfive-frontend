import { CircleCheck, Search } from "lucide-react";

import { Badge, Section } from "@shared/ui";
import { cn } from "@shared/lib/cn";
import type { Need } from "@/domain";
import { ProjectPanel } from "./ProjectPanel";

/**
 * "On recherche" : les profils que le projet cherche, en tete de l'apercu
 * (c'est ce qui donne envie de rejoindre). Les besoins ouverts passent avant
 * les besoins pourvus, qui restent visibles mais barres. Absent sans besoin.
 */
export function ProjectNeeds({
  needs,
  accentMarker = false,
}: {
  needs: Need[];
  accentMarker?: boolean;
}) {
  if (needs.length === 0) return null;

  const sorted = [...needs].sort(
    (a, b) => Number(a.fulfilled) - Number(b.fulfilled),
  );
  const openCount = needs.filter((need) => !need.fulfilled).length;

  return (
    <ProjectPanel>
      <Section
        title="On recherche"
        accentMarker={accentMarker}
        actions={
          openCount > 0 ? (
            <Badge tone="info">
              {openCount}{" "}
              {openCount === 1 ? "profil ouvert" : "profils ouverts"}
            </Badge>
          ) : (
            <Badge tone="success">Tous pourvus</Badge>
          )
        }
      >
        <ul className="flex flex-col gap-2">
          {sorted.map((need) => (
            <li
              key={need.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border px-4 py-3",
                need.fulfilled
                  ? "border-border bg-muted text-muted-foreground"
                  : "border-border bg-card text-foreground",
              )}
            >
              {need.fulfilled ? (
                <CircleCheck
                  aria-hidden="true"
                  className="size-4 shrink-0 text-success-fg"
                />
              ) : (
                <Search
                  aria-hidden="true"
                  className="size-4 shrink-0 text-muted-foreground"
                />
              )}
              <span
                className={cn(
                  "flex-1 text-body-md",
                  need.fulfilled ? "line-through" : "font-medium",
                )}
              >
                {need.label}
              </span>
              {need.fulfilled && <Badge tone="success">Pourvu</Badge>}
            </li>
          ))}
        </ul>
      </Section>
    </ProjectPanel>
  );
}
