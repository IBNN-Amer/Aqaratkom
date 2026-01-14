import { Calendar, User, Building2, MoreVertical, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";
import type { Deal, Lead, Property } from "@shared/schema";
import { cn } from "@/lib/utils";

interface DealCardProps {
  deal: Deal;
  lead?: Lead;
  property?: Property;
  onEdit?: (deal: Deal) => void;
  onDelete?: (deal: Deal) => void;
  isDragging?: boolean;
}

export function DealCard({ deal, lead, property, onEdit, onDelete, isDragging }: DealCardProps) {
  const { t, language } = useI18n();
  
  const formatPrice = (price: string | number | null) => {
    if (!price) return "-";
    const numPrice = typeof price === "string" ? parseFloat(price) : price;
    if (numPrice >= 1000000) {
      return `AED ${(numPrice / 1000000).toFixed(1)}M`;
    }
    if (numPrice >= 1000) {
      return `AED ${(numPrice / 1000).toFixed(0)}K`;
    }
    return `AED ${numPrice}`;
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const probabilityColor = 
    (deal.probability || 0) >= 70 ? "text-green-600 dark:text-green-400" :
    (deal.probability || 0) >= 40 ? "text-yellow-600 dark:text-yellow-400" :
    "text-red-600 dark:text-red-400";

  const leadInitials = lead?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const propertyTitle = property 
    ? (language === "ar" && property.titleAr ? property.titleAr : property.title)
    : null;

  return (
    <Card 
      className={cn(
        "hover-elevate transition-all cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50 rotate-2 scale-105"
      )}
      data-testid={`card-deal-${deal.id}`}
    >
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          <GripVertical className="h-4 w-4 mt-1 text-muted-foreground/50 shrink-0" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">
                    {leadInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h4 className="font-medium text-sm truncate">
                    {lead?.name || "Unknown Lead"}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {lead?.phone}
                  </p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6 shrink-0"
                    data-testid={`button-deal-menu-${deal.id}`}
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(deal)}>
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(deal)}
                    className="text-destructive"
                  >
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-2 text-lg font-bold font-heading">
              {formatPrice(deal.value)}
            </div>

            {propertyTitle && (
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3 shrink-0" />
                <span className="truncate">{propertyTitle}</span>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{formatDate(deal.expectedCloseDate)}</span>
              </div>
              
              <Badge 
                variant="outline" 
                className={cn("text-xs font-medium", probabilityColor)}
              >
                {deal.probability || 0}%
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
