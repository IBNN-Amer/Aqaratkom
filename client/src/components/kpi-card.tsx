import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: LucideIcon;
  iconColor?: string;
  testId?: string;
}

export function KpiCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  iconColor = "text-primary",
  testId,
}: KpiCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className="hover-elevate transition-all" data-testid={testId}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-sm font-medium text-muted-foreground">
              {title}
            </span>
            <span className="text-3xl font-bold font-heading tracking-tight">
              {value}
            </span>
            {change !== undefined && (
              <div className="flex items-center gap-1 mt-1">
                {isPositive && (
                  <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                )}
                {isNegative && (
                  <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                )}
                <span
                  className={cn(
                    "text-sm font-medium",
                    isPositive && "text-green-600 dark:text-green-400",
                    isNegative && "text-red-600 dark:text-red-400",
                    !isPositive && !isNegative && "text-muted-foreground"
                  )}
                >
                  {isPositive && "+"}
                  {change}%
                </span>
                {changeLabel && (
                  <span className="text-sm text-muted-foreground">
                    {changeLabel}
                  </span>
                )}
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10",
              iconColor
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
