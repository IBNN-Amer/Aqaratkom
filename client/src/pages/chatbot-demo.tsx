import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Send, Bot, User, RefreshCw, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

export default function ChatbotDemo() {
  const { t, language } = useI18n();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/whatsapp/demo", {
        message,
        userId,
      });
      return response;
    },
    onSuccess: (data: { userId: string; userMessage: string; botReply: string }) => {
      if (!userId) {
        setUserId(data.userId);
      }
      
      setMessages((prev) => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          content: data.botReply,
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      content: inputText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    sendMessageMutation.mutate(inputText);
    setInputText("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleReset = () => {
    setMessages([]);
    setUserId(null);
  };

  const quickReplies = ["1", "2", "3", "4", "مرحبا", "إلغاء"];

  return (
    <div className="h-full flex flex-col p-4 gap-4" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold">
              {language === "ar" ? "تجربة شات بوت واتساب" : "WhatsApp Chatbot Demo"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {language === "ar" 
                ? "جرب المحادثة التفاعلية مع البوت" 
                : "Test the interactive chatbot conversation"}
            </p>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleReset}
          data-testid="button-reset-chat"
        >
          <RefreshCw className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
          {language === "ar" ? "بدء محادثة جديدة" : "New Chat"}
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 border-b">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-500" />
            <CardTitle className="text-base">
              {language === "ar" ? "محادثة تجريبية" : "Demo Conversation"}
            </CardTitle>
            <Badge variant="secondary" className="text-xs">
              {language === "ar" ? "وضع العرض" : "Demo Mode"}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 flex flex-col">
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">
                  {language === "ar" ? "ابدأ المحادثة" : "Start Conversation"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {language === "ar" 
                    ? "أرسل أي رسالة لبدء المحادثة مع البوت" 
                    : "Send any message to start chatting with the bot"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickReplies.slice(0, 4).map((reply) => (
                    <Button
                      key={reply}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setInputText(reply);
                        setTimeout(() => handleSend(), 100);
                      }}
                      data-testid={`button-quick-reply-${reply}`}
                    >
                      {reply}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.isBot ? "" : "flex-row-reverse"}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                        msg.isBot ? "bg-primary/10" : "bg-green-500/10"
                      }`}
                    >
                      {msg.isBot ? (
                        <Bot className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-green-600" />
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-lg p-3 ${
                        msg.isBot
                          ? "bg-muted"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          msg.isBot ? "text-muted-foreground" : "text-white/70"
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString(language === "ar" ? "ar-SA" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {messages.length > 0 && (
            <div className="px-4 py-2 border-t bg-muted/30">
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <Button
                    key={reply}
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => {
                      setInputText(reply);
                    }}
                    data-testid={`button-quick-${reply}`}
                  >
                    {reply}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === "ar" ? "اكتب رسالتك..." : "Type your message..."}
                className="flex-1"
                disabled={sendMessageMutation.isPending}
                data-testid="input-chat-message"
              />
              <Button
                onClick={handleSend}
                disabled={!inputText.trim() || sendMessageMutation.isPending}
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h3 className="font-semibold mb-2">
            {language === "ar" ? "كيفية الاستخدام:" : "How to use:"}
          </h3>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>{language === "ar" ? "أرسل أي رسالة لبدء المحادثة" : "Send any message to start"}</li>
            <li>{language === "ar" ? "اختر رقم من 1-4 لنوع الطلب" : "Choose 1-4 for request type"}</li>
            <li>{language === "ar" ? "اتبع التعليمات لإكمال الطلب" : "Follow prompts to complete request"}</li>
            <li>{language === "ar" ? "أرسل '0' أو 'إلغاء' للإلغاء" : "Send '0' or 'إلغاء' to cancel"}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
