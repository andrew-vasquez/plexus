import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-[10px] text-sm font-medium tracking-[-0.01em] transition-[transform,background-color,border-color,color,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border border-white/90 bg-white text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] hover:-translate-y-[2px] hover:bg-white/92",
        outline:
          "border border-white/12 bg-white/[0.03] text-white hover:-translate-y-[2px] hover:border-white/22 hover:bg-white/[0.06]",
        ghost:
          "border border-transparent bg-transparent text-white/72 hover:text-white hover:bg-white/[0.05]",
        subtle:
          "border border-white/8 bg-black/30 text-white/84 hover:-translate-y-[2px] hover:border-white/16 hover:bg-black/40",
      },
      size: {
        default: "h-11 px-4",
        sm: "h-9 px-3 text-[13px]",
        lg: "h-12 px-5 text-[15px]",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";

export { Button, buttonVariants };
