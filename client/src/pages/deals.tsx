import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DealCard } from "@/components/deal-card";
import { EmptyState } from "@/components/empty-state";
import { DealCardSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { DealStages } from "@shared/schema";
import type { Deal, Lead, Property } from "@shared/schema";
import { cn } from "@/lib/utils";

const stageLabels: Record<string, { en: string; color: string }> = {
  qualified: { en: "Qualified", color: "bg-blue-500" },
  proposal: { en: "Proposal", color: "bg-yellow-500" },
  negotiation: { en: "Negotiation", color: "bg-purple-500" },
  contract: { en: "Contract", color: "bg-orange-500" },
  closed_won: { en: "Closed Won", color: "bg-green-500" },
  closed_lost: { en: "Closed Lost", color: "bg-red-500" },
};

const dealFormSchema = z.object({
  leadId: z.string().min(1, "Lead is required"),
  propertyId: z.string().optional(),
  stage: z.enum(DealStages).default("qualified"),
  value: z.string().min(1, "Value is required"),
  probability: z.string().default("20"),
});

type DealFormValues = z.infer<typeof dealFormSchema>;

export default function Deals() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: deals, isLoading: dealsLoading } = useQuery<Deal[]>({
    queryKey: ["/api/deals"],
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const { data: properties } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  const form = useForm<DealFormValues>({
    resolver: zodResolver(dealFormSchema),
    defaultValues: {
      leadId: "",
      propertyId: "",
      stage: "qualified",
      value: "",
      probability: "20",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: DealFormValues) => {
      const payload = {
        ...data,
        value: data.value,
        probability: parseInt(data.probability),
        propertyId: data.propertyId || null,
      };
      return apiRequest("POST", "/api/deals", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/deals-by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Deal created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create deal", variant: "destructive" });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: ({ id, stage }: { id: string; stage: string }) => 
      apiRequest("PATCH", `/api/deals/${id}`, { stage }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/deals-by-stage"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/deals/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/deals"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/deals-by-stage"] });
      toast({ title: "Deal deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete deal", variant: "destructive" });
    },
  });

  const onSubmit = (data: DealFormValues) => {
    createMutation.mutate(data);
  };

  const dealsByStage = DealStages.reduce((acc, stage) => {
    acc[stage] = deals?.filter((deal) => deal.stage === stage) || [];
    return acc;
  }, {} as Record<string, Deal[]>);

  const getLeadById = (id: string) => leads?.find((l) => l.id === id);
  const getPropertyById = (id: string | null) => 
    id ? properties?.find((p) => p.id === id) : undefined;

  const calculateStageValue = (stage: string) => {
    const stageDeals = dealsByStage[stage] || [];
    return stageDeals.reduce((sum, deal) => {
      const value = typeof deal.value === "string" ? parseFloat(deal.value) : (deal.value || 0);
      return sum + value;
    }, 0);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const visibleStages = DealStages.filter(s => s !== "closed_lost");

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("deals.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {deals?.length || 0} total deals
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-deal">
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("deals.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{t("deals.new")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="leadId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Lead</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deal-lead">
                            <SelectValue placeholder="Select a lead" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {leads?.map((lead) => (
                            <SelectItem key={lead.id} value={lead.id}>
                              {lead.name} - {lead.phone}
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
                  name="propertyId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Property (Optional)</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-deal-property">
                            <SelectValue placeholder="Select a property" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None</SelectItem>
                          {properties?.map((property) => (
                            <SelectItem key={property.id} value={property.id}>
                              {property.title}
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
                  name="value"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("deals.value")} (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number"
                          placeholder="1500000" 
                          {...field} 
                          data-testid="input-deal-value"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="stage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("deals.stage")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-deal-stage">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {DealStages.map((stage) => (
                              <SelectItem key={stage} value={stage}>
                                {stageLabels[stage]?.en || stage}
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
                    name="probability"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("deals.probability")} (%)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number"
                            min="0"
                            max="100"
                            placeholder="20" 
                            {...field} 
                            data-testid="input-deal-probability"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setDialogOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-save-deal"
                  >
                    {createMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {dealsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {visibleStages.map((stage) => (
            <Card key={stage}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("h-3 w-3 rounded-full", stageLabels[stage]?.color)} />
                  <CardTitle className="text-sm font-medium">
                    {stageLabels[stage]?.en}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <DealCardSkeleton key={i} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : deals && deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {visibleStages.map((stage) => {
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = calculateStageValue(stage);
            
            return (
              <Card key={stage} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={cn("h-3 w-3 rounded-full", stageLabels[stage]?.color)} />
                      <CardTitle className="text-sm font-medium">
                        {stageLabels[stage]?.en}
                      </CardTitle>
                      <Badge variant="secondary" className="text-xs">
                        {stageDeals.length}
                      </Badge>
                    </div>
                  </div>
                  {stageValue > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      AED {formatValue(stageValue)}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="flex-1">
                  <ScrollArea className="h-[calc(100vh-320px)]">
                    <div className="space-y-3 pr-2">
                      {stageDeals.length > 0 ? (
                        stageDeals.map((deal) => (
                          <DealCard
                            key={deal.id}
                            deal={deal}
                            lead={getLeadById(deal.leadId)}
                            property={getPropertyById(deal.propertyId)}
                            onDelete={(deal) => deleteMutation.mutate(deal.id)}
                          />
                        ))
                      ) : (
                        <div className="py-8 text-center text-sm text-muted-foreground">
                          No deals
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Handshake}
          title={t("deals.noDeals")}
          description={t("deals.addFirst")}
          actionLabel={t("deals.new")}
          onAction={() => setDialogOpen(true)}
        />
      )}
    </div>
  );
}
