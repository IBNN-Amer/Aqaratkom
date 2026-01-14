import { 
  UserPlus, 
  MessageCircle, 
  Handshake, 
  Building2, 
  PhoneCall,
  Mail,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Activity } from "@shared/schema";

interface ActivityItemProps {
  activity: Activity;
}

const activityIcons: Record<string, typeof UserPlus> = {
  lead_created: UserPlus,
  message_sent: MessageCircle,
  message_received: MessageCircle,
  deal_created: Handshake,
  deal_updated: Handshake,
  deal_won: CheckCircle,
  deal_lost: XCircle,
  property_created: Building2,
  call_made: PhoneCall,
  email_sent: Mail,
  meeting_scheduled: Calendar,
};

const activityColors: Record<string, string> = {
  lead_created: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  message_sent: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  message_received: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
  deal_created: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  deal_updated: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
  deal_won: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  deal_lost: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  property_created: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
  call_made: "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400",
  email_sent: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
  meeting_scheduled: "bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400",
};

export function ActivityItem({ activity }: ActivityItemProps) {
  const Icon = activityIcons[activity.type] || MessageCircle;
  const colorClass = activityColors[activity.type] || "bg-muted text-muted-foreground";

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  return (
    <div 
      className="flex items-start gap-3 py-3 hover:bg-muted/30 -mx-2 px-2 rounded-lg transition-colors duration-150"
      data-testid={`activity-${activity.id}`}
    >
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", colorClass)}>
        <Icon className="h-3.5 w-3.5" />
      </div>
      
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{activity.description}</p>
        <span className="text-xs text-muted-foreground/70 font-medium">
          {formatTime(activity.createdAt)}
        </span>
      </div>
    </div>
  );
}
