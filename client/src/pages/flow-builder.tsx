import { useState, useCallback } from "react";
import { 
  DoorOpen, 
  Type, 
  LayoutGrid, 
  Keyboard, 
  GitBranch, 
  Search, 
  List, 
  Plug, 
  Clock, 
  UserCheck,
  Save,
  Play,
  Download,
  Plus,
  Trash2,
  Copy,
  Edit3,
  Settings,
  X,
  ChevronDown,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useI18n } from "@/lib/i18n";

interface FlowNode {
  id: string;
  type: string;
  name: string;
  description: string;
  properties: Record<string, unknown>;
}

interface ComponentType {
  type: string;
  name: string;
  nameEn: string;
  description: string;
  descriptionEn: string;
  icon: React.ElementType;
  color: string;
}

const componentTypes: ComponentType[] = [
  { 
    type: "welcome", 
    name: "رسالة الترحيب", 
    nameEn: "Welcome Message",
    description: "أول رسالة يراها العميل",
    descriptionEn: "First message the client sees",
    icon: DoorOpen,
    color: "from-green-500 to-green-600"
  },
  { 
    type: "text", 
    name: "رسالة نصية", 
    nameEn: "Text Message",
    description: "إرسال نص للعميل",
    descriptionEn: "Send text to client",
    icon: Type,
    color: "from-blue-500 to-blue-600"
  },
  { 
    type: "quick_replies", 
    name: "أزرار سريعة", 
    nameEn: "Quick Replies",
    description: "قائمة أزرار للاختيار",
    descriptionEn: "Button list for selection",
    icon: LayoutGrid,
    color: "from-purple-500 to-purple-600"
  },
  { 
    type: "input", 
    name: "طلب إدخال", 
    nameEn: "Input Request",
    description: "طلب معلومات من العميل",
    descriptionEn: "Request info from client",
    icon: Keyboard,
    color: "from-orange-500 to-orange-600"
  },
  { 
    type: "condition", 
    name: "شرط", 
    nameEn: "Condition",
    description: "اتخاذ قرار بناء على الإدخال",
    descriptionEn: "Make decision based on input",
    icon: GitBranch,
    color: "from-yellow-500 to-yellow-600"
  },
  { 
    type: "database", 
    name: "بحث عقارات", 
    nameEn: "Property Search",
    description: "البحث في قاعدة البيانات",
    descriptionEn: "Search in database",
    icon: Search,
    color: "from-cyan-500 to-cyan-600"
  },
  { 
    type: "results", 
    name: "عرض النتائج", 
    nameEn: "Show Results",
    description: "إظهار العقارات المطابقة",
    descriptionEn: "Display matching properties",
    icon: List,
    color: "from-indigo-500 to-indigo-600"
  },
  { 
    type: "api", 
    name: "استدعاء API", 
    nameEn: "API Call",
    description: "التكامل مع خدمات خارجية",
    descriptionEn: "Integrate with external services",
    icon: Plug,
    color: "from-pink-500 to-pink-600"
  },
  { 
    type: "delay", 
    name: "تأخير", 
    nameEn: "Delay",
    description: "انتظار فترة زمنية",
    descriptionEn: "Wait for a period",
    icon: Clock,
    color: "from-gray-500 to-gray-600"
  },
  { 
    type: "transfer", 
    name: "تحويل لمسوّق", 
    nameEn: "Transfer to Agent",
    description: "تحويل المحادثة لدعم بشري",
    descriptionEn: "Transfer to human support",
    icon: UserCheck,
    color: "from-red-500 to-red-600"
  },
];

