import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { RealEstateOffice, SalesAgent } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Plus, Phone, Mail, MapPin, Users, Home, Edit, Trash2 } from "lucide-react";

const officeFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  addressAr: z.string().optional(),
  city: z.string().optional(),
  licenseNumber: z.string().optional(),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
});

type OfficeFormValues = z.infer<typeof officeFormSchema>;

const saudiCities = [
  { value: "riyadh", labelEn: "Riyadh", labelAr: "الرياض" },
  { value: "jeddah", labelEn: "Jeddah", labelAr: "جدة" },
  { value: "makkah", labelEn: "Makkah", labelAr: "مكة المكرمة" },
  { value: "madinah", labelEn: "Madinah", labelAr: "المدينة المنورة" },
  { value: "dammam", labelEn: "Dammam", labelAr: "الدمام" },
  { value: "khobar", labelEn: "Khobar", labelAr: "الخبر" },
  { value: "dhahran", labelEn: "Dhahran", labelAr: "الظهران" },
  { value: "tabuk", labelEn: "Tabuk", labelAr: "تبوك" },
  { value: "abha", labelEn: "Abha", labelAr: "أبها" },
  { value: "taif", labelEn: "Taif", labelAr: "الطائف" },
  { value: "jubail", labelEn: "Jubail", labelAr: "الجبيل" },
  { value: "yanbu", labelEn: "Yanbu", labelAr: "ينبع" },
];

function OfficeCard({ office, agentsCount }: { office: RealEstateOffice; agentsCount: number }) {
  const { t, language } = useI18n();
  const officeName = language === "ar" && office.nameAr ? office.nameAr : office.name;
  const officeAddress = language === "ar" && office.addressAr ? office.addressAr : office.address;
  const cityLabel = office.city ? saudiCities.find(c => c.value === office.city) : null;

  return (
    <Card className="hover-elevate" data-testid={`card-office-${office.id}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold">{officeName}</CardTitle>
            {cityLabel && (
              <span className="text-sm text-muted-foreground">
                {language === "ar" ? cityLabel.labelAr : cityLabel.labelEn}
              </span>
            )}
          </div>
        </div>
        <Badge variant={office.isActive ? "default" : "secondary"}>
          {office.isActive ? (language === "ar" ? "نشط" : "Active") : (language === "ar" ? "غير نشط" : "Inactive")}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span dir="ltr">{office.phone}</span>
        </div>
        {office.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{office.email}</span>
          </div>
        )}
        {officeAddress && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{officeAddress}</span>
          </div>
        )}
        {office.licenseNumber && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">{t("offices.license")}:</span> {office.licenseNumber}
          </div>
        )}
        <div className="flex gap-4 pt-2 border-t">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span>{agentsCount} {t("offices.agents")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OfficesSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-12 w-12 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function Offices() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: offices, isLoading: officesLoading } = useQuery<RealEstateOffice[]>({
    queryKey: ["/api/offices"],
  });

  const { data: agents } = useQuery<SalesAgent[]>({
    queryKey: ["/api/sales-agents"],
  });

  const form = useForm<OfficeFormValues>({
    resolver: zodResolver(officeFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      phone: "",
      email: "",
      whatsapp: "",
      address: "",
      addressAr: "",
      city: "",
      licenseNumber: "",
      description: "",
      descriptionAr: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: OfficeFormValues) => {
      return apiRequest("POST", "/api/offices", {
        ...data,
        email: data.email || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/offices"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: language === "ar" ? "تم إنشاء المكتب" : "Office created",
        description: language === "ar" ? "تم إضافة المكتب العقاري بنجاح" : "Real estate office added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create office",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfficeFormValues) => {
    createMutation.mutate(data);
  };

  const getAgentsCount = (officeId: string) => {
    return agents?.filter(a => a.officeId === officeId).length || 0;
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-heading font-bold" data-testid="text-offices-title">
          {t("offices.title")}
        </h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-office">
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("offices.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("offices.new")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.name")} (English)</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-office-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="nameAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.name")} (العربية)</FormLabel>
                        <FormControl>
                          <Input {...field} dir="rtl" data-testid="input-office-name-ar" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.phone")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" type="tel" data-testid="input-office-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.email")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" dir="ltr" data-testid="input-office-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.whatsapp")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" data-testid="input-office-whatsapp" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.city")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-office-city">
                              <SelectValue placeholder={t("offices.city")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {saudiCities.map((city) => (
                              <SelectItem key={city.value} value={city.value}>
                                {language === "ar" ? city.labelAr : city.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="licenseNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offices.license")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" data-testid="input-office-license" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offices.address")} (English)</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-office-address" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="addressAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offices.address")} (العربية)</FormLabel>
                      <FormControl>
                        <Input {...field} dir="rtl" data-testid="input-office-address-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-office">
                    {t("common.save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {officesLoading ? (
        <OfficesSkeleton />
      ) : !offices?.length ? (
        <Card className="p-12 text-center">
          <Building2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("offices.noOffices")}</h3>
          <p className="text-muted-foreground mb-4">{t("offices.addFirst")}</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("offices.new")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {offices.map((office) => (
            <OfficeCard key={office.id} office={office} agentsCount={getAgentsCount(office.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
