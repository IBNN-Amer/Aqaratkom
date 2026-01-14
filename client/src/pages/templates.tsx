import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, FileText, Check, Clock, XCircle, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EmptyState } from "@/components/empty-state";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { MessageTemplate } from "@shared/schema";
import { cn } from "@/lib/utils";

const templateCategories = ["welcome", "follow_up", "property", "appointment", "general"] as const;

const templateFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameAr: z.string().optional(),
  category: z.enum(templateCategories),
  content: z.string().min(10, "Content must be at least 10 characters"),
  contentAr: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateFormSchema>;

const statusIcons = {
  approved: { icon: Check, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  pending: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  rejected: { icon: XCircle, color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

export default function Templates() {
  const { t, language } = useI18n();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: templates, isLoading } = useQuery<MessageTemplate[]>({
    queryKey: ["/api/templates"],
  });

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: {
      name: "",
      nameAr: "",
      category: "general",
      content: "",
      contentAr: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: TemplateFormValues) => apiRequest("POST", "/api/templates", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      setDialogOpen(false);
      form.reset();
      toast({ title: "Template created successfully" });
    },
    onError: () => {
      toast({ title: "Failed to create template", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/templates/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/templates"] });
      toast({ title: "Template deleted successfully" });
    },
    onError: () => {
      toast({ title: "Failed to delete template", variant: "destructive" });
    },
  });

  const onSubmit = (data: TemplateFormValues) => {
    createMutation.mutate(data);
  };

  const filteredTemplates = templates?.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categoryLabels: Record<string, string> = {
    welcome: "Welcome",
    follow_up: "Follow Up",
    property: "Property",
    appointment: "Appointment",
    general: "General",
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">{t("nav.templates")}</h1>
          <p className="text-muted-foreground mt-1">
            WhatsApp message templates for quick responses
          </p>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-new-template">
              <Plus className="h-4 w-4 ltr:mr-2 rtl:ml-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-heading">New Message Template</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (English)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Welcome Message" 
                          {...field} 
                          data-testid="input-template-name"
                        />
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
                      <FormLabel>Name (Arabic)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="رسالة ترحيب" 
                          dir="rtl"
                          {...field} 
                          data-testid="input-template-name-ar"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-template-category">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {templateCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {categoryLabels[category]}
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
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (English)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Hello {{name}}! Thank you for your interest in our properties..."
                          rows={4}
                          {...field} 
                          data-testid="input-template-content"
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-xs text-muted-foreground">
                        Use {"{{variable}}"} for dynamic content
                      </p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="contentAr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content (Arabic)</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="مرحباً {{name}}! شكراً لاهتمامك بعقاراتنا..."
                          rows={4}
                          dir="rtl"
                          {...field} 
                          data-testid="input-template-content-ar"
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
                    data-testid="button-save-template"
                  >
                    {createMutation.isPending ? t("common.loading") : t("common.save")}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search templates..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-templates"
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]" data-testid="select-filter-category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {templateCategories.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryLabels[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="h-[calc(100vh-280px)]">
        {isLoading ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-5 w-32 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded" />
                    <div className="h-4 w-3/4 bg-muted rounded" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredTemplates && filteredTemplates.length > 0 ? (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredTemplates.map((template) => {
              const status = statusIcons[template.approvalStatus as keyof typeof statusIcons] || statusIcons.pending;
              const StatusIcon = status.icon;
              const displayName = language === "ar" && template.nameAr ? template.nameAr : template.name;
              const displayContent = language === "ar" && template.contentAr ? template.contentAr : template.content;

              return (
                <Card 
                  key={template.id} 
                  className="hover-elevate transition-all"
                  data-testid={`card-template-${template.id}`}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <CardTitle className="text-base font-medium truncate">
                          {displayName}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {categoryLabels[template.category]}
                          </Badge>
                          <div className={cn("flex items-center gap-1 text-xs", status.color)}>
                            <StatusIcon className="h-3 w-3" />
                            <span className="capitalize">{template.approvalStatus}</span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            {t("common.edit")}
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => deleteMutation.mutate(template.id)}
                            className="text-destructive"
                          >
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p 
                      className="text-sm text-muted-foreground line-clamp-3"
                      dir={language === "ar" && template.contentAr ? "rtl" : "ltr"}
                    >
                      {displayContent}
                    </p>
                    {template.variables && template.variables.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {template.variables.map((variable, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {`{{${variable}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={FileText}
            title="No templates found"
            description="Create your first message template for quick responses"
            actionLabel="New Template"
            onAction={() => setDialogOpen(true)}
          />
        )}
      </ScrollArea>
    </div>
  );
}
