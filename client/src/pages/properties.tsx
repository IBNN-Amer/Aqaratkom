import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Building2, LayoutGrid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCard } from "@/components/property-card";
import { EmptyState } from "@/components/empty-state";
import { PropertyCardSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PropertyTypes, PropertyStatuses } from "@shared/schema";
import type { Property } from "@shared/schema";
import { cn } from "@/lib/utils";

const propertyFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  type: z.enum(PropertyTypes),
  status: z.enum(PropertyStatuses).default("available"),
  price: z.string().min(1, "Price is required"),
  area: z.string().optional(),
  bedrooms: z.string().optional(),
  bathrooms: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  locationAr: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function Properties() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      titleAr: "",
      description: "",
      type: "apartment",
      status: "available",
      price: "",
      area: "",
      bedrooms: "",
      bathrooms: "",
      location: "",
      locationAr: "",
    },
  });

  useEffect(() => {
    if (editingProperty) {
      form.reset({
        title: editingProperty.title,
        titleAr: editingProperty.titleAr || "",
        description: editingProperty.description || "",
        type: editingProperty.type as typeof PropertyTypes[number],
        status: editingProperty.status as typeof PropertyStatuses[number],
        price: editingProperty.price?.toString() || "",
        area: editingProperty.area?.toString() || "",
        bedrooms: editingProperty.bedrooms?.toString() || "",
        bathrooms: editingProperty.bathrooms?.toString() || "",
        location: editingProperty.location,
        locationAr: editingProperty.locationAr || "",
      });
    } else {
      form.reset({
        title: "",
        titleAr: "",
        description: "",
        type: "apartment",
        status: "available",
        price: "",
        area: "",
        bedrooms: "",
        bathrooms: "",
        location: "",
        locationAr: "",
      });
    }
  }, [editingProperty, form]);

  const createMutation = useMutation({
    mutationFn: (data: PropertyFormValues) => {
      const payload = {
        ...data,
        price: data.price,
        area: data.area ? parseInt(data.area) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      };
      return apiRequest("POST", "/api/properties", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      form.reset();
      toast({ 
        title: language === "ar" ? "تم إنشاء العقار بنجاح" : "Property created successfully" 
      });
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل في إنشاء العقار" : "Failed to create property", 
        variant: "destructive" 
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PropertyFormValues }) => {
      const payload = {
        ...data,
        price: data.price,
        area: data.area ? parseInt(data.area) : null,
        bedrooms: data.bedrooms ? parseInt(data.bedrooms) : null,
        bathrooms: data.bathrooms ? parseInt(data.bathrooms) : null,
      };
      return apiRequest("PATCH", `/api/properties/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      setEditingProperty(null);
      form.reset();
      toast({ 
        title: language === "ar" ? "تم تحديث العقار بنجاح" : "Property updated successfully" 
      });
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل في تحديث العقار" : "Failed to update property", 
        variant: "destructive" 
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/properties/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({ 
        title: language === "ar" ? "تم حذف العقار بنجاح" : "Property deleted successfully" 
      });
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل في حذف العقار" : "Failed to delete property", 
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: PropertyFormValues) => {
    if (editingProperty) {
      updateMutation.mutate({ id: editingProperty.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (property: Property) => {
    setEditingProperty(property);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProperty(null);
    form.reset();
  };

  const handleOpenNewProperty = () => {
    setEditingProperty(null);
    form.reset();
    setDialogOpen(true);
  };

  const filteredProperties = properties?.filter((property) => {
    const matchesSearch = 
      property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.titleAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      property.locationAr?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || property.type === typeFilter;
    const matchesStatus = statusFilter === "all" || property.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-5 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("properties.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {properties?.length || 0} {language === "ar" ? "عقار" : "total properties"}
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) handleCloseDialog();
          else setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-property" onClick={handleOpenNewProperty}>
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("properties.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {editingProperty 
                  ? (language === "ar" ? "تعديل العقار" : "Edit Property")
                  : t("properties.new")
                }
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[70vh] pr-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === "ar" ? "العنوان (بالإنجليزية)" : "Title (English)"}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Luxury 3BR Apartment" 
                            {...field} 
                            data-testid="input-property-title"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="titleAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === "ar" ? "العنوان (بالعربية)" : "Title (Arabic)"}</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="شقة فاخرة 3 غرف نوم" 
                            dir="rtl"
                            {...field} 
                            data-testid="input-property-title-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("properties.type")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-type">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PropertyTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {t(`type.${type}`)}
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
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("properties.status")}</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-property-status">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {PropertyStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {t(`status.${status}`)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("properties.price")} (SAR)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            placeholder="1500000" 
                            dir="ltr"
                            {...field} 
                            data-testid="input-property-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("properties.area")} (م²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="150" 
                              dir="ltr"
                              {...field} 
                              data-testid="input-property-area"
                            />
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
                          <FormLabel>{t("properties.bedrooms")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="3" 
                              dir="ltr"
                              {...field} 
                              data-testid="input-property-bedrooms"
                            />
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
                          <FormLabel>{t("properties.bathrooms")}</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="2" 
                              dir="ltr"
                              {...field} 
                              data-testid="input-property-bathrooms"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("properties.location")} ({language === "ar" ? "بالإنجليزية" : "English"})</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Al Olaya, Riyadh" 
                            {...field} 
                            data-testid="input-property-location"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="locationAr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("properties.location")} ({language === "ar" ? "بالعربية" : "Arabic"})</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="العليا، الرياض"
                            dir="rtl"
                            {...field} 
                            data-testid="input-property-location-ar"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{language === "ar" ? "الوصف" : "Description"}</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder={language === "ar" ? "وصف العقار..." : "Property description..."} 
                            rows={3}
                            {...field} 
                            data-testid="input-property-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end gap-2 pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={handleCloseDialog}
                    >
                      {t("common.cancel")}
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      data-testid="button-save-property"
                    >
                      {isSubmitting 
                        ? t("common.loading") 
                        : (editingProperty 
                            ? (language === "ar" ? "تحديث" : "Update")
                            : t("common.save")
                          )
                      }
                    </Button>
                  </div>
                </form>
              </Form>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("properties.search")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-properties"
          />
        </div>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-type">
            <Filter className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} {language === "ar" ? "الأنواع" : "Types"}</SelectItem>
            {PropertyTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`type.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} {language === "ar" ? "الحالات" : "Status"}</SelectItem>
            {PropertyStatuses.map((status) => (
              <SelectItem key={status} value={status}>
                {t(`status.${status}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "grid" | "list")}>
          <TabsList>
            <TabsTrigger value="grid" data-testid="button-view-grid">
              <LayoutGrid className="h-4 w-4" />
            </TabsTrigger>
            <TabsTrigger value="list" data-testid="button-view-list">
              <List className="h-4 w-4" />
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        {isLoading ? (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-2xl"
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredProperties && filteredProperties.length > 0 ? (
          <div className={cn(
            "grid gap-6",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1 max-w-2xl"
          )}>
            {filteredProperties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                onEdit={handleEdit}
                onDelete={(property) => deleteMutation.mutate(property.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Building2}
            title={t("properties.noProperties")}
            description={t("properties.addFirst")}
            actionLabel={t("properties.new")}
            onAction={handleOpenNewProperty}
          />
        )}
      </ScrollArea>
    </div>
  );
}
