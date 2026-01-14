import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { PropertyRequest, PropertyOffer } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Plus, MapPin, Home, Building2, DollarSign, Maximize, Bed, Bath, Check, Clock, X, Eye } from "lucide-react";

const requestFormSchema = z.object({
  propertyType: z.string().min(1, "Property type is required"),
  listingType: z.enum(["sale", "rent"]),
  city: z.string().min(1, "City is required"),
  district: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().min(1, "Maximum price is required"),
  minArea: z.string().optional(),
  maxArea: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  propertyCondition: z.string().optional(),
  clientName: z.string().optional(),
  clientPhone: z.string().optional(),
  notes: z.string().optional(),
});

type RequestFormValues = z.infer<typeof requestFormSchema>;

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

const propertyTypes = [
  { value: "apartment", labelEn: "Apartment", labelAr: "شقة" },
  { value: "villa", labelEn: "Villa", labelAr: "فيلا" },
  { value: "townhouse", labelEn: "Townhouse", labelAr: "تاون هاوس" },
  { value: "office", labelEn: "Office", labelAr: "مكتب" },
  { value: "retail", labelEn: "Retail", labelAr: "محل تجاري" },
  { value: "land", labelEn: "Land", labelAr: "أرض" },
];

const propertyConditions = [
  { value: "ready", labelEn: "Ready", labelAr: "جاهز" },
  { value: "under_construction", labelEn: "Under Construction", labelAr: "قيد الإنشاء" },
  { value: "off_plan", labelEn: "Off Plan", labelAr: "على الخارطة" },
];

