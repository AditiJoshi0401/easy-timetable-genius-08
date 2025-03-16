
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  description?: string;
  badge?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function SectionHeading({
  title,
  description,
  badge,
  icon,
  action,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between mb-6", className)}>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          {icon && <div className="flex-shrink-0 text-primary">{icon}</div>}
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-display font-semibold tracking-tight">{title}</h2>
            {badge && (
              <span className="rounded-full px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary">
                {badge}
              </span>
            )}
          </div>
        </div>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-3 sm:mt-0">{action}</div>}
    </div>
  );
}
