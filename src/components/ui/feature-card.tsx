
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function FeatureCard({
  title,
  description,
  icon,
  className,
  children,
  onClick,
}: FeatureCardProps) {
  return (
    <div 
      className={cn(
        "relative overflow-hidden rounded-xl border border-border/40 bg-card p-6 shadow-card",
        "hover-scale card-hover",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {icon && (
        <div className="absolute right-4 top-4 text-muted-foreground/20 opacity-80">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium tracking-tight">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      )}
      {children && <div className="mt-4">{children}</div>}
    </div>
  );
}
