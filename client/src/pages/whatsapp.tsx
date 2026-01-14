import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Search, 
  Send, 
  Paperclip, 
  Smile, 
  Phone, 
  Video, 
  MoreVertical,
  FileText,
  User,
  Building2,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConversationItem } from "@/components/conversation-item";
import { ChatMessage } from "@/components/chat-message";
import { EmptyState } from "@/components/empty-state";
import { ConversationSkeleton } from "@/components/loading-skeleton";
import { useI18n } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Conversation, Lead, Message, Property } from "@shared/schema";

interface ConversationWithDetails extends Conversation {
  lead?: Lead;
  lastMessage?: Message;
}

export default function WhatsApp() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<ConversationWithDetails | null>(null);
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversations, isLoading: conversationsLoading } = useQuery<ConversationWithDetails[]>({
    queryKey: ["/api/conversations"],
  });

  const { data: messages, isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/conversations", selectedConversation?.id, "messages"],
    enabled: !!selectedConversation,
  });

  const { data: leads } = useQuery<Lead[]>({
    queryKey: ["/api/leads"],
  });

  const sendMessageMutation = useMutation({
    mutationFn: (data: { conversationId: string; content: string }) =>
      apiRequest("POST", `/api/conversations/${data.conversationId}/messages`, {
        content: data.content,
        direction: "outgoing",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["/api/conversations", selectedConversation?.id, "messages"] 
      });
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      setMessageText("");
    },
    onError: () => {
      toast({ title: "Failed to send message", variant: "destructive" });
    },
  });

  const createConversationMutation = useMutation({
    mutationFn: (leadId: string) => apiRequest("POST", "/api/conversations", { leadId }),
    onSuccess: (data: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ["/api/conversations"] });
      const lead = leads?.find((l) => l.id === data.leadId);
      setSelectedConversation({ ...data, lead });
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = () => {
    if (!messageText.trim() || !selectedConversation) return;
    sendMessageMutation.mutate({
      conversationId: selectedConversation.id,
      content: messageText,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredConversations = conversations?.filter((conv) => {
    const leadName = conv.lead?.name.toLowerCase() || "";
    return leadName.includes(searchQuery.toLowerCase());
  });

  const leadsWithoutConversation = leads?.filter(
    (lead) => !conversations?.some((conv) => conv.leadId === lead.id)
  );

  const selectedLead = selectedConversation?.lead || 
    leads?.find((l) => l.id === selectedConversation?.leadId);

  const initials = selectedLead?.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "??";

  return (
    <div className="flex h-[calc(100vh-64px)]">
      <div className="w-80 border-r flex flex-col bg-sidebar">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold font-heading mb-3">
            {t("whatsapp.conversations")}
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("whatsapp.search")}
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-testid="input-search-conversations"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          {conversationsLoading ? (
            <div className="p-2 space-y-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <ConversationSkeleton key={i} />
              ))}
            </div>
          ) : filteredConversations && filteredConversations.length > 0 ? (
            <div className="p-2 space-y-1">
              {filteredConversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  lead={conv.lead}
                  lastMessage={conv.lastMessage}
                  isActive={selectedConversation?.id === conv.id}
                  onClick={() => setSelectedConversation(conv)}
                />
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {t("whatsapp.noConversations")}
            </div>
          )}

          {leadsWithoutConversation && leadsWithoutConversation.length > 0 && (
            <>
              <Separator className="my-2" />
              <div className="px-4 py-2">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  Start New Conversation
                </p>
                {leadsWithoutConversation.slice(0, 5).map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => createConversationMutation.mutate(lead.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover-elevate text-left"
                    data-testid={`button-start-conv-${lead.id}`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                        {lead.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm truncate">{lead.name}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            <div className="h-16 px-4 border-b flex items-center justify-between bg-background">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium">{selectedLead?.name || "Unknown"}</h3>
                  <p className="text-xs text-muted-foreground" dir="ltr">
                    {selectedLead?.phone}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Video className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Profile</DropdownMenuItem>
                    <DropdownMenuItem>Search Messages</DropdownMenuItem>
                    <DropdownMenuItem>Clear Chat</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4 bg-muted/30">
              <div className="space-y-1 max-w-3xl mx-auto">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                  </div>
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <ChatMessage key={message.id} message={message} />
                  ))
                ) : (
                  <div className="text-center py-8 text-sm text-muted-foreground">
                    No messages yet. Start the conversation!
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-2 max-w-3xl mx-auto">
                <Button variant="ghost" size="icon">
                  <Smile className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder={t("whatsapp.typeMessage")}
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="flex-1"
                  data-testid="input-message"
                />
                <Button 
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!messageText.trim() || sendMessageMutation.isPending}
                  data-testid="button-send-message"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <EmptyState
              icon={MessageCircle}
              title="Select a Conversation"
              description="Choose a conversation from the sidebar or start a new one"
            />
          </div>
        )}
      </div>

      {selectedConversation && selectedLead && (
        <div className="w-72 border-l p-4 bg-background hidden xl:block">
          <div className="text-center mb-6">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarFallback className="bg-primary/10 text-primary text-2xl font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">{selectedLead.name}</h3>
            <p className="text-sm text-muted-foreground" dir="ltr">{selectedLead.phone}</p>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Lead Info
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="secondary" className="text-xs">
                    {t(`status.${selectedLead.status}`)}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Source</span>
                  <span>{t(`source.${selectedLead.source}`)}</span>
                </div>
                {selectedLead.budget && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Budget</span>
                    <span>{selectedLead.budget}</span>
                  </div>
                )}
                {selectedLead.score !== null && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score</span>
                    <span>{selectedLead.score}%</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Quick Templates
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setMessageText("Hello! Thank you for your interest. How can I help you today?")}
                >
                  Welcome Message
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setMessageText("I'd be happy to schedule a property viewing for you. What day works best?")}
                >
                  Schedule Viewing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-xs"
                  onClick={() => setMessageText("Here are some properties that match your requirements:")}
                >
                  Property Suggestion
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
