import * as React from "react";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/cn";
import { buttonVariants } from "./button-variants";

type IconButtonSize = "xs" | "sm" | "default" | "lg";

export interface IconButtonProps
  extends
    Omit<React.ComponentProps<typeof ButtonPrimitive>, "size">,
    Pick<VariantProps<typeof buttonVariants>, "variant"> {
  size?: IconButtonSize;
  /** Les boutons icône seule doivent toujours porter un libellé accessible. */
  "aria-label": string;
}

const ICON_SIZE_MAP: Record<
  IconButtonSize,
  NonNullable<VariantProps<typeof buttonVariants>["size"]>
> = {
  xs: "icon-xs",
  sm: "icon-sm",
  default: "icon",
  lg: "icon-lg",
};

function IconButton({
  className,
  variant = "ghost",
  size = "default",
  ...props
}: IconButtonProps) {
  return (
    <ButtonPrimitive
      data-slot="icon-button"
      className={cn(
        buttonVariants({ variant, size: ICON_SIZE_MAP[size], className }),
      )}
      {...props}
    />
  );
}

export { IconButton };
