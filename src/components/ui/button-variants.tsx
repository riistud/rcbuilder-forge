import { Button } from "@/components/ui/button";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface HeroButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const HeroButton = forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        className={cn(
          "bg-gradient-primary text-primary-foreground hover:shadow-glow-primary transition-all duration-300 text-lg px-8 py-6 font-semibold",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

HeroButton.displayName = "HeroButton";

export const GlassButton = forwardRef<HTMLButtonElement, HeroButtonProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        variant="outline"
        className={cn(
          "glass-panel hover:bg-primary/10 border-primary/30 text-foreground transition-all duration-300",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    );
  }
);

GlassButton.displayName = "GlassButton";
