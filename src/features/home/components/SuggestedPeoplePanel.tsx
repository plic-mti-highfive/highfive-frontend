import { Link } from "react-router-dom";

import { Avatar, Section, Skeleton } from "@shared/ui";
import { useSuggestedPeople } from "@/api/queries/users";

/** Colonne d'appui "Des gens à rencontrer" (doc 12 E-01), 3 maximum. */
export function SuggestedPeoplePanel() {
  const { data, isLoading } = useSuggestedPeople();

  if (isLoading) {
    return (
      <Section title="Des gens à rencontrer">
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Skeleton className="size-6 shrink-0 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </Section>
    );
  }

  const people = data?.slice(0, 3) ?? [];
  if (people.length === 0) return null;

  return (
    <Section title="Des gens à rencontrer">
      <div className="flex flex-col gap-1">
        {people.map((person) => (
          <Link
            key={person.id}
            to={`/u/${person.username}`}
            className="-mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none transition-colors duration-fast hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring/50"
          >
            <Avatar
              name={person.displayName ?? person.username}
              src={person.avatar}
              size="sm"
            />
            <span className="min-w-0 truncate text-body-sm font-medium text-foreground">
              {person.displayName ?? person.username}
            </span>
          </Link>
        ))}
      </div>
    </Section>
  );
}
