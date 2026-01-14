import { Moon, Sun, Globe, Bell, Search, Check, User, MessageSquare, Home, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Notification } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

function getNotificationIcon(type: string) {
  switch (type) {
    case "new_lead":
      return <User className="h-4 w-4" />;
    case "new_message":
      return <MessageSquare className="h-4 w-4" />;
    case "deal_update":
      return <DollarSign className="h-4 w-4" />;
    case "follow_up_reminder":
      return <Calendar className="h-4 w-4" />;
    case "property_update":
    case "offer_update":
      return <Home className="h-4 w-4" />;
    default:
      return <Bell className="h-4 w-4" />;
  }
}

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();

  const { data: unreadCountData } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/unread-count"],
  });

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => apiRequest(`/api/notifications/${id}/read`, { method: "PATCH" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest("/api/notifications/mark-all-read", { 
      method: "POST",
      body: JSON.stringify({ userId: "user-1" }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/unread-count"] });
    },
  });

  const unreadCount = unreadCountData?.count ?? 0;
  const recentNotifications = notifications.slice(0, 5);

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger data-testid="button-sidebar-toggle" />
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("common.search")}
            className="w-64 pl-9"
            data-testid="input-global-search"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon"
              data-testid="button-language-toggle"
            >
              <Globe className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => setLanguage("en")}
              data-testid="menu-item-english"
            >
              <span className={language === "en" ? "font-medium" : ""}>
                English
              </span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setLanguage("ar")}
              data-testid="menu-item-arabic"
            >
              <span className={language === "ar" ? "font-medium" : ""}>
                العربية
              </span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleTheme}
          data-testid="button-theme-toggle"
        >
          {theme === "light" ? (
            <Moon className="h-5 w-5" />
          ) : (
            <Sun className="h-5 w-5" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="relative"
              data-testid="button-notifications"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <div className="flex items-center justify-between px-3 py-2">
              <span className="font-semibold">{t("notifications.title")}</span>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto py-1 px-2 text-xs"
                  onClick={() => markAllReadMutation.mutate()}
                  data-testid="button-mark-all-read"
                >
                  <Check className="h-3 w-3 ltr:mr-1 rtl:ml-1" />
                  {t("notifications.markAllRead")}
                </Button>
              )}
            </div>
            <DropdownMenuSeparator />
            <ScrollArea className="h-64">
              {recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                  <Bell className="h-8 w-8 mb-2 opacity-50" />
                  <span className="text-sm">{t("notifications.noNotifications")}</span>
                </div>
              ) : (
                recentNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex gap-3 p-3 cursor-pointer ${!notification.isRead ? "bg-muted/50" : ""}`}
                    onClick={() => {
                      if (!notification.isRead) {
                        markReadMutation.mutate(notification.id);
                      }
                    }}
                    data-testid={`notification-item-${notification.id}`}
                  >
                    <div className={`flex-shrink-0 p-2 rounded-full ${!notification.isRead ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!notification.isRead ? "font-medium" : ""}`}>
                        {language === "ar" && notification.titleAr ? notification.titleAr : notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {language === "ar" && notification.messageAr ? notification.messageAr : notification.message}
                      </p>
                      {notification.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), { 
                            addSuffix: true,
                            locale: language === "ar" ? ar : enUS 
                          })}
                        </p>
                      )}
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 w-2 h-2 bg-primary rounded-full self-start mt-2" />
                    )}
                  </DropdownMenuItem>
                ))
              )}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