export default function FlowBuilder() {
  const { language } = useI18n();
  const { toast } = useToast();
  const isArabic = language === "ar";
  
  const [nodes, setNodes] = useState<FlowNode[]>([]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [draggedComponent, setDraggedComponent] = useState<ComponentType | null>(null);
  const [testMessages, setTestMessages] = useState<{text: string; isBot: boolean}[]>([]);
  const [testInput, setTestInput] = useState("");

  const handleDragStart = useCallback((component: ComponentType) => {
    setDraggedComponent(component);
  }, []);

  const handleDrop = useCallback(() => {
    if (draggedComponent) {
      const newNode: FlowNode = {
        id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: draggedComponent.type,
        name: isArabic ? draggedComponent.name : draggedComponent.nameEn,
        description: isArabic ? draggedComponent.description : draggedComponent.descriptionEn,
        properties: getDefaultProperties(draggedComponent.type),
      };
      setNodes(prev => [...prev, newNode]);
      setDraggedComponent(null);
      toast({
        title: isArabic ? "تمت الإضافة" : "Added",
        description: isArabic ? `تم إضافة ${newNode.name}` : `${newNode.name} added`,
      });
    }
  }, [draggedComponent, isArabic, toast]);

  const getDefaultProperties = (type: string): Record<string, unknown> => {
    switch (type) {
      case "welcome":
        return {
          text: isArabic ? "مرحباً بك في مكتبنا العقاري 🏠\nكيف يمكنني مساعدتك اليوم؟" : "Welcome to our real estate office 🏠\nHow can I help you today?",
          buttons: [
            isArabic ? "🔍 البحث عن عقار" : "🔍 Search for property",
            isArabic ? "🏢 عرض عقاري" : "🏢 List property",
            isArabic ? "📞 التحدث مع مسوّق" : "📞 Talk to agent"
          ]
        };
      case "text":
        return { text: isArabic ? "شكراً لتواصلك معنا" : "Thank you for contacting us" };
      case "quick_replies":
        return {
          text: isArabic ? "اختر من القائمة التالية:" : "Choose from the following:",
          buttons: [isArabic ? "شقة" : "Apartment", isArabic ? "فيلا" : "Villa", isArabic ? "محل تجاري" : "Commercial"]
        };
      case "input":
        return {
          question: isArabic ? "ما نوع العقار الذي تبحث عنه؟" : "What type of property are you looking for?",
          inputType: "text",
          variable: "property_type",
          errorMessage: isArabic ? "الرجاء إدخال قيمة صحيحة" : "Please enter a valid value"
        };
      case "condition":
        return { variable: "choice", conditions: [] };
      case "database":
        return { searchType: "properties", filters: {} };
      case "results":
        return { maxResults: 5, template: "property_card" };
      case "api":
        return { url: "", method: "GET", headers: {} };
      case "delay":
        return { seconds: 2 };
      case "transfer":
        return { department: "sales", message: isArabic ? "جاري تحويلك لأحد المسوقين..." : "Transferring you to an agent..." };
      default:
        return {};
    }
  };

  const deleteNode = (id: string) => {
    setNodes(prev => prev.filter(n => n.id !== id));
    if (selectedNode?.id === id) {
      setSelectedNode(null);
    }
  };

  const duplicateNode = (node: FlowNode) => {
    const newNode: FlowNode = {
      ...node,
      id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: `${node.name} (${isArabic ? "نسخة" : "copy"})`,
    };
    setNodes(prev => [...prev, newNode]);
  };

  const updateNodeProperty = (key: string, value: unknown) => {
    if (!selectedNode) return;
    setNodes(prev => prev.map(n => 
      n.id === selectedNode.id 
        ? { ...n, properties: { ...n.properties, [key]: value } }
        : n
    ));
    setSelectedNode(prev => prev ? { ...prev, properties: { ...prev.properties, [key]: value } } : null);
  };

  const addButton = () => {
    if (!selectedNode) return;
    const buttons = (selectedNode.properties.buttons as string[]) || [];
    updateNodeProperty("buttons", [...buttons, isArabic ? "زر جديد" : "New button"]);
  };

  const removeButton = (index: number) => {
    if (!selectedNode) return;
    const buttons = (selectedNode.properties.buttons as string[]) || [];
    updateNodeProperty("buttons", buttons.filter((_, i) => i !== index));
  };

  const updateButton = (index: number, value: string) => {
    if (!selectedNode) return;
    const buttons = [...((selectedNode.properties.buttons as string[]) || [])];
    buttons[index] = value;
    updateNodeProperty("buttons", buttons);
  };

  const exportFlow = () => {
    const flowData = {
      nodes,
      settings: {
        language: language,
        timezone: "+3",
        createdAt: new Date().toISOString()
      }
    };
    return JSON.stringify(flowData, null, 2);
  };

  const downloadFlow = () => {
    const json = exportFlow();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "bot-flow.json";
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: isArabic ? "تم التحميل" : "Downloaded",
      description: isArabic ? "تم تحميل ملف التدفق" : "Flow file downloaded",
    });
  };

  const saveFlow = () => {
    localStorage.setItem("bot-flow", JSON.stringify(nodes));
    toast({
      title: isArabic ? "تم الحفظ" : "Saved",
      description: isArabic ? "تم حفظ التدفق بنجاح" : "Flow saved successfully",
    });
  };

  const loadFlow = () => {
    const saved = localStorage.getItem("bot-flow");
    if (saved) {
      setNodes(JSON.parse(saved));
      toast({
        title: isArabic ? "تم التحميل" : "Loaded",
        description: isArabic ? "تم تحميل التدفق المحفوظ" : "Saved flow loaded",
      });
    }
  };

  const addSampleFlow = () => {
    const sampleNodes: FlowNode[] = [
      {
        id: "sample_1",
        type: "welcome",
        name: isArabic ? "رسالة الترحيب" : "Welcome Message",
        description: isArabic ? "أول رسالة يراها العميل" : "First message client sees",
        properties: getDefaultProperties("welcome"),
      },
      {
        id: "sample_2",
        type: "quick_replies",
        name: isArabic ? "نوع الطلب" : "Request Type",
        description: isArabic ? "اختيار نوع الخدمة" : "Select service type",
        properties: {
          text: isArabic ? "ما نوع الخدمة التي تحتاجها؟" : "What service do you need?",
          buttons: [
            isArabic ? "🔍 شراء عقار" : "🔍 Buy property",
            isArabic ? "🏠 إيجار عقار" : "🏠 Rent property",
            isArabic ? "💰 بيع عقار" : "💰 Sell property"
          ]
        },
      },
      {
        id: "sample_3",
        type: "input",
        name: isArabic ? "نوع العقار" : "Property Type",
        description: isArabic ? "طلب نوع العقار" : "Request property type",
        properties: {
          question: isArabic ? "ما نوع العقار المطلوب؟" : "What property type?",
          inputType: "text",
          variable: "property_type"
        },
      },
      {
        id: "sample_4",
        type: "database",
        name: isArabic ? "بحث" : "Search",
        description: isArabic ? "البحث عن عقارات مطابقة" : "Search for matching properties",
        properties: { searchType: "properties" },
      },
      {
        id: "sample_5",
        type: "results",
        name: isArabic ? "عرض النتائج" : "Show Results",
        description: isArabic ? "عرض العقارات المتاحة" : "Display available properties",
        properties: { maxResults: 5 },
      },
    ];
    setNodes(sampleNodes);
    toast({
      title: isArabic ? "تم الإنشاء" : "Created",
      description: isArabic ? "تم إنشاء تدفق نموذجي" : "Sample flow created",
    });
  };

  const sendTestMessage = () => {
    if (!testInput.trim()) return;
    setTestMessages(prev => [...prev, { text: testInput, isBot: false }]);
    
    setTimeout(() => {
      let botReply = isArabic ? "مرحباً! كيف يمكنني مساعدتك؟" : "Hello! How can I help you?";
      if (testInput.includes("1") || testInput.includes("شراء") || testInput.includes("buy")) {
        botReply = isArabic ? "ممتاز! ما نوع العقار الذي تبحث عنه؟\n\n1. شقة\n2. فيلا\n3. أرض\n4. محل تجاري" : "Great! What property type?\n\n1. Apartment\n2. Villa\n3. Land\n4. Commercial";
      } else if (testInput.includes("2") || testInput.includes("إيجار") || testInput.includes("rent")) {
        botReply = isArabic ? "حسناً، للإيجار. ما نوع العقار؟" : "OK, for rent. What property type?";
      }
      setTestMessages(prev => [...prev, { text: botReply, isBot: true }]);
    }, 500);
    
    setTestInput("");
  };

  const getNodeIcon = (type: string) => {
    const component = componentTypes.find(c => c.type === type);
    return component?.icon || MessageCircle;
  };

  const getNodeColor = (type: string) => {
    const component = componentTypes.find(c => c.type === type);
    return component?.color || "from-gray-500 to-gray-600";
  };

  return (
    <div className="h-full flex flex-col" dir={isArabic ? "rtl" : "ltr"}>
      <div className="p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">
              {isArabic ? "محرر تدفق المحادثة" : "Conversation Flow Builder"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isArabic ? "اسحب وأفلت المكونات لبناء تدفق البوت" : "Drag and drop components to build bot flow"}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadFlow} data-testid="button-load-flow">
              <Download className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "تحميل" : "Load"}
            </Button>
            <Button variant="outline" size="sm" onClick={downloadFlow} data-testid="button-export-flow">
              <Download className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "تصدير" : "Export"}
            </Button>
            <Button size="sm" onClick={saveFlow} data-testid="button-save-flow">
              <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
              {isArabic ? "حفظ" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-e p-4 overflow-y-auto bg-muted/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {isArabic ? "مكونات البوت" : "Bot Components"}
          </h3>
          <div className="space-y-2">
            {componentTypes.map((component) => {
              const Icon = component.icon;
              return (
                <div
                  key={component.type}
                  draggable
                  onDragStart={() => handleDragStart(component)}
                  className="p-3 rounded-lg border bg-background cursor-move hover:border-primary transition-colors"
                  data-testid={`component-${component.type}`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${component.color} flex items-center justify-center text-white`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-sm">
                      {isArabic ? component.name : component.nameEn}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground ltr:ml-11 rtl:mr-11">
                    {isArabic ? component.description : component.descriptionEn}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs defaultValue="flow" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 w-fit">
              <TabsTrigger value="flow" data-testid="tab-flow">
                {isArabic ? "تدفق المحادثة" : "Flow"}
              </TabsTrigger>
              <TabsTrigger value="test" data-testid="tab-test">
                {isArabic ? "اختبار" : "Test"}
              </TabsTrigger>
              <TabsTrigger value="export" data-testid="tab-export">
                {isArabic ? "تصدير JSON" : "Export JSON"}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="flow" className="flex-1 m-0 p-4 overflow-hidden">
              <div 
                className={`h-full rounded-lg border-2 border-dashed p-4 overflow-y-auto transition-colors ${
                  draggedComponent ? "border-primary bg-primary/5" : "border-muted"
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                data-testid="flow-canvas"
              >
                {nodes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                    <MessageCircle className="w-12 h-12 mb-4 opacity-30" />
                    <h3 className="font-semibold mb-2">
                      {isArabic ? "ابدأ بناء تدفق المحادثة" : "Start building your flow"}
                    </h3>
                    <p className="text-sm mb-4">
                      {isArabic ? "اسحب المكونات من القائمة اليمنى" : "Drag components from the left panel"}
                    </p>
                    <Button variant="outline" onClick={addSampleFlow} data-testid="button-sample-flow">
                      <Play className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "إنشاء تدفق نموذجي" : "Create sample flow"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {nodes.map((node, index) => {
                      const Icon = getNodeIcon(node.type);
                      const color = getNodeColor(node.type);
                      return (
                        <div key={node.id}>
                          <Card 
                            className={`cursor-pointer transition-all ${
                              selectedNode?.id === node.id ? "ring-2 ring-primary" : ""
                            }`}
                            onClick={() => setSelectedNode(node)}
                            data-testid={`node-${node.id}`}
                          >
                            <CardHeader className="pb-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center text-white`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div>
                                    <CardTitle className="text-base">{node.name}</CardTitle>
                                    <p className="text-xs text-muted-foreground">{node.description}</p>
                                  </div>
                                </div>
                                <div className="flex gap-1">
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); setSelectedNode(node); }}
                                    data-testid={`button-edit-${node.id}`}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); duplicateNode(node); }}
                                    data-testid={`button-copy-${node.id}`}
                                  >
                                    <Copy className="w-4 h-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost"
                                    onClick={(e) => { e.stopPropagation(); deleteNode(node.id); }}
                                    data-testid={`button-delete-${node.id}`}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </CardHeader>
                            {(node.properties.text || node.properties.question) && (
                              <CardContent className="pt-0">
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                  {String(node.properties.text || node.properties.question || "")}
                                </p>
                                {node.properties.buttons && Array.isArray(node.properties.buttons) && (
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {(node.properties.buttons as string[]).map((btn, i) => (
                                      <Badge key={i} variant="secondary" className="text-xs">
                                        {String(btn)}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </CardContent>
                            )}
                          </Card>
                          {index < nodes.length - 1 && (
                            <div className="flex justify-center py-2">
                              <ChevronDown className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="test" className="flex-1 m-0 p-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {isArabic ? "اختبار تدفق المحادثة" : "Test Flow"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <ScrollArea className="flex-1 border rounded-lg p-4 mb-4">
                    {testMessages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        {isArabic ? "ابدأ المحادثة..." : "Start conversation..."}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {testMessages.map((msg, i) => (
                          <div key={i} className={`flex ${msg.isBot ? "" : "justify-end"}`}>
                            <div className={`max-w-[80%] rounded-lg p-3 ${
                              msg.isBot ? "bg-muted" : "bg-primary text-primary-foreground"
                            }`}>
                              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                  <div className="flex gap-2">
                    <Input
                      value={testInput}
                      onChange={(e) => setTestInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendTestMessage()}
                      placeholder={isArabic ? "اكتب رسالة..." : "Type message..."}
                      data-testid="input-test-message"
                    />
                    <Button onClick={sendTestMessage} data-testid="button-send-test">
                      <Play className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="export" className="flex-1 m-0 p-4">
              <Card className="h-full flex flex-col">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">
                    {isArabic ? "تصدير JSON" : "Export JSON"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <pre className="flex-1 bg-muted rounded-lg p-4 overflow-auto text-sm font-mono">
                    {exportFlow()}
                  </pre>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(exportFlow());
                        toast({ title: isArabic ? "تم النسخ" : "Copied" });
                      }}
                      data-testid="button-copy-json"
                    >
                      <Copy className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "نسخ" : "Copy"}
                    </Button>
                    <Button onClick={downloadFlow} data-testid="button-download-json">
                      <Download className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "تحميل" : "Download"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="w-72 border-s p-4 overflow-y-auto bg-muted/30">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            {isArabic ? "خصائص المكون" : "Properties"}
          </h3>
          
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <Label>{isArabic ? "اسم المكون" : "Component Name"}</Label>
                <Input 
                  value={selectedNode.name} 
                  onChange={(e) => {
                    setNodes(prev => prev.map(n => 
                      n.id === selectedNode.id ? { ...n, name: e.target.value } : n
                    ));
                    setSelectedNode(prev => prev ? { ...prev, name: e.target.value } : null);
                  }}
                  data-testid="input-node-name"
                />
              </div>

              {(selectedNode.type === "welcome" || selectedNode.type === "text") && (
                <div>
                  <Label>{isArabic ? "نص الرسالة" : "Message Text"}</Label>
                  <Textarea
                    value={(selectedNode.properties.text as string) || ""}
                    onChange={(e) => updateNodeProperty("text", e.target.value)}
                    rows={4}
                    data-testid="input-node-text"
                  />
                </div>
              )}

              {selectedNode.type === "input" && (
                <>
                  <div>
                    <Label>{isArabic ? "السؤال" : "Question"}</Label>
                    <Textarea
                      value={(selectedNode.properties.question as string) || ""}
                      onChange={(e) => updateNodeProperty("question", e.target.value)}
                      rows={2}
                      data-testid="input-node-question"
                    />
                  </div>
                  <div>
                    <Label>{isArabic ? "نوع الإدخال" : "Input Type"}</Label>
                    <Select
                      value={(selectedNode.properties.inputType as string) || "text"}
                      onValueChange={(v) => updateNodeProperty("inputType", v)}
                    >
                      <SelectTrigger data-testid="select-input-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">{isArabic ? "نص" : "Text"}</SelectItem>
                        <SelectItem value="number">{isArabic ? "رقم" : "Number"}</SelectItem>
                        <SelectItem value="phone">{isArabic ? "هاتف" : "Phone"}</SelectItem>
                        <SelectItem value="email">{isArabic ? "بريد" : "Email"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isArabic ? "اسم المتغير" : "Variable Name"}</Label>
                    <Input
                      value={(selectedNode.properties.variable as string) || ""}
                      onChange={(e) => updateNodeProperty("variable", e.target.value)}
                      placeholder="e.g. property_type"
                      data-testid="input-node-variable"
                    />
                  </div>
                </>
              )}

              {(selectedNode.type === "welcome" || selectedNode.type === "quick_replies") && (
                <div>
                  <Label>{isArabic ? "الأزرار" : "Buttons"}</Label>
                  <div className="space-y-2 mt-2">
                    {((selectedNode.properties.buttons as string[]) || []).map((btn, i) => (
                      <div key={i} className="flex gap-2">
                        <Input
                          value={btn}
                          onChange={(e) => updateButton(i, e.target.value)}
                          data-testid={`input-button-${i}`}
                        />
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => removeButton(i)}
                          data-testid={`button-remove-${i}`}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={addButton}
                      data-testid="button-add-button"
                    >
                      <Plus className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                      {isArabic ? "إضافة زر" : "Add Button"}
                    </Button>
                  </div>
                </div>
              )}

              {selectedNode.type === "delay" && (
                <div>
                  <Label>{isArabic ? "مدة التأخير (ثواني)" : "Delay (seconds)"}</Label>
                  <Input
                    type="number"
                    value={(selectedNode.properties.seconds as number) || 2}
                    onChange={(e) => updateNodeProperty("seconds", parseInt(e.target.value))}
                    data-testid="input-delay-seconds"
                  />
                </div>
              )}

              {selectedNode.type === "transfer" && (
                <>
                  <div>
                    <Label>{isArabic ? "القسم" : "Department"}</Label>
                    <Select
                      value={(selectedNode.properties.department as string) || "sales"}
                      onValueChange={(v) => updateNodeProperty("department", v)}
                    >
                      <SelectTrigger data-testid="select-department">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sales">{isArabic ? "المبيعات" : "Sales"}</SelectItem>
                        <SelectItem value="support">{isArabic ? "الدعم" : "Support"}</SelectItem>
                        <SelectItem value="rental">{isArabic ? "الإيجار" : "Rental"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{isArabic ? "رسالة التحويل" : "Transfer Message"}</Label>
                    <Textarea
                      value={(selectedNode.properties.message as string) || ""}
                      onChange={(e) => updateNodeProperty("message", e.target.value)}
                      rows={2}
                      data-testid="input-transfer-message"
                    />
                  </div>
                </>
              )}

              {selectedNode.type === "results" && (
                <div>
                  <Label>{isArabic ? "عدد النتائج" : "Max Results"}</Label>
                  <Input
                    type="number"
                    value={(selectedNode.properties.maxResults as number) || 5}
                    onChange={(e) => updateNodeProperty("maxResults", parseInt(e.target.value))}
                    data-testid="input-max-results"
                  />
                </div>
              )}

              <Button 
                className="w-full" 
                onClick={() => {
                  toast({ 
                    title: isArabic ? "تم الحفظ" : "Saved",
                    description: isArabic ? "تم حفظ التغييرات" : "Changes saved" 
                  });
                }}
                data-testid="button-save-properties"
              >
                <Save className="w-4 h-4 ltr:mr-2 rtl:ml-2" />
                {isArabic ? "حفظ التغييرات" : "Save Changes"}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">
                {isArabic ? "اختر مكوناً لتعديل خصائصه" : "Select a component to edit"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
