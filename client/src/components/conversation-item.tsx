import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Conversation, Lead, Message } from "@shared/schema";

interface ConversationItemProps {
  conversation: Conversation;
  lead?: Lead;
  lastMessage?: Message;
  isActive?: boolean;
  onClick?: () => void;
}

export function ConversationItem({
  conversation,
  lead,
  lastMessage,
  isActive,
  onClick,
}: ConversationItemProps) {
  const initials = lead?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return d.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors hover-elevate",
        isActive && "bg-sidebar-accent"
      )}
      data-testid={`conversation-${conversation.id}`}
    >
      <div className="relative">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        {(conversation.unreadCount || 0) > 0 && (
          <div className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">
              {conversation.unreadCount}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h4 className={cn(
            "font-medium text-sm truncate",
            (conversation.unreadCount || 0) > 0 && "font-semibold"
          )}>
            {lead?.name || "Unknown"}
          </h4>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatTime(conversation.lastMessageAt)}
          </span>
        </div>

        <p className={cn(
          "text-sm truncate mt-0.5",
          (conversation.unreadCount || 0) > 0 
            ? "text-foreground font-medium" 
            : "text-muted-foreground"
        )}>
          {lastMessage?.content || "No messages yet"}
        </p>

        {conversation.status === "open" && (
          <Badge variant="secondary" className="mt-1.5 text-xs">
            Open
          </Badge>
        )}
      </div>
    </button>
  );
}
