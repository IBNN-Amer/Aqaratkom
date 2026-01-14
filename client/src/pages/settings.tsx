import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Moon, Sun, Globe, Bell, User, Lock, Palette, MessageCircle, Link2, RefreshCw, Plus, Trash2, CheckCircle, XCircle, Settings as SettingsIcon, Loader2 } from "lucide-react";
import { SiSalesforce, SiHubspot } from "react-icons/si";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";
import type { CrmIntegration } from "@shared/schema";

const crmIntegrationSchema = z.object({
  provider: z.enum(["salesforce", "hubspot", "zoho"]),
  name: z.string().min(1, "Name is required"),
  apiKey: z.string().optional(),
  instanceUrl: z.string().optional(),
  syncMode: z.enum(["one_way_import", "one_way_export", "two_way"]),
  syncEntities: z.array(z.string()).optional(),
});

type CrmIntegrationFormValues = z.infer<typeof crmIntegrationSchema>;

const providerInfo = {
  salesforce: {
    name: "Salesforce",
    nameAr: "سيلزفورس",
    description: "Connect to Salesforce CRM to sync leads, contacts, and opportunities",
    descriptionAr: "اتصل بـ Salesforce CRM لمزامنة العملاء المحتملين وجهات الاتصال والفرص",
    icon: SiSalesforce,
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
  },
  hubspot: {
    name: "HubSpot",
    nameAr: "هب سبوت",
    description: "Sync your contacts and deals with HubSpot CRM",
    descriptionAr: "قم بمزامنة جهات الاتصال والصفقات مع HubSpot CRM",
    icon: SiHubspot,
    color: "text-orange-500",
    bgColor: "bg-orange-500/10",
  },
  zoho: {
    name: "Zoho CRM",
    nameAr: "زوهو",
    description: "Integrate with Zoho CRM for complete data synchronization",
    descriptionAr: "التكامل مع Zoho CRM لمزامنة البيانات الكاملة",
    icon: SettingsIcon,
    color: "text-red-500",
    bgColor: "bg-red-500/10",
  },
};

