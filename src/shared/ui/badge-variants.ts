import { cva } from "class-variance-authority";

export const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-label tracking-normal whitespace-nowrap [&_svg]:size-3",
  {
    variants: {
      tone: {
        neutral: "bg-muted text-muted-foreground border-transparent",
        success: "bg-success-bg text-success-fg border-success-border/30",
        warning: "bg-warning-bg text-warning-fg border-warning-border/30",
        info: "bg-info-bg text-info-fg border-info-border/30",
        danger: "bg-danger-bg text-danger-fg border-danger-border/30",
        accent:
          "bg-[var(--accent-light)] text-[var(--accent-dark)] border-transparent",
      },
    },
    defaultVariants: {
      tone: "neutral",
    },
  },
);
