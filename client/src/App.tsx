import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { AppSidebar } from "@/components/app-sidebar";
import { Header } from "@/components/header";
import Dashboard from "@/pages/dashboard";
import Leads from "@/pages/leads";
import Properties from "@/pages/properties";
import Deals from "@/pages/deals";
import WhatsApp from "@/pages/whatsapp";
import Analytics from "@/pages/analytics";
import Templates from "@/pages/templates";
import Settings from "@/pages/settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/leads" component={Leads} />
      <Route path="/properties" component={Properties} />
      <Route path="/deals" component={Deals} />
      <Route path="/whatsapp" component={WhatsApp} />
      <Route path="/analytics" component={Analytics} />
      <Route path="/templates" component={Templates} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const sidebarStyle = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3.5rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <I18nProvider>
          <TooltipProvider>
            <SidebarProvider style={sidebarStyle as React.CSSProperties}>
              <div className="flex h-screen w-full overflow-hidden">
                <AppSidebar />
                <SidebarInset className="flex flex-col flex-1 overflow-hidden">
                  <Header />
                  <main className="flex-1 overflow-auto">
                    <Router />
                  </main>
                </SidebarInset>
              </div>
            </SidebarProvider>
            <Toaster />
          </TooltipProvider>
        </I18nProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
