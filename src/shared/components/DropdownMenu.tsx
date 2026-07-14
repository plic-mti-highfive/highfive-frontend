import { MoreVertical } from "lucide-react";
import { Menu } from "@base-ui/react/menu";
import type { ReactNode } from "react";

interface DropdownMenuItem {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}

interface DropdownMenuProps {
  items: DropdownMenuItem[];
  triggerSize?: "sm" | "md";
  iconSize?: number;
  offset?: number;
}

const popupCls =
  "bg-background border border-border rounded-xl shadow-lg py-1.5 w-48 z-[999] origin-[var(--transform-origin)] transition-[transform,opacity] data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0";

const itemCls =
  "flex items-center gap-3 w-full px-3 py-2 text-sm text-foreground rounded-lg cursor-pointer hover:bg-muted outline-none select-none transition-colors";

export function DropdownMenu({
  items,
  triggerSize = "md",
  iconSize = 20,
  offset = 8,
}: DropdownMenuProps) {
  const triggerClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 bg-background/90 backdrop-blur-sm",
  };

  return (
    <Menu.Root>
      <Menu.Trigger
        className={`flex items-center justify-center ${triggerClasses[triggerSize]} rounded-lg border border-border hover:bg-muted transition-colors cursor-pointer shrink-0`}
      >
        <MoreVertical size={iconSize} className="text-muted-foreground" />
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={offset}>
          <Menu.Popup className={popupCls}>
            {items.map((item, index) => (
              <Menu.Item key={index} className={itemCls} onClick={item.onClick}>
                {item.icon}
                {item.label}
              </Menu.Item>
            ))}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
