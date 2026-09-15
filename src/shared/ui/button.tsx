import { Button as ButtonPrimitive } from "@base-ui/react/button";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@shared/lib/cn";
import { buttonVariants } from "./button-variants";
import { Spinner } from "./spinner";

export interface ButtonOwnProps {
  /**
   * État de chargement (V2, retour util. 5) : affiche un `Spinner`, pose
   * `aria-busy` et désactive le bouton (fusionné avec `disabled`) le temps
   * d'une action asynchrone (ex. déconnexion). Le libellé reste visible —
   * seul un spinner s'ajoute devant.
   */
  loading?: boolean;
}

function Button({
  className,
  variant = "default",
  size = "default",
  nativeButton,
  loading = false,
  disabled,
  children,
  ...props
}: ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> &
  ButtonOwnProps) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      // Un `render` (ex. <Link/>) ne produit pas de <button> natif.
      nativeButton={nativeButton ?? !props.render}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading && <Spinner size="sm" className="text-current" />}
      {children}
    </ButtonPrimitive>
  );
}

export { Button };
