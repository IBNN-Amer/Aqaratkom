import { useState } from "react";
import { Moon, Sun, Globe, Bell, User, Lock, Palette, MessageCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "@/lib/theme";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { t, language, setLanguage } = useI18n();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState({
    newLead: true,
    newMessage: true,
    dealUpdates: true,
    dailyReport: false,
  });

  const handleSave = () => {
    toast({ title: "Settings saved successfully" });
  };

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t("nav.settings")}</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account and application preferences
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general" data-testid="tab-general">
            <Palette className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="whatsapp" data-testid="tab-whatsapp">
            <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks and feels
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Select your preferred color scheme
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                    data-testid="button-theme-light"
                  >
                    <Sun className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    data-testid="button-theme-dark"
                  >
                    <Moon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    Dark
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Language</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose your preferred language
                  </p>
                </div>
                <Select value={language} onValueChange={(v) => setLanguage(v as "en" | "ar")}>
                  <SelectTrigger className="w-[180px]" data-testid="select-language">
                    <Globe className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Information</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    defaultValue="Ahmed" 
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    defaultValue="Mohammed" 
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="ahmed@propflow.ae" 
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone" 
                  defaultValue="+971 50 123 4567" 
                  data-testid="input-phone"
                />
              </div>

              <Button onClick={handleSave} data-testid="button-save-profile">
                Save Changes
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Security</CardTitle>
              <CardDescription>
                Manage your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  data-testid="input-current-password"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <Button variant="outline" data-testid="button-update-password">
                <Lock className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Preferences</CardTitle>
              <CardDescription>
                Choose what notifications you want to receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Lead Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a new lead comes in
                  </p>
                </div>
                <Switch
                  checked={notifications.newLead}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, newLead: checked })
                  }
                  data-testid="switch-new-lead"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">New Messages</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when you receive a WhatsApp message
                  </p>
                </div>
                <Switch
                  checked={notifications.newMessage}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, newMessage: checked })
                  }
                  data-testid="switch-new-message"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Deal Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when a deal status changes
                  </p>
                </div>
                <Switch
                  checked={notifications.dealUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, dealUpdates: checked })
                  }
                  data-testid="switch-deal-updates"
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Daily Report</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive a daily summary of your activities
                  </p>
                </div>
                <Switch
                  checked={notifications.dailyReport}
                  onCheckedChange={(checked) => 
                    setNotifications({ ...notifications, dailyReport: checked })
                  }
                  data-testid="switch-daily-report"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
              <CardDescription>
                Configure your WhatsApp Business API connection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wabaId">WhatsApp Business Account ID</Label>
                <Input 
                  id="wabaId" 
                  placeholder="Enter your WABA ID" 
                  data-testid="input-waba-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">Phone Number ID</Label>
                <Input 
                  id="phoneNumberId" 
                  placeholder="Enter your phone number ID" 
                  data-testid="input-phone-number-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <Input 
                  id="accessToken" 
                  type="password"
                  placeholder="Enter your access token" 
                  data-testid="input-access-token"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} data-testid="button-save-whatsapp">
                  Save Configuration
                </Button>
                <Button variant="outline" data-testid="button-test-connection">
                  Test Connection
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Auto-Response Settings</CardTitle>
              <CardDescription>
                Configure automated responses for incoming messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Auto-Reply Outside Business Hours</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically respond when you&apos;re away
                  </p>
                </div>
                <Switch data-testid="switch-auto-reply" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Welcome Message for New Leads</Label>
                  <p className="text-sm text-muted-foreground">
                    Send an automatic welcome message to new leads
                  </p>
                </div>
                <Switch defaultChecked data-testid="switch-welcome-message" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
