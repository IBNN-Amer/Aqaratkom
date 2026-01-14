import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Filter, Download, Upload, LayoutGrid, List, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { LeadCard } from "@/components/lead-card";
import { EmptyState } from "@/components/empty-state";
import { LeadCardSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LeadSources, LeadStatuses } from "@shared/schema";
import type { Lead, InsertLead } from "@shared/schema";
import { cn } from "@/lib/utils";

const leadFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().min(9, "Phone number is required"),
  email: z.string().email().optional().or(z.literal("")),
  source: z.enum(LeadSources),
  status: z.enum(LeadStatuses).default("new"),
  notes: z.string().optional(),
  budget: z.string().optional(),
  propertyInterest: z.string().optional(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function Leads() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: leads, isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      source: "website",
      status: "new",
      notes: "",
      budget: "",
      propertyInterest: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: LeadFormValues) => apiRequest("POST", "/api/leads", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/leads-by-source"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Lead created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create lead", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/leads/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/leads-by-source"] });
      toast({ title: "Lead deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete lead", variant: "destructive" });
    },
  });

  const onSubmit = (data: LeadFormValues) => {
    createMutation.mutate(data);
  };

  const filteredLeads = leads?.filter((lead) => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.phone.includes(searchQuery) ||
      lead.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
    const matchesSource = sourceFilter === "all" || lead.source === sourceFilter;
    return matchesSearch && matchesStatus && matchesSource;
  });

  const statusCounts = leads?.reduce((acc, lead) => {
    acc[lead.status] = (acc[lead.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("leads.title")}</h1>
          <p className="text-muted-foreground mt-1">
            {leads?.length || 0} total leads
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-lead">
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              {t("leads.new")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="font-heading">{t("leads.new")}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("leads.name")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          {...field} 
                          data-testid="input-lead-name"
                        />
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
                      <FormLabel>{t("leads.phone")}</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+971 50 123 4567" 
                          {...field} 
                          data-testid="input-lead-phone"
                        />
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
                      <FormLabel>{t("leads.email")}</FormLabel>
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="john@example.com" 
                          {...field} 
                          data-testid="input-lead-email"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("leads.source")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lead-source">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LeadSources.map((source) => (
                              <SelectItem key={source} value={source}>
                                {t(`source.${source}`)}
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
                        <FormLabel>{t("leads.status")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-lead-status">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {LeadStatuses.map((status) => (
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
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget (AED)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="500,000 - 1,000,000" 
                          {...field} 
                          data-testid="input-lead-budget"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Additional notes..." 
                          {...field} 
                          data-testid="input-lead-notes"
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
                    onClick={() => setDialogOpen(false)}
                  >
                    {t("common.cancel")}
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                    data-testid="button-save-lead"
                  >
                    {createMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge 
          variant={statusFilter === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setStatusFilter("all")}
        >
          {t("common.all")} ({leads?.length || 0})
        </Badge>
        {LeadStatuses.map((status) => (
          <Badge 
            key={status}
            variant={statusFilter === status ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setStatusFilter(status)}
          >
            {t(`status.${status}`)} ({statusCounts[status] || 0})
          </Badge>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("leads.search")}
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-leads"
          />
        </div>

        <Select value={sourceFilter} onValueChange={setSourceFilter}>
          <SelectTrigger className="w-[160px]" data-testid="select-filter-source">
            <Filter className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            <SelectValue placeholder="Source" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} Sources</SelectItem>
            {LeadSources.map((source) => (
              <SelectItem key={source} value={source}>
                {t(`source.${source}`)}
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

      <ScrollArea className="h-[calc(100vh-320px)]">
        {isLoading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <LeadCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredLeads && filteredLeads.length > 0 ? (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" 
              : "grid-cols-1"
          )}>
            {filteredLeads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                onDelete={(lead) => deleteMutation.mutate(lead.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={t("leads.noLeads")}
            description={t("leads.addFirst")}
            actionLabel={t("leads.new")}
            onAction={() => setDialogOpen(true)}
          />
        )}
      </ScrollArea>
    </div>
  );
}
