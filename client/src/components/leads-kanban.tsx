import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Phone, MessageSquare, Calendar, GripVertical, User, Clock, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { LeadStatuses } from "@shared/schema";
import type { Lead } from "@shared/schema";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

const followUpSchema = z.object({
  type: z.enum(["meeting", "call", "email", "site_visit"]),
  title: z.string().min(2, "Title is required"),
  description: z.string().optional(),
  scheduledAt: z.string().min(1, "Scheduled date is required"),
  priority: z.enum(["low", "normal", "high"]).default("normal"),
});

type FollowUpFormValues = z.infer<typeof followUpSchema>;

interface LeadsKanbanProps {
  leads: Lead[];
  onLeadUpdate: (id: string, updates: Partial<Lead>) => void;
  onLeadDelete: (lead: Lead) => void;
}

const stageColors: Record<string, string> = {
  new: "bg-blue-500/10 border-blue-500/30 text-blue-600 dark:text-blue-400",
  contacted: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400",
  qualified: "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400",
  negotiating: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400",
  won: "bg-green-500/10 border-green-500/30 text-green-600 dark:text-green-400",
  lost: "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400",
};

const stageHeaderColors: Record<string, string> = {
  new: "bg-blue-500",
  contacted: "bg-purple-500",
  qualified: "bg-amber-500",
  negotiating: "bg-orange-500",
  won: "bg-green-500",
  lost: "bg-red-500",
};

