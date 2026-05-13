import { Menu } from "@base-ui/react/menu";
import {
  EllipsisVertical,
  Ban,
  Flag,
  EyeOff,
  Share2,
  Pencil,
} from "lucide-react";

const popupCls =
  "bg-background border border-border rounded-xl shadow-lg py-1.5 min-w-48 z-50";
const itemCls =
  "flex items-center gap-3 w-full px-3 py-2 text-body-md text-foreground rounded-lg cursor-pointer hover:bg-muted outline-none select-none transition-colors data-[highlighted]:bg-muted";
const separatorCls = "border-t border-border my-1.5 mx-2";

interface UserActionsMenuProps {
  isOwnProfile: boolean;
  onShare?: () => void;
  onEdit?: () => void;
  onBlock?: () => void;
  onReport?: () => void;
  onHide?: () => void;
}

export function UserActionsMenu({
  isOwnProfile,
  onShare = () => console.log("Partager"),
  onEdit = () => console.log("Éditer"),
  onBlock = () => console.log("Bloquer"),
  onReport = () => console.log("Signaler"),
  onHide = () => console.log("Masquer"),
}: UserActionsMenuProps) {
  return (
    <Menu.Root>
      <Menu.Trigger className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-muted transition-colors cursor-pointer outline-none">
        <EllipsisVertical className="w-5 h-5 text-foreground" />
      </Menu.Trigger>

      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8}>
          <Menu.Popup className={popupCls}>
            {isOwnProfile ? (
              <>
                <Menu.Item className={itemCls} onClick={onEdit}>
                  <Pencil className="w-4 h-4" />
                  <span>Éditer le profil</span>
                </Menu.Item>
                <Menu.Item className={itemCls} onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                  <span>Partager le profil</span>
                </Menu.Item>
              </>
            ) : (
              <>
                <Menu.Item className={itemCls} onClick={onShare}>
                  <Share2 className="w-4 h-4" />
                  <span>Partager le profil</span>
                </Menu.Item>
                <div className={separatorCls} />
                <Menu.Item className={itemCls} onClick={onBlock}>
                  <Ban className="w-4 h-4" />
                  <span>Bloquer cet utilisateur</span>
                </Menu.Item>
                <Menu.Item className={itemCls} onClick={onReport}>
                  <Flag className="w-4 h-4" />
                  <span>Signaler cet utilisateur</span>
                </Menu.Item>
                <Menu.Item className={itemCls} onClick={onHide}>
                  <EyeOff className="w-4 h-4" />
                  <span>Masquer le contenu</span>
                </Menu.Item>
              </>
            )}
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
