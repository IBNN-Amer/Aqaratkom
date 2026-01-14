import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@shared/schema";

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isOutgoing = message.direction === "outgoing";
  
  const formatTime = (date: Date | string | null) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div
      className={cn(
        "flex w-full mb-2",
        isOutgoing ? "justify-end" : "justify-start"
      )}
      data-testid={`message-${message.id}`}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isOutgoing
            ? "bg-primary text-primary-foreground rounded-tr-sm"
            : "bg-muted text-foreground rounded-tl-sm"
        )}
      >
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>
        <div
          className={cn(
            "flex items-center justify-end gap-1 mt-1",
            isOutgoing ? "text-primary-foreground/70" : "text-muted-foreground"
          )}
        >
          <span className="text-[10px]">{formatTime(message.createdAt)}</span>
          {isOutgoing && (
            message.status === "read" ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
}