function KanbanCard({ 
  lead, 
  onDragStart, 
  onScheduleFollowUp 
}: { 
  lead: Lead; 
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}) {
  const { t, language } = useI18n();

  return (
    <Card
      draggable
      onDragStart={(e) => onDragStart(e, lead)}
      className="p-3 cursor-grab active:cursor-grabbing hover-elevate transition-all group"
      data-testid={`kanban-card-${lead.id}`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="font-medium truncate">{lead.name}</span>
            {lead.score !== null && lead.score !== undefined && (
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {lead.score}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" />
            <span className="truncate" dir="ltr">{lead.phone}</span>
          </div>

          {lead.propertyInterest && (
            <div className="text-xs text-muted-foreground truncate">
              {lead.propertyInterest}
            </div>
          )}

          {lead.budget && (
            <Badge variant="outline" className="text-xs">
              {lead.budget}
            </Badge>
          )}

          {lead.lastContactAt && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              <span>
                {formatDistanceToNow(new Date(lead.lastContactAt), { 
                  addSuffix: true,
                  locale: language === "ar" ? ar : enUS 
                })}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1 pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); window.open(`tel:${lead.phone}`); }}
              data-testid={`button-call-${lead.id}`}
            >
              <Phone className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`); }}
              data-testid={`button-whatsapp-${lead.id}`}
            >
              <MessageSquare className="h-3 w-3" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={(e) => { e.stopPropagation(); onScheduleFollowUp(lead); }}
              data-testid={`button-schedule-${lead.id}`}
            >
              <Calendar className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

function KanbanColumn({ 
  status, 
  leads, 
  onDrop, 
  onDragOver, 
  onDragStart,
  onScheduleFollowUp 
}: { 
  status: string; 
  leads: Lead[];
  onDrop: (e: React.DragEvent, status: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, lead: Lead) => void;
  onScheduleFollowUp: (lead: Lead) => void;
}) {
  const { t } = useI18n();
  const [isDragOver, setIsDragOver] = useState(false);

  return (
    <div 
      className={cn(
        "flex flex-col min-w-[280px] max-w-[320px] rounded-lg border transition-colors",
        isDragOver ? "border-primary bg-primary/5" : "bg-muted/30"
      )}
      onDrop={(e) => {
        setIsDragOver(false);
        onDrop(e, status);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
        onDragOver(e);
      }}
      onDragLeave={() => setIsDragOver(false)}
      data-testid={`kanban-column-${status}`}
    >
      <div className="p-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", stageHeaderColors[status])} />
          <span className="font-medium">{t(`status.${status}`)}</span>
        </div>
        <Badge variant="secondary" className="text-xs">
          {leads.length}
        </Badge>
      </div>
      
      <ScrollArea className="flex-1 h-[calc(100vh-350px)]">
        <div className="p-2 space-y-2">
          {leads.map((lead) => (
            <KanbanCard 
              key={lead.id} 
              lead={lead} 
              onDragStart={onDragStart}
              onScheduleFollowUp={onScheduleFollowUp}
            />
          ))}
          {leads.length === 0 && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {t("leads.dragHint")}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function LeadsKanban({ leads, onLeadUpdate, onLeadDelete }: LeadsKanbanProps) {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [draggedLead, setDraggedLead] = useState<Lead | null>(null);
  const [followUpDialogOpen, setFollowUpDialogOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const form = useForm<FollowUpFormValues>({
    resolver: zodResolver(followUpSchema),
    defaultValues: {
      type: "call",
      title: "",
      description: "",
      scheduledAt: "",
      priority: "normal",
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Lead> }) => 
      apiRequest("PATCH", `/api/leads/${id}`, updates),
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: ["/api/leads"] });
      const previousLeads = queryClient.getQueryData<Lead[]>(["/api/leads"]);
      queryClient.setQueryData<Lead[]>(["/api/leads"], (old) =>
        old?.map((lead) => (lead.id === id ? { ...lead, ...updates } : lead))
      );
      return { previousLeads };
    },
    onError: (err, variables, context) => {
      if (context?.previousLeads) {
        queryClient.setQueryData(["/api/leads"], context.previousLeads);
      }
      toast({ 
        title: language === "ar" ? "فشل تحديث العميل" : "Failed to update lead", 
        variant: "destructive" 
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });

  const createFollowUpMutation = useMutation({
    mutationFn: (data: FollowUpFormValues & { leadId: string }) => 
      apiRequest("POST", "/api/follow-ups", { 
        ...data, 
        userId: "user-1",
        scheduledAt: new Date(data.scheduledAt).toISOString() 
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/follow-ups"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setFollowUpDialogOpen(false);
      form.reset();
      toast({ title: language === "ar" ? "تم جدولة المتابعة" : "Follow-up scheduled" });
    },
    onError: () => {
      toast({ 
        title: language === "ar" ? "فشل جدولة المتابعة" : "Failed to schedule follow-up", 
        variant: "destructive" 
      });
    },
  });

  const handleDragStart = (e: React.DragEvent, lead: Lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedLead && draggedLead.status !== newStatus) {
      const leadId = draggedLead.id;
      updateLeadMutation.mutate({ 
        id: leadId, 
        updates: { status: newStatus } 
      });
    }
    setDraggedLead(null);
  };

  const handleScheduleFollowUp = (lead: Lead) => {
    setSelectedLead(lead);
    const followUpType = language === "ar" ? "مكالمة" : "Call";
    form.setValue("title", `${followUpType} - ${lead.name}`);
    setFollowUpDialogOpen(true);
  };

  const onSubmitFollowUp = (data: FollowUpFormValues) => {
    if (selectedLead) {
      createFollowUpMutation.mutate({ ...data, leadId: selectedLead.id });
    }
  };

  const leadsByStatus = LeadStatuses.reduce((acc, status) => {
    acc[status] = leads.filter(lead => lead.status === status);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LeadStatuses.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={leadsByStatus[status] || []}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragStart={handleDragStart}
            onScheduleFollowUp={handleScheduleFollowUp}
          />
        ))}
      </div>

      <Dialog open={followUpDialogOpen} onOpenChange={setFollowUpDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">
              {t("leads.scheduleFollowUp")}
              {selectedLead && (
                <span className="text-muted-foreground font-normal text-sm block mt-1">
                  {selectedLead.name}
                </span>
              )}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitFollowUp)} className="space-y-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("followUps.title")}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-followup-type">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="call">{t("followUps.call")}</SelectItem>
                        <SelectItem value="meeting">{t("followUps.meeting")}</SelectItem>
                        <SelectItem value="email">{t("followUps.email")}</SelectItem>
                        <SelectItem value="site_visit">{t("followUps.siteVisit")}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "العنوان" : "Title"}</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder={language === "ar" ? "عنوان المتابعة" : "Follow-up title"} 
                        {...field} 
                        data-testid="input-followup-title"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="scheduledAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("followUps.scheduledFor")}</FormLabel>
                    <FormControl>
                      <Input 
                        type="datetime-local" 
                        {...field} 
                        data-testid="input-followup-date"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "الأولوية" : "Priority"}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-followup-priority">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">{language === "ar" ? "منخفضة" : "Low"}</SelectItem>
                        <SelectItem value="normal">{language === "ar" ? "عادية" : "Normal"}</SelectItem>
                        <SelectItem value="high">{language === "ar" ? "عالية" : "High"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{language === "ar" ? "ملاحظات" : "Notes"}</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={language === "ar" ? "ملاحظات إضافية..." : "Additional notes..."} 
                        className="resize-none"
                        {...field} 
                        data-testid="input-followup-notes"
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
                  onClick={() => setFollowUpDialogOpen(false)}
                >
                  {t("common.cancel")}
                </Button>
                <Button 
                  type="submit" 
                  disabled={createFollowUpMutation.isPending}
                  data-testid="button-save-followup"
                >
                  {createFollowUpMutation.isPending ? t("common.loading") : t("common.save")}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
