import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useI18n } from "@/lib/i18n";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { SalesAgent, RealEstateOffice } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Plus, Phone, Mail, Building2, Home, Handshake } from "lucide-react";

const agentFormSchema = z.object({
  officeId: z.string().min(1, "Office is required"),
  name: z.string().min(1, "Name is required"),
  nameAr: z.string().optional(),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email().optional().or(z.literal("")),
  role: z.enum(["sales", "supervisor", "manager"]),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

function AgentCard({ agent, office }: { agent: SalesAgent; office?: RealEstateOffice }) {
  const { t, language } = useI18n();
  const agentName = language === "ar" && agent.nameAr ? agent.nameAr : agent.name;
  const officeName = office ? (language === "ar" && office.nameAr ? office.nameAr : office.name) : "";

  const roleLabels: Record<string, string> = {
    sales: t("agents.sales"),
    supervisor: t("agents.supervisor"),
    manager: t("agents.manager"),
  };

  const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
    manager: "default",
    supervisor: "secondary",
    sales: "outline",
  };

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  };

  return (
    <Card className="hover-elevate" data-testid={`card-agent-${agent.id}`}>
      <CardHeader className="flex flex-row items-start gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
            {getInitials(agent.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base font-semibold truncate">{agentName}</CardTitle>
            <Badge variant={roleBadgeVariant[agent.role] || "outline"}>
              {roleLabels[agent.role] || agent.role}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
            <Building2 className="h-3 w-3" />
            {officeName}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Phone className="h-4 w-4 text-muted-foreground" />
          <span dir="ltr">{agent.phone}</span>
        </div>
        {agent.email && (
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{agent.email}</span>
          </div>
        )}
        <div className="flex gap-4 pt-2 border-t">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>{agent.propertiesCount || 0} {language === "ar" ? "عقار" : "properties"}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Handshake className="h-4 w-4" />
            <span>{agent.dealsCount || 0} {language === "ar" ? "صفقة" : "deals"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AgentsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-start gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default function SalesAgents() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [filterOffice, setFilterOffice] = useState<string>("all");

  const { data: agents, isLoading: agentsLoading } = useQuery<SalesAgent[]>({
    queryKey: ["/api/sales-agents"],
  });

  const { data: offices } = useQuery<RealEstateOffice[]>({
    queryKey: ["/api/offices"],
  });

  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      officeId: "",
      name: "",
      nameAr: "",
      phone: "",
      email: "",
      role: "sales",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      return apiRequest("POST", "/api/sales-agents", {
        ...data,
        email: data.email || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sales-agents"] });
      setDialogOpen(false);
      form.reset();
      toast({
        title: language === "ar" ? "تم إضافة السيلز" : "Agent added",
        description: language === "ar" ? "تم إضافة السيلز بنجاح" : "Sales agent added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: AgentFormValues) => {
    createMutation.mutate(data);
  };

  const getOffice = (officeId: string) => {
    return offices?.find(o => o.id === officeId);
  };

  const filteredAgents = agents?.filter(agent => {
    if (filterOffice === "all") return true;
    return agent.officeId === filterOffice;
  }) || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-heading font-bold" data-testid="text-agents-title">
          {t("agents.title")}
        </h1>
        <div className="flex items-center gap-3">
          {offices && offices.length > 0 && (
            <Select value={filterOffice} onValueChange={setFilterOffice}>
              <SelectTrigger className="w-48" data-testid="select-filter-office">
                <SelectValue placeholder={t("agents.office")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("common.all")}</SelectItem>
                {offices.map((office) => (
                  <SelectItem key={office.id} value={office.id}>
                    {language === "ar" && office.nameAr ? office.nameAr : office.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-agent">
                <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
                {t("agents.new")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("agents.new")}</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="officeId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("agents.office")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-agent-office">
                              <SelectValue placeholder={t("agents.office")} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {offices?.map((office) => (
                              <SelectItem key={office.id} value={office.id}>
                                {language === "ar" && office.nameAr ? office.nameAr : office.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("agents.name")} (English)</FormLabel>
                          <FormControl>
                            <Input {...field} data-testid="input-agent-name" />
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
                          <FormLabel>{t("agents.name")} (العربية)</FormLabel>
                          <FormControl>
                            <Input {...field} dir="rtl" data-testid="input-agent-name-ar" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("agents.phone")}</FormLabel>
                        <FormControl>
                          <Input {...field} dir="ltr" type="tel" data-testid="input-agent-phone" />
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
                        <FormLabel>{t("agents.email")}</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" dir="ltr" data-testid="input-agent-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("agents.role")}</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-agent-role">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sales">{t("agents.sales")}</SelectItem>
                            <SelectItem value="supervisor">{t("agents.supervisor")}</SelectItem>
                            <SelectItem value="manager">{t("agents.manager")}</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      {t("common.cancel")}
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending} data-testid="button-submit-agent">
                      {t("common.save")}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {agentsLoading ? (
        <AgentsSkeleton />
      ) : !filteredAgents.length ? (
        <Card className="p-12 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">{t("agents.noAgents")}</h3>
          <p className="text-muted-foreground mb-4">{t("agents.addFirst")}</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
            {t("agents.new")}
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAgents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} office={getOffice(agent.officeId)} />
          ))}
        </div>
      )}
    </div>
  );
}