function RequestCard({ request }: { request: PropertyRequest }) {
  const { t, language } = useI18n();
  const cityLabel = saudiCities.find(c => c.value === request.city);
  const typeLabel = propertyTypes.find(p => p.value === request.propertyType);

  const statusBadgeVariant: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
    active: "secondary",
    matched: "default",
    fulfilled: "default",
    expired: "destructive",
    cancelled: "outline",
  };

  const statusLabels: Record<string, { en: string; ar: string }> = {
    active: { en: "Active", ar: "نشط" },
    matched: { en: "Matched", ar: "تم المطابقة" },
    fulfilled: { en: "Fulfilled", ar: "تم التنفيذ" },
    expired: { en: "Expired", ar: "منتهي" },
    cancelled: { en: "Cancelled", ar: "ملغي" },
  };

  return (
    <Card className="hover-elevate" data-testid={`card-request-${request.id}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base">
                {language === "ar" && typeLabel ? typeLabel.labelAr : typeLabel?.labelEn || request.propertyType}
              </CardTitle>
              <CardDescription className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {language === "ar" && cityLabel ? cityLabel.labelAr : cityLabel?.labelEn || request.city}
                {request.district && ` - ${request.district}`}
              </CardDescription>
            </div>
          </div>
          <Badge variant={statusBadgeVariant[request.status] || "secondary"}>
            {statusLabels[request.status]?.[language] || request.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2 text-sm">
          <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
            <DollarSign className="h-3 w-3 text-muted-foreground" />
            <span dir="ltr">
              {request.minPrice ? `${parseInt(request.minPrice).toLocaleString()} - ` : ""}
              {parseInt(request.maxPrice).toLocaleString()} SAR
            </span>
          </div>
          {request.bedrooms && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
              <Bed className="h-3 w-3 text-muted-foreground" />
              <span>{request.bedrooms}</span>
            </div>
          )}
          {request.bathrooms && (
            <div className="flex items-center gap-1 bg-muted px-2 py-1 rounded">
              <Bath className="h-3 w-3 text-muted-foreground" />
              <span>{request.bathrooms}</span>
            </div>
          )}
        </div>

        {request.clientName && (
          <div className="text-sm text-muted-foreground">
            {t("matching.client")}: {request.clientName}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-sm">
            {request.matchCount && request.matchCount > 0 ? (
              <>
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-green-600">
                  {request.matchCount} {t("matching.matchesFound")}
                </span>
              </>
            ) : (
              <>
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{t("matching.searching")}</span>
              </>
            )}
          </div>
          {request.matchCount && request.matchCount > 0 && (
            <Link href={`/property-requests/${request.id}/matches`}>
              <Button size="sm" variant="outline" data-testid={`button-view-matches-${request.id}`}>
                <Eye className="h-4 w-4 ltr:mr-1 rtl:ml-1" />
                {t("matching.viewMatches")}
              </Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RequestsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function PropertyRequests() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: requests, isLoading } = useQuery<PropertyRequest[]>({
    queryKey: ["/api/property-requests"],
  });

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(requestFormSchema),
    defaultValues: {
      propertyType: "",
      listingType: "sale",
      city: "",
      district: "",
      minPrice: "",
      maxPrice: "",
      minArea: "",
      maxArea: "",
      bedrooms: "",
      bathrooms: "",
      propertyCondition: "",
      clientName: "",
      clientPhone: "",
      notes: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: RequestFormValues) => {
      return apiRequest("POST", "/api/property-requests", {
        ...data,
        minPrice: data.minPrice || undefined,
        minArea: data.minArea ? parseInt(data.minArea) : undefined,
        maxArea: data.maxArea ? parseInt(data.maxArea) : undefined,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : undefined,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : undefined,
        propertyCondition: data.propertyCondition || undefined,
        clientName: data.clientName || undefined,
        clientPhone: data.clientPhone || undefined,
        notes: data.notes || undefined,
      });
    },
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/property-requests"] });
      setDialogOpen(false);
      form.reset();
      
      if (data.matchCount > 0) {
        toast({
          title: language === "ar" ? "العقار المطلوب متوفر!" : "Property Available!",
          description: language === "ar" 
            ? `تم العثور على ${data.matchCount} عقار مطابق لطلبك` 
            : `Found ${data.matchCount} matching properties for your request`,
        });
      } else {
        toast({
          title: language === "ar" ? "تم إنشاء الطلب" : "Request Created",
          description: language === "ar" 
            ? "سيتم إشعارك عند توفر عقار مطابق" 
            : "You'll be notified when a matching property is available",
        });
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create request",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RequestFormValues) => {
    createMutation.mutate(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold" data-testid="text-requests-title">
            {t("matching.title")}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t("matching.description")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-request">
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("matching.newRequest")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("matching.newRequest")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="propertyType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.propertyType")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-property-type">
                              <SelectValue placeholder={t("matching.selectType")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {propertyTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value} data-testid={`option-type-${type.value}`}>
                                {language === "ar" ? type.labelAr : type.labelEn}
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
                    name="listingType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.listingType")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-listing-type">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sale">{language === "ar" ? "بيع" : "Sale"}</SelectItem>
                            <SelectItem value="rent">{language === "ar" ? "إيجار" : "Rent"}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.city")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-city">
                              <SelectValue placeholder={t("matching.selectCity")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {saudiCities.map((city) => (
                              <SelectItem key={city.value} value={city.value} data-testid={`option-city-${city.value}`}>
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
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.district")}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-district" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="minPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.minPrice")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" dir="ltr" data-testid="input-min-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.maxPrice")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" dir="ltr" data-testid="input-max-price" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bedrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.bedrooms")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" data-testid="input-bedrooms" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bathrooms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.bathrooms")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" data-testid="input-bathrooms" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="propertyCondition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("matching.condition")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-condition">
                              <SelectValue placeholder={t("matching.anyCondition")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {propertyConditions.map((cond) => (
                              <SelectItem key={cond.value} value={cond.value} data-testid={`option-condition-${cond.value}`}>
                                {language === "ar" ? cond.labelAr : cond.labelEn}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">{t("matching.clientInfo")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="clientName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("matching.clientName")}</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-client-name" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clientPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("matching.clientPhone")}</FormLabel>
                          <FormControl>
                            <Input {...field} dir="ltr" type="tel" data-testid="input-client-phone" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("matching.notes")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} data-testid="input-notes" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    {t("common.cancel")}
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-request">
                    <Search className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                    {t("matching.searchProperties")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <RequestsSkeleton />
      ) : !requests?.length ? (
        <Card className="p-12 text-center">
          <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("matching.noRequests")}</h3>
          <p className="text-muted-foreground mb-4">{t("matching.createFirst")}</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("matching.newRequest")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {requests.map((request) => (
            <RequestCard key={request.id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
}
