import * as React from "react";
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { NavLink, type NavLinkProps } from "react-router-dom";

import { cn } from "@shared/lib/cn";

function Tabs({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      className={cn("flex flex-col gap-3", className)}
      {...props}
    />
  );
}

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      className={cn(
        "inline-flex items-center gap-1 rounded-lg bg-muted p-1",
        className,
      )}
      {...props}
    />
  );
}

const tabTriggerClass =
  "text-ui-sm font-semibold rounded-md px-3 py-1.5 text-muted-foreground transition-colors duration-fast outline-none cursor-pointer hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50";

function TabsTab({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-tab"
      className={cn(
        tabTriggerClass,
        "aria-selected:bg-card aria-selected:text-foreground aria-selected:shadow-rest",
        className,
      )}
      {...props}
    />
  );
}

function TabsPanel({
  className,
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-panel"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}

/**
 * Onglet basé sur une route (NavLink) plutôt que sur l'état interne de
 * `Tabs` — pour les cas où chaque onglet est en réalité une page distincte
 * (ex. sous-navigation d'un profil).
 */
function TabLink({ className, ...props }: NavLinkProps) {
  return (
    <NavLink
      className={(state) =>
        cn(
          tabTriggerClass,
          state.isActive && "bg-card text-foreground shadow-rest",
          typeof className === "function" ? className(state) : className,
        )
      }
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTab, TabsPanel, TabLink };
