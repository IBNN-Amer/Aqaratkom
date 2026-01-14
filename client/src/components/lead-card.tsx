import { Phone, Mail, Calendar, MoreVertical, MessageCircle, User } from "lucide-react";
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
import type { Lead } from "@shared/schema";
import { cn } from "@/lib/utils";

interface LeadCardProps {
  lead: Lead;
  onEdit?: (lead: Lead) => void;
  onDelete?: (lead: Lead) => void;
  onMessage?: (lead: Lead) => void;
}

const statusColors: Record<string, string> = {
  new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  contacted: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  qualified: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  negotiating: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  won: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const sourceIcons: Record<string, string> = {
  facebook: "bg-blue-500",
  instagram: "bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500",
  website: "bg-gray-500",
  whatsapp: "bg-green-500",
  referral: "bg-orange-500",
  phone: "bg-cyan-500",
  walk_in: "bg-indigo-500",
};

export function LeadCard({ lead, onEdit, onDelete, onMessage }: LeadCardProps) {
  const { t } = useI18n();
  const initials = lead.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (date: Date | string | null) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <Card 
      className="hover-elevate transition-all group"
      data-testid={`card-lead-${lead.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-base truncate">{lead.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge 
                    variant="secondary" 
                    className={cn("text-xs", statusColors[lead.status])}
                  >
                    {t(`status.${lead.status}`)}
                  </Badge>
                  <div 
                    className={cn(
                      "h-2 w-2 rounded-full",
                      sourceIcons[lead.source]
                    )}
                    title={t(`source.${lead.source}`)}
                  />
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid={`button-lead-menu-${lead.id}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEdit?.(lead)}>
                    <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {t("common.edit")}
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onMessage?.(lead)}>
                    <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    Message
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete?.(lead)}
                    className="text-destructive"
                  >
                    {t("common.delete")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 space-y-1.5 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" />
                <span dir="ltr">{lead.phone}</span>
              </div>
              {lead.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  <span className="truncate">{lead.email}</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>{formatDate(lead.lastContactAt || lead.createdAt)}</span>
              </div>
            </div>

            {lead.score !== null && lead.score !== undefined && (
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full rounded-full transition-all",
                      lead.score >= 70 ? "bg-green-500" :
                      lead.score >= 40 ? "bg-yellow-500" : "bg-red-500"
                    )}
                    style={{ width: `${lead.score}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-muted-foreground">
                  {lead.score}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
