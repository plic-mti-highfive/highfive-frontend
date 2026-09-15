import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@shared/lib/cn";

/**
 * Primitive additive (mission projets, doc 13 E-13 "Qui peut venir") : la
 * creation de projet avait besoin d'un choix a options exclusives, absent
 * de `src/shared/ui` jusqu'ici. Meme habillage que `Checkbox`.
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

function Radio({
  className,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio"
      className={cn(
        "relative flex size-4 shrink-0 items-center justify-center rounded-full border border-input shadow-xs outline-none transition-shadow focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-checked:border-primary",
        className,
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-indicator"
        className="size-2 rounded-full bg-primary"
      />
    </RadioPrimitive.Root>
  );
}

export { Radio, RadioGroup };
