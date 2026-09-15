import * as React from "react";
import { Menu } from "@base-ui/react/menu";

import { cn } from "@shared/lib/cn";

function DropdownMenu(props: React.ComponentProps<typeof Menu.Root>) {
  return <Menu.Root {...props} />;
}

function DropdownMenuTrigger(props: React.ComponentProps<typeof Menu.Trigger>) {
  return <Menu.Trigger {...props} />;
}

function DropdownMenuPortal(props: React.ComponentProps<typeof Menu.Portal>) {
  return <Menu.Portal {...props} />;
}

function DropdownMenuPositioner(
  props: React.ComponentProps<typeof Menu.Positioner>,
) {
  return (
    <Menu.Positioner side="bottom" align="end" sideOffset={4} {...props} />
  );
}

function DropdownMenuPopup({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Popup>) {
  return (
    <Menu.Popup
      className={cn(
        "z-dropdown min-w-36 rounded-lg border border-border bg-popover py-1 shadow-overlay outline-none",
        "transition-all duration-fast data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

function DropdownMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof Menu.Item>) {
  return (
    <Menu.Item
      className={cn(
        "flex w-full cursor-default items-center gap-2 px-3 py-1.5 text-body-sm text-foreground outline-none",
        "transition-colors duration-fast data-[highlighted]:bg-muted",
        className,
      )}
      {...props}
    />
  );
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuPositioner,
  DropdownMenuPopup,
  DropdownMenuItem,
};
