import { cva } from "class-variance-authority";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border-2 px-[1.1rem] py-[0.65rem] text-sm font-bold transition-colors transition-transform duration-150",
  {
    variants: {
      variant: {
        primary:
          "border-primary bg-primary text-primary-foreground hover:border-primary-hover hover:bg-primary-hover",
        secondary:
          "border-secondary bg-secondary text-secondary-foreground hover:border-secondary-hover hover:bg-secondary-hover",
        ghost:
          "border-border bg-transparent text-foreground hover:border-foreground hover:bg-surface-elevated",
        whatsapp:
          "border-whatsapp bg-whatsapp text-primary-foreground hover:-translate-y-0.5",
      },
    },
    defaultVariants: {
      variant: "primary",
    },
  },
);

export function Button({ className, variant, type = "button", ...props }) {
  return (
    <button
      className={buttonVariants({ className, variant })}
      type={type}
      {...props}
    />
  );
}
