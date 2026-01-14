import { useLocation, Link } from "wouter";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Handshake, 
  MessageCircle,
  BarChart3,
  FileText,
  Settings,
  ChevronDown,
  LogOut,
  ClipboardList,
  PlusCircle,
  Building,
  UserCheck
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useI18n } from "@/lib/i18n";

const mainNavItems = [
  { icon: LayoutDashboard, labelKey: "nav.dashboard", href: "/" },
  { icon: Users, labelKey: "nav.leads", href: "/leads" },
  { icon: Building2, labelKey: "nav.properties", href: "/properties" },
  { icon: Handshake, labelKey: "nav.deals", href: "/deals" },
  { icon: MessageCircle, labelKey: "nav.whatsapp", href: "/whatsapp" },
];

const offersNavItems = [
  { icon: ClipboardList, labelKey: "nav.offers", href: "/offers" },
  { icon: PlusCircle, labelKey: "nav.submitOffer", href: "/submit-offer" },
];

const adminNavItems = [
  { icon: Building, labelKey: "nav.offices", href: "/offices" },
  { icon: UserCheck, labelKey: "nav.salesAgents", href: "/sales-agents" },
];

const secondaryNavItems = [
  { icon: BarChart3, labelKey: "nav.analytics", href: "/analytics" },
  { icon: FileText, labelKey: "nav.templates", href: "/templates" },
  { icon: Settings, labelKey: "nav.settings", href: "/settings" },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { t, language } = useI18n();

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-heading font-bold text-lg">
            ع
          </div>
          <div className="flex flex-col">
            <span className="font-heading font-semibold text-lg text-sidebar-foreground">عقارك 1</span>
            <span className="text-xs text-muted-foreground">منصة التسويق العقاري</span>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => {
                const isActive = location === item.href || 
                  (item.href !== "/" && location.startsWith(item.href));
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.labelKey.split('.')[1]}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {t("offers.title")}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {offersNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.labelKey.split('.')[1]}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "الإدارة" : "Admin"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.labelKey.split('.')[1]}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-4">
            {language === "ar" ? "أدوات" : "Tools"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNavItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={isActive}
                      data-testid={`nav-${item.labelKey.split('.')[1]}`}
                    >
                      <Link href={item.href}>
                        <item.icon className="h-5 w-5" />
                        <span>{t(item.labelKey)}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button 
              className="flex w-full items-center gap-3 rounded-lg p-2 hover-elevate transition-colors"
              data-testid="button-user-menu"
            >
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                  AM
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-sm">
                <span className="font-medium text-sidebar-foreground">Ahmed Mohammed</span>
                <span className="text-xs text-muted-foreground">Sales Agent</span>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem data-testid="menu-item-settings">
              <Settings className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("nav.settings")}
            </DropdownMenuItem>
            <DropdownMenuItem data-testid="menu-item-logout">
              <LogOut className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