function CrmIntegrationCard({ 
  integration, 
  onSync, 
  onTest, 
  onDelete,
  isSyncing,
  isTesting 
}: { 
  integration: CrmIntegration;
  onSync: () => void;
  onTest: () => void;
  onDelete: () => void;
  isSyncing: boolean;
  isTesting: boolean;
}) {
  const { language } = useI18n();
  const provider = providerInfo[integration.provider as keyof typeof providerInfo];
  const Icon = provider?.icon || SettingsIcon;
  
  return (
    <Card data-testid={`card-integration-${integration.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${provider?.bgColor}`}>
              <Icon className={`h-6 w-6 ${provider?.color}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{integration.name}</CardTitle>
              <CardDescription>
                {language === "ar" ? provider?.nameAr : provider?.name}
              </CardDescription>
            </div>
          </div>
          <Badge variant={integration.isActive ? "default" : "secondary"}>
            {integration.isActive 
              ? (language === "ar" ? "نشط" : "Active") 
              : (language === "ar" ? "غير نشط" : "Inactive")}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === "ar" ? "وضع المزامنة" : "Sync Mode"}
          </span>
          <Badge variant="outline">
            {integration.syncMode === "one_way_import" && (language === "ar" ? "استيراد فقط" : "Import Only")}
            {integration.syncMode === "one_way_export" && (language === "ar" ? "تصدير فقط" : "Export Only")}
            {integration.syncMode === "two_way" && (language === "ar" ? "ثنائي الاتجاه" : "Two-Way")}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {language === "ar" ? "آخر مزامنة" : "Last Sync"}
          </span>
          <span>
            {integration.lastSyncAt 
              ? formatDistanceToNow(new Date(integration.lastSyncAt), { 
                  addSuffix: true, 
                  locale: language === "ar" ? ar : enUS 
                })
              : (language === "ar" ? "لم تتم المزامنة بعد" : "Never synced")}
          </span>
        </div>

        {integration.lastSyncStatus && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {language === "ar" ? "حالة المزامنة" : "Sync Status"}
            </span>
            <div className="flex items-center gap-1">
              {integration.lastSyncStatus === "success" ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-green-600">{language === "ar" ? "نجحت" : "Success"}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-600">{language === "ar" ? "فشلت" : "Failed"}</span>
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex gap-2 flex-wrap">
        <Button 
          size="sm" 
          onClick={onSync}
          disabled={isSyncing}
          data-testid={`button-sync-${integration.id}`}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
          ) : (
            <RefreshCw className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          )}
          {language === "ar" ? "مزامنة الآن" : "Sync Now"}
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onTest}
          disabled={isTesting}
          data-testid={`button-test-${integration.id}`}
        >
          {isTesting ? (
            <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />
          ) : (
            <Link2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          )}
          {language === "ar" ? "اختبار الاتصال" : "Test Connection"}
        </Button>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onDelete}
          data-testid={`button-delete-${integration.id}`}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </CardFooter>
    </Card>
  );
}

function AddIntegrationDialog({ onSuccess }: { onSuccess: () => void }) {
  const { language } = useI18n();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  const form = useForm<CrmIntegrationFormValues>({
    resolver: zodResolver(crmIntegrationSchema),
    defaultValues: {
      provider: "salesforce",
      name: "",
      apiKey: "",
      instanceUrl: "",
      syncMode: "one_way_import",
      syncEntities: ["leads"],
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CrmIntegrationFormValues) => 
      apiRequest("POST", "/api/crm-integrations", {
        ...data,
        userId: "user-1",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm-integrations"] });
      toast({
        title: language === "ar" ? "تم إضافة التكامل بنجاح" : "Integration added successfully",
      });
      setOpen(false);
      form.reset();
      onSuccess();
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشل إضافة التكامل" : "Failed to add integration",
        variant: "destructive",
      });
    },
  });

  const selectedProvider = form.watch("provider");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button data-testid="button-add-integration">
          <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "إضافة تكامل" : "Add Integration"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-heading">
            {language === "ar" ? "إضافة تكامل CRM جديد" : "Add New CRM Integration"}
          </DialogTitle>
          <DialogDescription>
            {language === "ar" 
              ? "قم بتوصيل نظام CRM خارجي لمزامنة بياناتك" 
              : "Connect an external CRM system to sync your data"}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createMutation.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "ar" ? "مزود الخدمة" : "Provider"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-provider">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="salesforce">
                        <div className="flex items-center gap-2">
                          <SiSalesforce className="h-4 w-4 text-blue-500" />
                          Salesforce
                        </div>
                      </SelectItem>
                      <SelectItem value="hubspot">
                        <div className="flex items-center gap-2">
                          <SiHubspot className="h-4 w-4 text-orange-500" />
                          HubSpot
                        </div>
                      </SelectItem>
                      <SelectItem value="zoho">
                        <div className="flex items-center gap-2">
                          <SettingsIcon className="h-4 w-4 text-red-500" />
                          Zoho CRM
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "ar" ? "اسم الاتصال" : "Connection Name"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder={language === "ar" ? "مثال: حساب Salesforce الرئيسي" : "e.g., Main Salesforce Account"}
                      {...field}
                      data-testid="input-integration-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProvider === "salesforce" && (
              <FormField
                control={form.control}
                name="instanceUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "رابط المثيل" : "Instance URL"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://your-org.salesforce.com"
                        {...field}
                        data-testid="input-instance-url"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "ar" ? "مفتاح API" : "API Key"}</FormLabel>
                  <FormControl>
                    <Input 
                      type="password"
                      placeholder={language === "ar" ? "أدخل مفتاح API الخاص بك" : "Enter your API key"}
                      {...field}
                      data-testid="input-api-key"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="syncMode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{language === "ar" ? "وضع المزامنة" : "Sync Mode"}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-sync-mode">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="one_way_import">
                        {language === "ar" ? "استيراد فقط (من CRM إلى عقارك)" : "Import Only (CRM → Aqarak)"}
                      </SelectItem>
                      <SelectItem value="one_way_export">
                        {language === "ar" ? "تصدير فقط (من عقارك إلى CRM)" : "Export Only (Aqarak → CRM)"}
                      </SelectItem>
                      <SelectItem value="two_way">
                        {language === "ar" ? "مزامنة ثنائية الاتجاه" : "Two-Way Sync"}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                {language === "ar" ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" disabled={createMutation.isPending} data-testid="button-save-integration">
                {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin ltr:mr-2 rtl:ml-2" />}
                {language === "ar" ? "إضافة التكامل" : "Add Integration"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

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
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);

  const { data: integrations = [], isLoading: integrationsLoading } = useQuery<CrmIntegration[]>({
    queryKey: ["/api/crm-integrations"],
  });

  const syncMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm-integrations/${id}/sync`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm-integrations"] });
      toast({
        title: language === "ar" ? "تمت المزامنة بنجاح" : "Sync completed successfully",
      });
      setSyncingId(null);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشلت المزامنة" : "Sync failed",
        variant: "destructive",
      });
      setSyncingId(null);
    },
  });

  const testMutation = useMutation({
    mutationFn: (id: string) => apiRequest("POST", `/api/crm-integrations/${id}/test`, {}),
    onSuccess: () => {
      toast({
        title: language === "ar" ? "الاتصال ناجح" : "Connection successful",
        description: language === "ar" ? "تم التحقق من الاتصال بنجاح" : "Connection verified successfully",
      });
      setTestingId(null);
    },
    onError: () => {
      toast({
        title: language === "ar" ? "فشل الاتصال" : "Connection failed",
        variant: "destructive",
      });
      setTestingId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/crm-integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/crm-integrations"] });
      toast({
        title: language === "ar" ? "تم حذف التكامل" : "Integration deleted",
      });
    },
  });

  const handleSave = () => {
    toast({ title: "Settings saved successfully" });
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold font-heading">{t("nav.settings")}</h1>
        <p className="text-muted-foreground mt-1">
          {language === "ar" ? "إدارة حسابك وتفضيلات التطبيق" : "Manage your account and application preferences"}
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="general" data-testid="tab-general">
            <Palette className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {language === "ar" ? "عام" : "General"}
          </TabsTrigger>
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {language === "ar" ? "الملف الشخصي" : "Profile"}
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {language === "ar" ? "الإشعارات" : "Notifications"}
          </TabsTrigger>
          <TabsTrigger value="integrations" data-testid="tab-integrations">
            <Link2 className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {language === "ar" ? "التكاملات" : "Integrations"}
          </TabsTrigger>
          <TabsTrigger value="whatsapp" data-testid="tab-whatsapp">
            <MessageCircle className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            WhatsApp
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "المظهر" : "Appearance"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "تخصيص مظهر التطبيق" : "Customize how the application looks and feels"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{language === "ar" ? "السمة" : "Theme"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "اختر نظام الألوان المفضل" : "Select your preferred color scheme"}
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
                    {language === "ar" ? "فاتح" : "Light"}
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                    data-testid="button-theme-dark"
                  >
                    <Moon className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {language === "ar" ? "داكن" : "Dark"}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{language === "ar" ? "اللغة" : "Language"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "اختر لغتك المفضلة" : "Choose your preferred language"}
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
              <CardTitle className="text-lg">{language === "ar" ? "معلومات الملف الشخصي" : "Profile Information"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "تحديث معلوماتك الشخصية" : "Update your personal information"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{language === "ar" ? "الاسم الأول" : "First Name"}</Label>
                  <Input 
                    id="firstName" 
                    defaultValue="Ahmed" 
                    data-testid="input-first-name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{language === "ar" ? "اسم العائلة" : "Last Name"}</Label>
                  <Input 
                    id="lastName" 
                    defaultValue="Mohammed" 
                    data-testid="input-last-name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{language === "ar" ? "البريد الإلكتروني" : "Email"}</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="ahmed@aqarak.sa" 
                  data-testid="input-email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{language === "ar" ? "الهاتف" : "Phone"}</Label>
                <Input 
                  id="phone" 
                  defaultValue="+966 50 123 4567" 
                  data-testid="input-phone"
                />
              </div>

              <Button onClick={handleSave} data-testid="button-save-profile">
                {language === "ar" ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "الأمان" : "Security"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "إدارة كلمة المرور وإعدادات الأمان" : "Manage your password and security settings"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">{language === "ar" ? "كلمة المرور الحالية" : "Current Password"}</Label>
                <Input 
                  id="currentPassword" 
                  type="password" 
                  data-testid="input-current-password"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{language === "ar" ? "كلمة المرور الجديدة" : "New Password"}</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    data-testid="input-new-password"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{language === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    data-testid="input-confirm-password"
                  />
                </div>
              </div>

              <Button variant="outline" data-testid="button-update-password">
                <Lock className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {language === "ar" ? "تحديث كلمة المرور" : "Update Password"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "تفضيلات الإشعارات" : "Notification Preferences"}</CardTitle>
              <CardDescription>
                {language === "ar" ? "اختر الإشعارات التي تريد استلامها" : "Choose what notifications you want to receive"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{language === "ar" ? "تنبيهات العملاء الجدد" : "New Lead Alerts"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "احصل على إشعار عند وصول عميل جديد" : "Get notified when a new lead comes in"}
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
                  <Label className="text-base">{language === "ar" ? "الرسائل الجديدة" : "New Messages"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "احصل على إشعار عند استلام رسالة واتساب" : "Get notified when you receive a WhatsApp message"}
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
                  <Label className="text-base">{language === "ar" ? "تحديثات الصفقات" : "Deal Updates"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "احصل على إشعار عند تغيير حالة صفقة" : "Get notified when a deal status changes"}
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
                  <Label className="text-base">{language === "ar" ? "التقرير اليومي" : "Daily Report"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "استلم ملخص يومي لنشاطاتك" : "Receive a daily summary of your activities"}
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

        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <CardTitle className="text-lg">{language === "ar" ? "تكاملات CRM" : "CRM Integrations"}</CardTitle>
                  <CardDescription>
                    {language === "ar" 
                      ? "قم بتوصيل أنظمة CRM الخارجية لمزامنة البيانات" 
                      : "Connect external CRM systems to synchronize data"}
                  </CardDescription>
                </div>
                <AddIntegrationDialog onSuccess={() => {}} />
              </div>
            </CardHeader>
            <CardContent>
              {integrationsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : integrations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="font-medium mb-2">
                    {language === "ar" ? "لا توجد تكاملات" : "No integrations yet"}
                  </h3>
                  <p className="text-sm">
                    {language === "ar" 
                      ? "أضف تكامل CRM لبدء مزامنة البيانات" 
                      : "Add a CRM integration to start syncing data"}
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {integrations.map((integration) => (
                    <CrmIntegrationCard
                      key={integration.id}
                      integration={integration}
                      onSync={() => {
                        setSyncingId(integration.id);
                        syncMutation.mutate(integration.id);
                      }}
                      onTest={() => {
                        setTestingId(integration.id);
                        testMutation.mutate(integration.id);
                      }}
                      onDelete={() => deleteMutation.mutate(integration.id)}
                      isSyncing={syncingId === integration.id}
                      isTesting={testingId === integration.id}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "مزودي الخدمة المتاحين" : "Available Providers"}</CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "أنظمة CRM المدعومة للتكامل" 
                  : "Supported CRM systems for integration"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {Object.entries(providerInfo).map(([key, provider]) => {
                  const Icon = provider.icon;
                  return (
                    <div key={key} className="flex items-start gap-3 p-4 rounded-lg border">
                      <div className={`p-2 rounded-lg ${provider.bgColor}`}>
                        <Icon className={`h-5 w-5 ${provider.color}`} />
                      </div>
                      <div>
                        <h4 className="font-medium">{provider.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {language === "ar" ? provider.descriptionAr : provider.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="whatsapp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">WhatsApp Business API</CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "تكوين اتصال WhatsApp Business API" 
                  : "Configure your WhatsApp Business API connection"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="wabaId">{language === "ar" ? "معرف حساب واتساب للأعمال" : "WhatsApp Business Account ID"}</Label>
                <Input 
                  id="wabaId" 
                  placeholder={language === "ar" ? "أدخل معرف WABA" : "Enter your WABA ID"}
                  data-testid="input-waba-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumberId">{language === "ar" ? "معرف رقم الهاتف" : "Phone Number ID"}</Label>
                <Input 
                  id="phoneNumberId" 
                  placeholder={language === "ar" ? "أدخل معرف رقم الهاتف" : "Enter your phone number ID"}
                  data-testid="input-phone-number-id"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="accessToken">{language === "ar" ? "رمز الوصول" : "Access Token"}</Label>
                <Input 
                  id="accessToken" 
                  type="password"
                  placeholder={language === "ar" ? "أدخل رمز الوصول" : "Enter your access token"}
                  data-testid="input-access-token"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} data-testid="button-save-whatsapp">
                  {language === "ar" ? "حفظ الإعدادات" : "Save Configuration"}
                </Button>
                <Button variant="outline" data-testid="button-test-connection">
                  {language === "ar" ? "اختبار الاتصال" : "Test Connection"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{language === "ar" ? "إعدادات الرد التلقائي" : "Auto-Response Settings"}</CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "تكوين الردود التلقائية للرسائل الواردة" 
                  : "Configure automated responses for incoming messages"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{language === "ar" ? "الرد التلقائي خارج ساعات العمل" : "Auto-Reply Outside Business Hours"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "الرد تلقائياً عندما تكون غير متاح" : "Automatically respond when you're away"}
                  </p>
                </div>
                <Switch data-testid="switch-auto-reply" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">{language === "ar" ? "رسالة ترحيب للعملاء الجدد" : "Welcome Message for New Leads"}</Label>
                  <p className="text-sm text-muted-foreground">
                    {language === "ar" ? "إرسال رسالة ترحيب تلقائية للعملاء الجدد" : "Send an automatic welcome message to new leads"}
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
