import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Building2, Send, ArrowRight, ArrowLeft } from "lucide-react";

const offerFormSchema = z.object({
  city: z.string().min(1, "City is required"),
  district: z.string().min(1, "District is required"),
  districtAr: z.string().optional(),
  propertyType: z.enum(["residential", "commercial", "investment"]),
  listingType: z.enum(["sale", "rent"]),
  price: z.string().min(1, "Price is required"),
  area: z.coerce.number().min(1, "Area is required"),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  falLicenseNumber: z.string().optional(),
  brokerName: z.string().min(1, "Broker name is required"),
  brokerPhone: z.string().min(1, "Phone number is required"),
  brokerEmail: z.string().email().optional().or(z.literal("")),
  developerName: z.string().optional(),
  propertyCondition: z.enum(["ready", "under_construction", "off_plan"]),
  description: z.string().optional(),
  descriptionAr: z.string().optional(),
});

type OfferFormValues = z.infer<typeof offerFormSchema>;

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

export default function SubmitOffer() {
  const { t, language, direction } = useI18n();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const form = useForm<OfferFormValues>({
    resolver: zodResolver(offerFormSchema),
    defaultValues: {
      city: "",
      district: "",
      districtAr: "",
      propertyType: "residential",
      listingType: "sale",
      price: "",
      area: 0,
      bedrooms: undefined,
      bathrooms: undefined,
      falLicenseNumber: "",
      brokerName: "",
      brokerPhone: "",
      brokerEmail: "",
      developerName: "",
      propertyCondition: "ready",
      description: "",
      descriptionAr: "",
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: OfferFormValues) => {
      const selectedCity = saudiCities.find((c) => c.value === data.city);
      return apiRequest("POST", "/api/property-offers", {
        ...data,
        cityAr: selectedCity?.labelAr,
        brokerEmail: data.brokerEmail || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/property-offers"] });
      toast({
        title: t("offers.submitForReview"),
        description: language === "ar" 
          ? "تم إرسال العرض للمراجعة بنجاح" 
          : "Your offer has been submitted for review",
      });
      setLocation("/offers");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit offer",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OfferFormValues) => {
    submitMutation.mutate(data);
  };

  const ArrowIcon = direction === "rtl" ? ArrowLeft : ArrowRight;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <CardTitle data-testid="text-submit-offer-title">{t("offers.submit")}</CardTitle>
              <CardDescription>
                {language === "ar" 
                  ? "أدخل بيانات العقار لتقديم عرض جديد"
                  : "Enter property details to submit a new offer"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.city")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-city">
                            <SelectValue placeholder={t("offers.city")} />
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
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.district")}</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-district" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="propertyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.propertyType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-property-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="residential">{t("offers.residential")}</SelectItem>
                          <SelectItem value="commercial">{t("offers.commercial")}</SelectItem>
                          <SelectItem value="investment">{t("offers.investment")}</SelectItem>
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
                      <FormLabel>{t("offers.listingType")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-listing-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="sale">{t("offers.sale")}</SelectItem>
                          <SelectItem value="rent">{t("offers.rent")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.price")} (SAR)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-price" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="area"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.area")}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-area" />
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
                      <FormLabel>{t("offers.bedrooms")}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-bedrooms" />
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
                      <FormLabel>{t("offers.bathrooms")}</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} data-testid="input-bathrooms" />
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
                      <FormLabel>{t("offers.propertyCondition")}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-condition">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ready">{t("offers.ready")}</SelectItem>
                          <SelectItem value="under_construction">{t("offers.underConstruction")}</SelectItem>
                          <SelectItem value="off_plan">{t("offers.offPlan")}</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="falLicenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.falLicense")}</FormLabel>
                      <FormControl>
                        <Input {...field} dir="ltr" data-testid="input-fal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">
                  {language === "ar" ? "معلومات الوسيط / المطور" : "Broker / Developer Information"}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="brokerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offers.brokerName")}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-broker-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brokerPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offers.brokerPhone")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" type="tel" data-testid="input-broker-phone" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="brokerEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offers.brokerEmail")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" dir="ltr" data-testid="input-broker-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="developerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("offers.developerName")}</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-developer-name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("offers.description")} ({language === "ar" ? "English" : "الإنجليزية"})</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} dir="ltr" data-testid="input-description-en" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descriptionAr"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>{t("offers.description")} ({language === "ar" ? "العربية" : "Arabic"})</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} dir="rtl" data-testid="input-description-ar" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/offers")}
                  data-testid="button-cancel"
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  type="submit"
                  disabled={submitMutation.isPending}
                  data-testid="button-submit-offer"
                >
                  <Send className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                  {t("offers.submitForReview")}
                  <ArrowIcon className="h-4 w-4 ltr:ml-2 rtl:mr-2" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
