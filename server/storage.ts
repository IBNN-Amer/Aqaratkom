import { randomUUID } from "crypto";
import type { 
  User, InsertUser, 
  Lead, InsertLead,
  Property, InsertProperty,
  Deal, InsertDeal,
  Conversation, InsertConversation,
  Message, InsertMessage,
  MessageTemplate, InsertMessageTemplate,
  Activity, InsertActivity,
  PropertyOffer, InsertPropertyOffer,
  RealEstateOffice, InsertRealEstateOffice,
  SalesAgent, InsertSalesAgent,
  PropertyRequest, InsertPropertyRequest,
  PropertyMatch, InsertPropertyMatch,
  Notification, InsertNotification,
  FollowUp, InsertFollowUp,
  CrmIntegration, InsertCrmIntegration,
  CrmSyncJob, InsertCrmSyncJob,
  CrmSyncLog, InsertCrmSyncLog
} from "@shared/schema";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getLeads(): Promise<Lead[]>;
  getLead(id: string): Promise<Lead | undefined>;
  createLead(lead: InsertLead): Promise<Lead>;
  updateLead(id: string, lead: Partial<InsertLead>): Promise<Lead | undefined>;
  deleteLead(id: string): Promise<boolean>;
  
  getProperties(): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, property: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;
  
  getDeals(): Promise<Deal[]>;
  getDeal(id: string): Promise<Deal | undefined>;
  createDeal(deal: InsertDeal): Promise<Deal>;
  updateDeal(id: string, deal: Partial<InsertDeal>): Promise<Deal | undefined>;
  deleteDeal(id: string): Promise<boolean>;
  
  getConversations(): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, conversation: Partial<InsertConversation>): Promise<Conversation | undefined>;
  
  getMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  
  getTemplates(): Promise<MessageTemplate[]>;
  getTemplate(id: string): Promise<MessageTemplate | undefined>;
  createTemplate(template: InsertMessageTemplate): Promise<MessageTemplate>;
  updateTemplate(id: string, template: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined>;
  deleteTemplate(id: string): Promise<boolean>;
  
  getActivities(): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  getPropertyOffers(): Promise<PropertyOffer[]>;
  getPropertyOffer(id: string): Promise<PropertyOffer | undefined>;
  createPropertyOffer(offer: InsertPropertyOffer): Promise<PropertyOffer>;
  updatePropertyOffer(id: string, offer: Partial<InsertPropertyOffer>): Promise<PropertyOffer | undefined>;
  deletePropertyOffer(id: string): Promise<boolean>;
  getPropertyOffersByStatus(status: string): Promise<PropertyOffer[]>;
  
  getOffices(): Promise<RealEstateOffice[]>;
  getOffice(id: string): Promise<RealEstateOffice | undefined>;
  createOffice(office: InsertRealEstateOffice): Promise<RealEstateOffice>;
  updateOffice(id: string, office: Partial<InsertRealEstateOffice>): Promise<RealEstateOffice | undefined>;
  deleteOffice(id: string): Promise<boolean>;
  
  getSalesAgents(): Promise<SalesAgent[]>;
  getSalesAgent(id: string): Promise<SalesAgent | undefined>;
  getSalesAgentsByOffice(officeId: string): Promise<SalesAgent[]>;
  createSalesAgent(agent: InsertSalesAgent): Promise<SalesAgent>;
  updateSalesAgent(id: string, agent: Partial<InsertSalesAgent>): Promise<SalesAgent | undefined>;
  deleteSalesAgent(id: string): Promise<boolean>;
  
  getDashboardStats(): Promise<{
    totalLeads: number;
    leadChange: number;
    activeDeals: number;
    dealChange: number;
    conversionRate: number;
    conversionChange: number;
    revenue: number;
    revenueChange: number;
    pendingOffers: number;
    offersChange: number;
    totalOffices: number;
    totalAgents: number;
    totalProperties: number;
  }>;
  
  getLeadsBySource(): Promise<{ source: string; count: number }[]>;
  getDealsByStage(): Promise<{ stage: string; count: number; value: number }[]>;
  getAnalytics(): Promise<{
    totalLeads: number;
    leadChange: number;
    activeDeals: number;
    dealChange: number;
    conversionRate: number;
    conversionChange: number;
    revenue: number;
    revenueChange: number;
    avgResponseTime: number;
    responseTimeChange: number;
    messagesCount: number;
    messagesChange: number;
    propertiesListed: number;
    propertiesChange: number;
    meetingsScheduled: number;
    meetingsChange: number;
  }>;
  getLeadTrends(): Promise<{ date: string; leads: number; conversions: number }[]>;
  getAgentPerformance(): Promise<{ name: string; leads: number; deals: number; revenue: number }[]>;
  getSourcePerformance(): Promise<{ source: string; leads: number; conversion: number }[]>;
  
  getPropertyRequests(): Promise<PropertyRequest[]>;
  getPropertyRequest(id: string): Promise<PropertyRequest | undefined>;
  createPropertyRequest(request: InsertPropertyRequest): Promise<PropertyRequest>;
  updatePropertyRequest(id: string, request: Partial<InsertPropertyRequest>): Promise<PropertyRequest | undefined>;
  deletePropertyRequest(id: string): Promise<boolean>;
  
  getPropertyMatches(requestId: string): Promise<PropertyMatch[]>;
  getPropertyMatch(id: string): Promise<PropertyMatch | undefined>;
  createPropertyMatch(match: InsertPropertyMatch): Promise<PropertyMatch>;
  updatePropertyMatch(id: string, match: Partial<InsertPropertyMatch>): Promise<PropertyMatch | undefined>;
  
  findMatchingProperties(request: PropertyRequest): Promise<{ offer: PropertyOffer; score: number; details: string }[]>;
  
  getNotifications(userId: string): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationRead(id: string): Promise<Notification | undefined>;
  markAllNotificationsRead(userId: string): Promise<number>;
  deleteNotification(id: string): Promise<boolean>;
  
  getFollowUps(userId?: string): Promise<FollowUp[]>;
  getFollowUp(id: string): Promise<FollowUp | undefined>;
  getFollowUpsByLead(leadId: string): Promise<FollowUp[]>;
  getUpcomingFollowUps(userId: string, days?: number): Promise<FollowUp[]>;
  createFollowUp(followUp: InsertFollowUp): Promise<FollowUp>;
  updateFollowUp(id: string, followUp: Partial<InsertFollowUp>): Promise<FollowUp | undefined>;
  completeFollowUp(id: string, notes?: string): Promise<FollowUp | undefined>;
  deleteFollowUp(id: string): Promise<boolean>;
  
  getCrmIntegrations(userId: string): Promise<CrmIntegration[]>;
  getCrmIntegration(id: string): Promise<CrmIntegration | undefined>;
  createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration>;
  updateCrmIntegration(id: string, integration: Partial<InsertCrmIntegration>): Promise<CrmIntegration | undefined>;
  deleteCrmIntegration(id: string): Promise<boolean>;
  
  getCrmSyncJobs(integrationId: string): Promise<CrmSyncJob[]>;
  getCrmSyncJob(id: string): Promise<CrmSyncJob | undefined>;
  createCrmSyncJob(job: InsertCrmSyncJob): Promise<CrmSyncJob>;
  updateCrmSyncJob(id: string, job: Partial<CrmSyncJob>): Promise<CrmSyncJob | undefined>;
  
  getCrmSyncLogs(syncJobId: string): Promise<CrmSyncLog[]>;
  createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private leads: Map<string, Lead> = new Map();
  private properties: Map<string, Property> = new Map();
  private deals: Map<string, Deal> = new Map();
  private conversations: Map<string, Conversation> = new Map();
  private messages: Map<string, Message> = new Map();
  private offices: Map<string, RealEstateOffice> = new Map();
  private salesAgents: Map<string, SalesAgent> = new Map();
  private templates: Map<string, MessageTemplate> = new Map();
  private activities: Map<string, Activity> = new Map();
  private propertyOffers: Map<string, PropertyOffer> = new Map();
  private propertyRequests: Map<string, PropertyRequest> = new Map();
  private propertyMatches: Map<string, PropertyMatch> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private followUps: Map<string, FollowUp> = new Map();
  private crmIntegrations: Map<string, CrmIntegration> = new Map();
  private crmSyncJobs: Map<string, CrmSyncJob> = new Map();
  private crmSyncLogs: Map<string, CrmSyncLog> = new Map();

  constructor() {
    this.seedData();
  }

  private seedData() {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const leads: Lead[] = [
      { id: "lead-1", name: "Mohammed Al-Rashid", phone: "+971 50 123 4567", email: "mohammed@email.com", source: "facebook", status: "qualified", score: 85, assignedTo: "user-1", notes: null, tags: null, propertyInterest: "Villa", budget: "2,000,000 - 3,000,000", createdAt: oneWeekAgo, lastContactAt: now },
      { id: "lead-2", name: "Sarah Ahmed", phone: "+971 55 987 6543", email: "sarah@email.com", source: "instagram", status: "contacted", score: 65, assignedTo: "user-1", notes: null, tags: null, propertyInterest: "Apartment", budget: "800,000 - 1,200,000", createdAt: twoWeeksAgo, lastContactAt: oneWeekAgo },
      { id: "lead-3", name: "Khalid bin Salman", phone: "+971 54 555 1234", email: "khalid@email.com", source: "website", status: "new", score: 45, assignedTo: null, notes: null, tags: null, propertyInterest: "Office", budget: "500,000 - 800,000", createdAt: now, lastContactAt: null },
      { id: "lead-4", name: "Fatima Al-Maktoum", phone: "+971 52 444 5678", email: "fatima@email.com", source: "whatsapp", status: "negotiating", score: 90, assignedTo: "user-1", notes: null, tags: null, propertyInterest: "Penthouse", budget: "5,000,000+", createdAt: oneWeekAgo, lastContactAt: now },
      { id: "lead-5", name: "Ahmed Hassan", phone: "+971 56 333 9012", email: "ahmed.h@email.com", source: "referral", status: "won", score: 100, assignedTo: "user-1", notes: null, tags: null, propertyInterest: "Townhouse", budget: "1,500,000 - 2,000,000", createdAt: twoWeeksAgo, lastContactAt: oneWeekAgo },
      { id: "lead-6", name: "Layla Ibrahim", phone: "+971 58 222 3456", email: "layla@email.com", source: "phone", status: "contacted", score: 55, assignedTo: "user-1", notes: null, tags: null, propertyInterest: "Apartment", budget: "600,000 - 900,000", createdAt: oneWeekAgo, lastContactAt: now },
    ];
    leads.forEach(lead => this.leads.set(lead.id, lead));

    const properties: Property[] = [
      { id: "prop-1", officeId: null, agentId: null, title: "Luxury Marina View Apartment", titleAr: "شقة فاخرة بإطلالة على المارينا", description: "Stunning 3BR apartment with panoramic marina views", descriptionAr: null, type: "apartment", status: "available", price: "2500000", area: 2100, bedrooms: 3, bathrooms: 4, location: "Dubai Marina, Dubai", locationAr: "دبي مارينا، دبي", images: null, primaryImageIndex: 0, features: null, propertySource: "developer", sourceDetails: null, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
      { id: "prop-2", officeId: null, agentId: null, title: "Palm Jumeirah Villa", titleAr: "فيلا نخلة جميرا", description: "Exquisite beachfront villa with private pool", descriptionAr: null, type: "villa", status: "available", price: "12000000", area: 8500, bedrooms: 6, bathrooms: 8, location: "Palm Jumeirah, Dubai", locationAr: "نخلة جميرا، دبي", images: null, primaryImageIndex: 0, features: null, propertySource: "broker", sourceDetails: null, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
      { id: "prop-3", officeId: null, agentId: null, title: "Downtown Penthouse", titleAr: "بنتهاوس وسط المدينة", description: "Iconic penthouse with Burj Khalifa views", descriptionAr: null, type: "penthouse", status: "reserved", price: "18500000", area: 6200, bedrooms: 5, bathrooms: 6, location: "Downtown Dubai", locationAr: "وسط دبي", images: null, primaryImageIndex: 0, features: null, propertySource: "developer", sourceDetails: null, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
      { id: "prop-4", officeId: null, agentId: null, title: "Business Bay Office", titleAr: "مكتب خليج الأعمال", description: "Modern office space in prime location", descriptionAr: null, type: "office", status: "available", price: "3200000", area: 3500, bedrooms: null, bathrooms: 2, location: "Business Bay, Dubai", locationAr: "خليج الأعمال، دبي", images: null, primaryImageIndex: 0, features: null, propertySource: "direct_owner", sourceDetails: null, createdAt: now, updatedAt: now },
      { id: "prop-5", officeId: null, agentId: null, title: "Arabian Ranches Townhouse", titleAr: "تاون هاوس المرابع العربية", description: "Family-friendly townhouse with garden", descriptionAr: null, type: "townhouse", status: "sold", price: "2800000", area: 3200, bedrooms: 4, bathrooms: 5, location: "Arabian Ranches, Dubai", locationAr: "المرابع العربية، دبي", images: null, primaryImageIndex: 0, features: null, propertySource: "marketing_campaign", sourceDetails: null, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
    ];
    properties.forEach(prop => this.properties.set(prop.id, prop));

    const offices: RealEstateOffice[] = [
      { id: "office-1", name: "Al Faisal Real Estate", nameAr: "الفيصل العقارية", logo: null, phone: "+966 11 456 7890", email: "info@alfaisal.sa", whatsapp: "+966 50 111 2222", address: "King Fahd Road, Riyadh", addressAr: "طريق الملك فهد، الرياض", city: "riyadh", licenseNumber: "FAL-RYD-001", description: "Leading real estate company in Riyadh", descriptionAr: "شركة عقارية رائدة في الرياض", isActive: true, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
      { id: "office-2", name: "Jeddah Properties", nameAr: "عقارات جدة", logo: null, phone: "+966 12 345 6789", email: "contact@jeddahprop.sa", whatsapp: "+966 55 333 4444", address: "Tahlia Street, Jeddah", addressAr: "شارع التحلية، جدة", city: "jeddah", licenseNumber: "FAL-JED-002", description: "Premium properties in Jeddah", descriptionAr: "عقارات متميزة في جدة", isActive: true, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
    ];
    offices.forEach(office => this.offices.set(office.id, office));

    const salesAgents: SalesAgent[] = [
      { id: "agent-1", officeId: "office-1", name: "Ahmed Al-Qahtani", nameAr: "أحمد القحطاني", phone: "+966 50 123 4567", email: "ahmed@alfaisal.sa", role: "manager", avatar: null, isActive: true, propertiesCount: 12, dealsCount: 5, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
      { id: "agent-2", officeId: "office-1", name: "Fatima Al-Harbi", nameAr: "فاطمة الحربي", phone: "+966 55 234 5678", email: "fatima@alfaisal.sa", role: "supervisor", avatar: null, isActive: true, propertiesCount: 8, dealsCount: 3, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
      { id: "agent-3", officeId: "office-1", name: "Omar Al-Shehri", nameAr: "عمر الشهري", phone: "+966 54 345 6789", email: "omar@alfaisal.sa", role: "sales", avatar: null, isActive: true, propertiesCount: 5, dealsCount: 2, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
      { id: "agent-4", officeId: "office-2", name: "Sara Al-Ghamdi", nameAr: "سارة الغامدي", phone: "+966 56 456 7890", email: "sara@jeddahprop.sa", role: "manager", avatar: null, isActive: true, propertiesCount: 15, dealsCount: 7, createdAt: twoWeeksAgo, updatedAt: twoWeeksAgo },
    ];
    salesAgents.forEach(agent => this.salesAgents.set(agent.id, agent));

    const deals: Deal[] = [
      { id: "deal-1", leadId: "lead-1", propertyId: "prop-1", stage: "negotiation", value: "2500000", probability: 70, expectedCloseDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), assignedTo: "user-1", notes: null, createdAt: oneWeekAgo, updatedAt: now },
      { id: "deal-2", leadId: "lead-4", propertyId: "prop-3", stage: "proposal", value: "18500000", probability: 50, expectedCloseDate: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), assignedTo: "user-1", notes: null, createdAt: oneWeekAgo, updatedAt: now },
      { id: "deal-3", leadId: "lead-5", propertyId: "prop-5", stage: "closed_won", value: "2800000", probability: 100, expectedCloseDate: now, assignedTo: "user-1", notes: null, createdAt: twoWeeksAgo, updatedAt: oneWeekAgo },
      { id: "deal-4", leadId: "lead-2", propertyId: null, stage: "qualified", value: "1000000", probability: 20, expectedCloseDate: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), assignedTo: "user-1", notes: null, createdAt: now, updatedAt: now },
    ];
    deals.forEach(deal => this.deals.set(deal.id, deal));

    const conversations: Conversation[] = [
      { id: "conv-1", leadId: "lead-1", assignedTo: "user-1", status: "open", unreadCount: 2, lastMessageAt: now, createdAt: oneWeekAgo },
      { id: "conv-2", leadId: "lead-4", assignedTo: "user-1", status: "open", unreadCount: 0, lastMessageAt: oneWeekAgo, createdAt: twoWeeksAgo },
    ];
    conversations.forEach(conv => this.conversations.set(conv.id, conv));

    const messages: Message[] = [
      { id: "msg-1", conversationId: "conv-1", direction: "incoming", content: "Hi, I'm interested in the Marina apartment", messageType: "text", templateId: null, status: "read", createdAt: oneWeekAgo },
      { id: "msg-2", conversationId: "conv-1", direction: "outgoing", content: "Hello Mohammed! Thank you for your interest. I'd be happy to schedule a viewing for you.", messageType: "text", templateId: null, status: "delivered", createdAt: oneWeekAgo },
      { id: "msg-3", conversationId: "conv-1", direction: "incoming", content: "That would be great. When is it available?", messageType: "text", templateId: null, status: "read", createdAt: now },
      { id: "msg-4", conversationId: "conv-1", direction: "incoming", content: "Also, what is the payment plan?", messageType: "text", templateId: null, status: "unread", createdAt: now },
      { id: "msg-5", conversationId: "conv-2", direction: "outgoing", content: "Hi Fatima, I have some exciting news about the Downtown penthouse!", messageType: "text", templateId: null, status: "delivered", createdAt: oneWeekAgo },
    ];
    messages.forEach(msg => this.messages.set(msg.id, msg));

    const templates: MessageTemplate[] = [
      { id: "tpl-1", name: "Welcome Message", nameAr: "رسالة ترحيب", category: "welcome", content: "Hello {{name}}! Thank you for your interest in our properties. How can I help you today?", contentAr: "مرحباً {{name}}! شكراً لاهتمامك بعقاراتنا. كيف يمكنني مساعدتك اليوم؟", variables: ["name"], approvalStatus: "approved", createdAt: twoWeeksAgo },
      { id: "tpl-2", name: "Property Viewing", nameAr: "معاينة العقار", category: "appointment", content: "Hi {{name}}, I'd like to schedule a viewing for {{property}}. Would {{date}} at {{time}} work for you?", contentAr: "مرحباً {{name}}، أود ترتيب موعد لمعاينة {{property}}. هل يناسبك {{date}} في {{time}}؟", variables: ["name", "property", "date", "time"], approvalStatus: "approved", createdAt: twoWeeksAgo },
      { id: "tpl-3", name: "Follow Up", nameAr: "متابعة", category: "follow_up", content: "Hello {{name}}, I wanted to follow up on our previous conversation. Have you had a chance to consider the property?", contentAr: "مرحباً {{name}}، أردت متابعة محادثتنا السابقة. هل أتيحت لك الفرصة للنظر في العقار؟", variables: ["name"], approvalStatus: "pending", createdAt: oneWeekAgo },
    ];
    templates.forEach(tpl => this.templates.set(tpl.id, tpl));

    const activities: Activity[] = [
      { id: "act-1", type: "lead_created", entityType: "lead", entityId: "lead-3", userId: null, description: "New lead Khalid bin Salman added from website", descriptionAr: null, metadata: null, createdAt: now },
      { id: "act-2", type: "message_received", entityType: "conversation", entityId: "conv-1", userId: null, description: "New message from Mohammed Al-Rashid", descriptionAr: null, metadata: null, createdAt: now },
      { id: "act-3", type: "deal_updated", entityType: "deal", entityId: "deal-1", userId: "user-1", description: "Deal moved to Negotiation stage", descriptionAr: null, metadata: null, createdAt: oneWeekAgo },
      { id: "act-4", type: "deal_won", entityType: "deal", entityId: "deal-3", userId: "user-1", description: "Deal with Ahmed Hassan closed - AED 2.8M", descriptionAr: null, metadata: null, createdAt: oneWeekAgo },
      { id: "act-5", type: "property_created", entityType: "property", entityId: "prop-4", userId: "user-1", description: "New property listed: Business Bay Office", descriptionAr: null, metadata: null, createdAt: now },
    ];
    activities.forEach(act => this.activities.set(act.id, act));

    const propertyOffers: PropertyOffer[] = [
      { id: "offer-1", city: "riyadh", cityAr: "الرياض", district: "Al Olaya", districtAr: "العليا", propertyType: "residential", listingType: "sale", price: "2500000", area: 280, bedrooms: 4, bathrooms: 3, falLicenseNumber: "FAL-12345", brokerName: "محمد العتيبي", brokerPhone: "+966 50 123 4567", brokerEmail: "m.otaibi@broker.sa", developerName: null, propertyCondition: "ready", description: "Luxury apartment with city view", descriptionAr: "شقة فاخرة بإطلالة على المدينة", images: null, primaryImageIndex: 0, reviewStatus: "pending", reviewNotes: null, reviewedBy: null, reviewedAt: null, submittedBy: null, createdAt: now, updatedAt: now },
      { id: "offer-2", city: "jeddah", cityAr: "جدة", district: "Al Hamra", districtAr: "الحمراء", propertyType: "commercial", listingType: "rent", price: "180000", area: 450, bedrooms: null, bathrooms: 2, falLicenseNumber: "FAL-67890", brokerName: "سارة الغامدي", brokerPhone: "+966 55 987 6543", brokerEmail: "sara.g@realestate.sa", developerName: "شركة دار الأركان", propertyCondition: "ready", description: "Prime office space", descriptionAr: "مساحة مكتبية متميزة", images: null, primaryImageIndex: 0, reviewStatus: "approved", reviewNotes: null, reviewedBy: "user-1", reviewedAt: oneWeekAgo, submittedBy: null, createdAt: oneWeekAgo, updatedAt: oneWeekAgo },
      { id: "offer-3", city: "riyadh", cityAr: "الرياض", district: "Al Malqa", districtAr: "الملقا", propertyType: "residential", listingType: "sale", price: "4500000", area: 520, bedrooms: 6, bathrooms: 5, falLicenseNumber: null, brokerName: "خالد السبيعي", brokerPhone: "+966 54 555 1234", brokerEmail: null, developerName: "روشن", propertyCondition: "under_construction", description: "Modern villa in premium location", descriptionAr: "فيلا عصرية في موقع مميز", images: null, primaryImageIndex: 0, reviewStatus: "needs_revision", reviewNotes: "Please add FAL license number", reviewedBy: "user-1", reviewedAt: now, submittedBy: null, createdAt: twoWeeksAgo, updatedAt: now },
    ];
    propertyOffers.forEach(offer => this.propertyOffers.set(offer.id, offer));

    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const threeHoursAgo = new Date(now.getTime() - 3 * 60 * 60 * 1000);
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const notifications: Notification[] = [
      { id: "notif-1", userId: "user-1", type: "new_lead", title: "New lead from website", titleAr: "عميل جديد من الموقع", message: "Khalid bin Salman is interested in office properties", messageAr: "خالد بن سلمان مهتم بالعقارات المكتبية", entityType: "lead", entityId: "lead-3", isRead: false, priority: "high", createdAt: now, readAt: null },
      { id: "notif-2", userId: "user-1", type: "new_message", title: "New WhatsApp message", titleAr: "رسالة واتساب جديدة", message: "Mohammed Al-Rashid: What is the payment plan?", messageAr: "محمد الراشد: ما هي خطة الدفع؟", entityType: "conversation", entityId: "conv-1", isRead: false, priority: "normal", createdAt: oneHourAgo, readAt: null },
      { id: "notif-3", userId: "user-1", type: "deal_update", title: "Deal moved to Negotiation", titleAr: "انتقلت الصفقة إلى مرحلة التفاوض", message: "Marina apartment deal with Mohammed Al-Rashid", messageAr: "صفقة شقة المارينا مع محمد الراشد", entityType: "deal", entityId: "deal-1", isRead: false, priority: "normal", createdAt: threeHoursAgo, readAt: null },
      { id: "notif-4", userId: "user-1", type: "offer_update", title: "Property offer needs revision", titleAr: "عرض العقار يحتاج مراجعة", message: "Al Malqa villa offer requires FAL license number", messageAr: "عرض فيلا الملقا يتطلب رقم ترخيص فال", entityType: "offer", entityId: "offer-3", isRead: true, priority: "normal", createdAt: yesterday, readAt: yesterday },
      { id: "notif-5", userId: "user-1", type: "follow_up_reminder", title: "Follow-up reminder", titleAr: "تذكير بالمتابعة", message: "Call Sarah Ahmed about apartment viewing", messageAr: "اتصل بسارة أحمد بخصوص معاينة الشقة", entityType: "lead", entityId: "lead-2", isRead: true, priority: "high", createdAt: yesterday, readAt: yesterday },
    ];
    notifications.forEach(notif => this.notifications.set(notif.id, notif));

    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    
    const followUps: FollowUp[] = [
      { id: "fu-1", userId: "user-1", leadId: "lead-1", dealId: "deal-1", propertyId: "prop-1", type: "call", title: "Call about payment plan", titleAr: "مكالمة بخصوص خطة الدفع", description: "Discuss payment options for Marina apartment", descriptionAr: "مناقشة خيارات الدفع لشقة المارينا", scheduledAt: tomorrow, reminderAt: new Date(tomorrow.getTime() - 60 * 60 * 1000), status: "pending", priority: "high", notes: null, completedAt: null, createdAt: now, updatedAt: now },
      { id: "fu-2", userId: "user-1", leadId: "lead-2", dealId: null, propertyId: null, type: "meeting", title: "Property viewing with Sarah", titleAr: "معاينة عقار مع سارة", description: "Show available apartments in Dubai Marina", descriptionAr: "عرض الشقق المتاحة في دبي مارينا", scheduledAt: inThreeDays, reminderAt: new Date(inThreeDays.getTime() - 2 * 60 * 60 * 1000), status: "pending", priority: "normal", notes: null, completedAt: null, createdAt: now, updatedAt: now },
      { id: "fu-3", userId: "user-1", leadId: "lead-4", dealId: "deal-2", propertyId: "prop-3", type: "site_visit", title: "Penthouse site visit", titleAr: "زيارة موقع البنتهاوس", description: "Tour of Downtown penthouse with Fatima", descriptionAr: "جولة في بنتهاوس وسط المدينة مع فاطمة", scheduledAt: yesterday, reminderAt: null, status: "completed", priority: "high", notes: "Client loved the view, proceeding with negotiation", completedAt: yesterday, createdAt: oneWeekAgo, updatedAt: yesterday },
    ];
    followUps.forEach(fu => this.followUps.set(fu.id, fu));
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role ?? "sales",
      avatar: insertUser.avatar ?? null,
      fullNameAr: insertUser.fullNameAr ?? null,
      officeId: insertUser.officeId ?? null,
      phone: insertUser.phone ?? null,
      email: insertUser.email ?? null,
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      lastLoginAt: null,
    };
    this.users.set(id, user);
    return user;
  }

  async getLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getLead(id: string): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async createLead(insertLead: InsertLead): Promise<Lead> {
    const id = randomUUID();
    const lead: Lead = { 
      ...insertLead, 
      id, 
      createdAt: new Date(),
      lastContactAt: null,
      score: insertLead.score ?? 0,
      status: insertLead.status ?? "new",
      assignedTo: insertLead.assignedTo ?? null,
      notes: insertLead.notes ?? null,
      tags: insertLead.tags ?? null,
      propertyInterest: insertLead.propertyInterest ?? null,
      budget: insertLead.budget ?? null,
      email: insertLead.email ?? null,
    };
    this.leads.set(id, lead);
    
    await this.createActivity({
      type: "lead_created",
      entityType: "lead",
      entityId: id,
      description: `New lead ${lead.name} added from ${lead.source}`,
    });
    
    return lead;
  }

  async updateLead(id: string, updates: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    const updated = { ...lead, ...updates };
    this.leads.set(id, updated);
    return updated;
  }

  async deleteLead(id: string): Promise<boolean> {
    return this.leads.delete(id);
  }

  async getProperties(): Promise<Property[]> {
    return Array.from(this.properties.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getProperty(id: string): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async createProperty(insertProperty: InsertProperty): Promise<Property> {
    const id = randomUUID();
    const property: Property = { 
      ...insertProperty, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertProperty.status ?? "available",
      officeId: insertProperty.officeId ?? null,
      agentId: insertProperty.agentId ?? null,
      titleAr: insertProperty.titleAr ?? null,
      description: insertProperty.description ?? null,
      descriptionAr: insertProperty.descriptionAr ?? null,
      locationAr: insertProperty.locationAr ?? null,
      area: insertProperty.area ?? null,
      bedrooms: insertProperty.bedrooms ?? null,
      bathrooms: insertProperty.bathrooms ?? null,
      images: insertProperty.images ?? null,
      primaryImageIndex: insertProperty.primaryImageIndex ?? 0,
      features: insertProperty.features ?? null,
      propertySource: insertProperty.propertySource ?? null,
      sourceDetails: insertProperty.sourceDetails ?? null,
    };
    this.properties.set(id, property);
    
    await this.createActivity({
      type: "property_created",
      entityType: "property",
      entityId: id,
      description: `New property listed: ${property.title}`,
    });
    
    return property;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    const updated = { ...property, ...updates };
    this.properties.set(id, updated);
    return updated;
  }

  async deleteProperty(id: string): Promise<boolean> {
    return this.properties.delete(id);
  }

  async getDeals(): Promise<Deal[]> {
    return Array.from(this.deals.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getDeal(id: string): Promise<Deal | undefined> {
    return this.deals.get(id);
  }

  async createDeal(insertDeal: InsertDeal): Promise<Deal> {
    const id = randomUUID();
    const deal: Deal = { 
      ...insertDeal, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      stage: insertDeal.stage ?? "qualified",
      propertyId: insertDeal.propertyId ?? null,
      value: insertDeal.value ?? null,
      probability: insertDeal.probability ?? 20,
      expectedCloseDate: insertDeal.expectedCloseDate ?? null,
      assignedTo: insertDeal.assignedTo ?? null,
      notes: insertDeal.notes ?? null,
    };
    this.deals.set(id, deal);
    
    const lead = await this.getLead(deal.leadId);
    await this.createActivity({
      type: "deal_created",
      entityType: "deal",
      entityId: id,
      description: `New deal created with ${lead?.name || "Unknown"}`,
    });
    
    return deal;
  }

  async updateDeal(id: string, updates: Partial<InsertDeal>): Promise<Deal | undefined> {
    const deal = this.deals.get(id);
    if (!deal) return undefined;
    const updated = { ...deal, ...updates, updatedAt: new Date() };
    this.deals.set(id, updated);
    
    if (updates.stage && updates.stage !== deal.stage) {
      const lead = await this.getLead(deal.leadId);
      const activityType = updates.stage === "closed_won" ? "deal_won" : 
                          updates.stage === "closed_lost" ? "deal_lost" : "deal_updated";
      await this.createActivity({
        type: activityType,
        entityType: "deal",
        entityId: id,
        description: `Deal with ${lead?.name || "Unknown"} moved to ${updates.stage}`,
      });
    }
    
    return updated;
  }

  async deleteDeal(id: string): Promise<boolean> {
    return this.deals.delete(id);
  }

  async getConversations(): Promise<Conversation[]> {
    const conversations = Array.from(this.conversations.values());
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        const lead = await this.getLead(conv.leadId);
        const messages = await this.getMessages(conv.id);
        const lastMessage = messages[messages.length - 1];
        return { ...conv, lead, lastMessage };
      })
    );
    return conversationsWithDetails.sort((a, b) => 
      new Date(b.lastMessageAt || 0).getTime() - new Date(a.lastMessageAt || 0).getTime()
    );
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(insertConversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = { 
      ...insertConversation, 
      id, 
      createdAt: new Date(),
      lastMessageAt: new Date(),
      status: insertConversation.status ?? "open",
      assignedTo: insertConversation.assignedTo ?? null,
      unreadCount: insertConversation.unreadCount ?? 0,
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async updateConversation(id: string, updates: Partial<InsertConversation>): Promise<Conversation | undefined> {
    const conversation = this.conversations.get(id);
    if (!conversation) return undefined;
    const updated = { ...conversation, ...updates };
    this.conversations.set(id, updated);
    return updated;
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => 
        new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime()
      );
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = { 
      ...insertMessage, 
      id, 
      createdAt: new Date(),
      templateId: insertMessage.templateId ?? null,
      messageType: insertMessage.messageType ?? "text",
      status: insertMessage.status ?? "sent",
    };
    this.messages.set(id, message);
    
    await this.updateConversation(message.conversationId, {
      lastMessageAt: new Date(),
      unreadCount: message.direction === "incoming" ? 1 : 0,
    });
    
    return message;
  }

  async getTemplates(): Promise<MessageTemplate[]> {
    return Array.from(this.templates.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getTemplate(id: string): Promise<MessageTemplate | undefined> {
    return this.templates.get(id);
  }

  async createTemplate(insertTemplate: InsertMessageTemplate): Promise<MessageTemplate> {
    const id = randomUUID();
    const template: MessageTemplate = { 
      ...insertTemplate, 
      id, 
      createdAt: new Date(),
      nameAr: insertTemplate.nameAr ?? null,
      contentAr: insertTemplate.contentAr ?? null,
      variables: insertTemplate.variables ?? null,
      approvalStatus: insertTemplate.approvalStatus ?? "pending",
    };
    this.templates.set(id, template);
    return template;
  }

  async updateTemplate(id: string, updates: Partial<InsertMessageTemplate>): Promise<MessageTemplate | undefined> {
    const template = this.templates.get(id);
    if (!template) return undefined;
    const updated = { ...template, ...updates };
    this.templates.set(id, updated);
    return updated;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return this.templates.delete(id);
  }

  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async createActivity(insertActivity: InsertActivity): Promise<Activity> {
    const id = randomUUID();
    const activity: Activity = { 
      ...insertActivity, 
      id, 
      createdAt: new Date(),
      userId: insertActivity.userId ?? null,
      descriptionAr: insertActivity.descriptionAr ?? null,
      metadata: insertActivity.metadata ?? null,
    };
    this.activities.set(id, activity);
    return activity;
  }

  async getPropertyOffers(): Promise<PropertyOffer[]> {
    return Array.from(this.propertyOffers.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPropertyOffer(id: string): Promise<PropertyOffer | undefined> {
    return this.propertyOffers.get(id);
  }

  async createPropertyOffer(insertOffer: InsertPropertyOffer): Promise<PropertyOffer> {
    const id = randomUUID();
    const offer: PropertyOffer = {
      ...insertOffer,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      reviewedAt: null,
      cityAr: insertOffer.cityAr ?? null,
      districtAr: insertOffer.districtAr ?? null,
      bedrooms: insertOffer.bedrooms ?? null,
      bathrooms: insertOffer.bathrooms ?? null,
      falLicenseNumber: insertOffer.falLicenseNumber ?? null,
      brokerEmail: insertOffer.brokerEmail ?? null,
      developerName: insertOffer.developerName ?? null,
      description: insertOffer.description ?? null,
      descriptionAr: insertOffer.descriptionAr ?? null,
      images: insertOffer.images ?? null,
      primaryImageIndex: insertOffer.primaryImageIndex ?? 0,
      reviewStatus: insertOffer.reviewStatus ?? "pending",
      reviewNotes: insertOffer.reviewNotes ?? null,
      reviewedBy: insertOffer.reviewedBy ?? null,
      submittedBy: insertOffer.submittedBy ?? null,
    };
    this.propertyOffers.set(id, offer);
    
    await this.createActivity({
      type: "offer_submitted",
      entityType: "property_offer",
      entityId: id,
      description: `New property offer submitted by ${offer.brokerName}`,
      descriptionAr: `تم استلام عرض عقاري جديد من ${offer.brokerName}`,
    });
    
    return offer;
  }

  async updatePropertyOffer(id: string, updates: Partial<InsertPropertyOffer>): Promise<PropertyOffer | undefined> {
    const offer = this.propertyOffers.get(id);
    if (!offer) return undefined;
    const updated: PropertyOffer = { 
      ...offer, 
      ...updates, 
      updatedAt: new Date(),
      reviewedAt: updates.reviewStatus && updates.reviewStatus !== offer.reviewStatus ? new Date() : offer.reviewedAt,
    };
    this.propertyOffers.set(id, updated);
    
    if (updates.reviewStatus && updates.reviewStatus !== offer.reviewStatus) {
      await this.createActivity({
        type: "offer_reviewed",
        entityType: "property_offer",
        entityId: id,
        description: `Property offer status changed to ${updates.reviewStatus}`,
        descriptionAr: `تم تغيير حالة العرض إلى ${updates.reviewStatus}`,
      });
    }
    
    return updated;
  }

  async deletePropertyOffer(id: string): Promise<boolean> {
    return this.propertyOffers.delete(id);
  }

  async getPropertyOffersByStatus(status: string): Promise<PropertyOffer[]> {
    const offers = await this.getPropertyOffers();
    return offers.filter(o => o.reviewStatus === status);
  }

  async getOffices(): Promise<RealEstateOffice[]> {
    return Array.from(this.offices.values()).sort((a, b) => 
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getOffice(id: string): Promise<RealEstateOffice | undefined> {
    return this.offices.get(id);
  }

  async createOffice(office: InsertRealEstateOffice): Promise<RealEstateOffice> {
    const id = randomUUID();
    const newOffice: RealEstateOffice = {
      ...office,
      id,
      logo: office.logo ?? null,
      nameAr: office.nameAr ?? null,
      email: office.email ?? null,
      whatsapp: office.whatsapp ?? null,
      address: office.address ?? null,
      addressAr: office.addressAr ?? null,
      city: office.city ?? null,
      licenseNumber: office.licenseNumber ?? null,
      description: office.description ?? null,
      descriptionAr: office.descriptionAr ?? null,
      isActive: office.isActive ?? true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.offices.set(id, newOffice);
    await this.createActivity({
      type: "office_created",
      entityType: "office",
      entityId: id,
      description: `New office created: ${office.name}`,
      descriptionAr: `تم إنشاء مكتب جديد: ${office.nameAr || office.name}`,
    });
    return newOffice;
  }

  async updateOffice(id: string, updates: Partial<InsertRealEstateOffice>): Promise<RealEstateOffice | undefined> {
    const office = this.offices.get(id);
    if (!office) return undefined;
    const updated: RealEstateOffice = { ...office, ...updates, updatedAt: new Date() };
    this.offices.set(id, updated);
    return updated;
  }

  async deleteOffice(id: string): Promise<boolean> {
    return this.offices.delete(id);
  }

  async getSalesAgents(): Promise<SalesAgent[]> {
    return Array.from(this.salesAgents.values()).sort((a, b) =>
      new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
    );
  }

  async getSalesAgent(id: string): Promise<SalesAgent | undefined> {
    return this.salesAgents.get(id);
  }

  async getSalesAgentsByOffice(officeId: string): Promise<SalesAgent[]> {
    const agents = await this.getSalesAgents();
    return agents.filter(a => a.officeId === officeId);
  }

  async createSalesAgent(agent: InsertSalesAgent): Promise<SalesAgent> {
    const id = randomUUID();
    const newAgent: SalesAgent = {
      ...agent,
      id,
      nameAr: agent.nameAr ?? null,
      email: agent.email ?? null,
      role: agent.role ?? "sales",
      avatar: agent.avatar ?? null,
      isActive: agent.isActive ?? true,
      propertiesCount: agent.propertiesCount ?? 0,
      dealsCount: agent.dealsCount ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.salesAgents.set(id, newAgent);
    await this.createActivity({
      type: "agent_created",
      entityType: "sales_agent",
      entityId: id,
      description: `New sales agent added: ${agent.name}`,
      descriptionAr: `تم إضافة سيلز جديد: ${agent.nameAr || agent.name}`,
    });
    return newAgent;
  }

  async updateSalesAgent(id: string, updates: Partial<InsertSalesAgent>): Promise<SalesAgent | undefined> {
    const agent = this.salesAgents.get(id);
    if (!agent) return undefined;
    const updated: SalesAgent = { ...agent, ...updates, updatedAt: new Date() };
    this.salesAgents.set(id, updated);
    return updated;
  }

  async deleteSalesAgent(id: string): Promise<boolean> {
    return this.salesAgents.delete(id);
  }

  async getDashboardStats() {
    const leads = await this.getLeads();
    const deals = await this.getDeals();
    const offers = await this.getPropertyOffers();
    const offices = await this.getOffices();
    const agents = await this.getSalesAgents();
    const properties = await this.getProperties();
    const pendingOffers = offers.filter(o => o.reviewStatus === "pending");
    const activeDeals = deals.filter(d => !d.stage.startsWith("closed"));
    const wonDeals = deals.filter(d => d.stage === "closed_won");
    const revenue = wonDeals.reduce((sum, d) => sum + parseFloat(d.value?.toString() || "0"), 0);
    const conversionRate = leads.length > 0 ? Math.round((wonDeals.length / leads.length) * 100) : 0;

    return {
      totalLeads: leads.length,
      leadChange: 12,
      activeDeals: activeDeals.length,
      dealChange: 8,
      conversionRate,
      conversionChange: 5,
      revenue,
      revenueChange: 15,
      pendingOffers: pendingOffers.length,
      offersChange: offers.length > 0 ? Math.round((pendingOffers.length / offers.length) * 100) : 0,
      totalOffices: offices.length,
      totalAgents: agents.length,
      totalProperties: properties.length,
    };
  }

  async getLeadsBySource() {
    const leads = await this.getLeads();
    const sourceMap = new Map<string, number>();
    leads.forEach(lead => {
      sourceMap.set(lead.source, (sourceMap.get(lead.source) || 0) + 1);
    });
    return Array.from(sourceMap.entries()).map(([source, count]) => ({ source, count }));
  }

  async getDealsByStage() {
    const deals = await this.getDeals();
    const stageMap = new Map<string, { count: number; value: number }>();
    deals.forEach(deal => {
      const current = stageMap.get(deal.stage) || { count: 0, value: 0 };
      stageMap.set(deal.stage, {
        count: current.count + 1,
        value: current.value + parseFloat(deal.value?.toString() || "0"),
      });
    });
    return Array.from(stageMap.entries()).map(([stage, data]) => ({ 
      stage: stage.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase()),
      ...data 
    }));
  }

  async getAnalytics() {
    const stats = await this.getDashboardStats();
    const messages = Array.from(this.messages.values());
    const properties = await this.getProperties();
    
    return {
      ...stats,
      avgResponseTime: 15,
      responseTimeChange: -10,
      messagesCount: messages.length,
      messagesChange: 20,
      propertiesListed: properties.length,
      propertiesChange: 10,
      meetingsScheduled: 12,
      meetingsChange: 25,
    };
  }

  async getLeadTrends() {
    const now = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000);
      return {
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        leads: Math.floor(Math.random() * 10) + 5,
        conversions: Math.floor(Math.random() * 5) + 1,
      };
    });
  }

  async getAgentPerformance() {
    return [
      { name: "Ahmed M.", leads: 45, deals: 12, revenue: 8500000 },
      { name: "Sara K.", leads: 38, deals: 9, revenue: 6200000 },
      { name: "Omar H.", leads: 32, deals: 7, revenue: 4800000 },
      { name: "Fatima A.", leads: 28, deals: 6, revenue: 3500000 },
    ];
  }

  async getSourcePerformance() {
    return [
      { source: "Facebook", leads: 45, conversion: 28 },
      { source: "Instagram", leads: 32, conversion: 22 },
      { source: "Website", leads: 28, conversion: 35 },
      { source: "WhatsApp", leads: 22, conversion: 40 },
      { source: "Referral", leads: 18, conversion: 55 },
      { source: "Phone", leads: 12, conversion: 25 },
    ];
  }

  async getPropertyRequests(): Promise<PropertyRequest[]> {
    return Array.from(this.propertyRequests.values()).sort((a, b) => 
      new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  async getPropertyRequest(id: string): Promise<PropertyRequest | undefined> {
    return this.propertyRequests.get(id);
  }

  async createPropertyRequest(insertRequest: InsertPropertyRequest): Promise<PropertyRequest> {
    const id = randomUUID();
    const request: PropertyRequest = {
      ...insertRequest,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: insertRequest.status ?? "active",
      matchCount: 0,
      requesterId: insertRequest.requesterId ?? null,
      requesterAgentId: insertRequest.requesterAgentId ?? null,
      requesterOfficeId: insertRequest.requesterOfficeId ?? null,
      cityAr: insertRequest.cityAr ?? null,
      district: insertRequest.district ?? null,
      districtAr: insertRequest.districtAr ?? null,
      minPrice: insertRequest.minPrice ?? null,
      minArea: insertRequest.minArea ?? null,
      maxArea: insertRequest.maxArea ?? null,
      bedrooms: insertRequest.bedrooms ?? null,
      bathrooms: insertRequest.bathrooms ?? null,
      propertyCondition: insertRequest.propertyCondition ?? null,
      clientName: insertRequest.clientName ?? null,
      clientPhone: insertRequest.clientPhone ?? null,
      notes: insertRequest.notes ?? null,
      notesAr: insertRequest.notesAr ?? null,
      expiresAt: insertRequest.expiresAt ?? null,
    };
    this.propertyRequests.set(id, request);
    
    await this.createActivity({
      type: "lead_created",
      entityType: "property_request",
      entityId: id,
      description: `New property request for ${request.propertyType} in ${request.city}`,
    });
    
    return request;
  }

  async updatePropertyRequest(id: string, updates: Partial<InsertPropertyRequest>): Promise<PropertyRequest | undefined> {
    const request = this.propertyRequests.get(id);
    if (!request) return undefined;
    const updated = { ...request, ...updates, updatedAt: new Date() };
    this.propertyRequests.set(id, updated);
    return updated;
  }

  async deletePropertyRequest(id: string): Promise<boolean> {
    return this.propertyRequests.delete(id);
  }

  async getPropertyMatches(requestId: string): Promise<PropertyMatch[]> {
    return Array.from(this.propertyMatches.values())
      .filter(m => m.requestId === requestId)
      .sort((a, b) => b.matchScore - a.matchScore);
  }

  async getPropertyMatch(id: string): Promise<PropertyMatch | undefined> {
    return this.propertyMatches.get(id);
  }

  async createPropertyMatch(insertMatch: InsertPropertyMatch): Promise<PropertyMatch> {
    const id = randomUUID();
    const match: PropertyMatch = {
      ...insertMatch,
      id,
      createdAt: new Date(),
      status: insertMatch.status ?? "new",
      matchDetails: insertMatch.matchDetails ?? null,
      viewedAt: insertMatch.viewedAt ?? null,
      contactedAt: insertMatch.contactedAt ?? null,
    };
    this.propertyMatches.set(id, match);
    return match;
  }

  async updatePropertyMatch(id: string, updates: Partial<PropertyMatch>): Promise<PropertyMatch | undefined> {
    const match = this.propertyMatches.get(id);
    if (!match) return undefined;
    const processedUpdates: Partial<PropertyMatch> = { ...updates };
    if (updates.contactedAt && typeof updates.contactedAt === "string") {
      processedUpdates.contactedAt = new Date(updates.contactedAt);
    }
    if (updates.viewedAt && typeof updates.viewedAt === "string") {
      processedUpdates.viewedAt = new Date(updates.viewedAt);
    }
    const updated = { ...match, ...processedUpdates };
    this.propertyMatches.set(id, updated);
    return updated;
  }

  async findMatchingProperties(request: PropertyRequest): Promise<{ offer: PropertyOffer; score: number; details: string }[]> {
    const offers = await this.getPropertyOffersByStatus("approved");
    const matches: { offer: PropertyOffer; score: number; details: string }[] = [];

    for (const offer of offers) {
      let score = 0;
      const matchReasons: string[] = [];

      if (offer.city?.toLowerCase() === request.city?.toLowerCase()) {
        score += 40;
        matchReasons.push("city_match");
      }

      if (offer.listingType === request.listingType) {
        const offerTypeMap: Record<string, string[]> = {
          residential: ["apartment", "villa", "townhouse", "penthouse"],
          commercial: ["office", "retail"],
          investment: ["land"],
        };
        const offerTypes = offerTypeMap[offer.propertyType] || [];
        if (offerTypes.includes(request.propertyType?.toLowerCase() || "")) {
          score += 25;
          matchReasons.push("type_match");
        }
      }

      const offerPrice = parseFloat(offer.price || "0");
      const minPrice = parseFloat(request.minPrice || "0");
      const maxPrice = parseFloat(request.maxPrice || "999999999");
      if (offerPrice > 0 && offerPrice >= minPrice && offerPrice <= maxPrice) {
        score += 20;
        matchReasons.push("price_match");
      }

      if (request.district && request.district.length > 0 && 
          offer.district?.toLowerCase() === request.district.toLowerCase()) {
        score += 10;
        matchReasons.push("district_match");
      }

      if (request.propertyCondition && request.propertyCondition.length > 0 &&
          offer.propertyCondition === request.propertyCondition) {
        score += 5;
        matchReasons.push("condition_match");
      }

      if (score >= 40) {
        matches.push({
          offer,
          score,
          details: matchReasons.join(","),
        });
      }
    }

    return matches.sort((a, b) => b.score - a.score);
  }

  async getNotifications(userId: string): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    return Array.from(this.notifications.values())
      .filter(n => n.userId === userId && !n.isRead).length;
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = randomUUID();
    const notification: Notification = {
      ...insertNotification,
      id,
      createdAt: new Date(),
      isRead: false,
      readAt: null,
      titleAr: insertNotification.titleAr ?? null,
      messageAr: insertNotification.messageAr ?? null,
      entityType: insertNotification.entityType ?? null,
      entityId: insertNotification.entityId ?? null,
      priority: insertNotification.priority ?? "normal",
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationRead(id: string): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    const updated = { ...notification, isRead: true, readAt: new Date() };
    this.notifications.set(id, updated);
    return updated;
  }

  async markAllNotificationsRead(userId: string): Promise<number> {
    let count = 0;
    const entries = Array.from(this.notifications.entries());
    for (let i = 0; i < entries.length; i++) {
      const [id, notification] = entries[i];
      if (notification.userId === userId && !notification.isRead) {
        this.notifications.set(id, { ...notification, isRead: true, readAt: new Date() });
        count++;
      }
    }
    return count;
  }

  async deleteNotification(id: string): Promise<boolean> {
    return this.notifications.delete(id);
  }

  async getFollowUps(userId?: string): Promise<FollowUp[]> {
    let followUps = Array.from(this.followUps.values());
    if (userId) {
      followUps = followUps.filter(f => f.userId === userId);
    }
    return followUps.sort((a, b) => 
      new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime()
    );
  }

  async getFollowUp(id: string): Promise<FollowUp | undefined> {
    return this.followUps.get(id);
  }

  async getFollowUpsByLead(leadId: string): Promise<FollowUp[]> {
    return Array.from(this.followUps.values())
      .filter(f => f.leadId === leadId)
      .sort((a, b) => new Date(a.scheduledAt || 0).getTime() - new Date(b.scheduledAt || 0).getTime());
  }

  async getUpcomingFollowUps(userId: string, days: number = 7): Promise<FollowUp[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    return Array.from(this.followUps.values())
      .filter(f => 
        f.userId === userId && 
        f.status === "pending" &&
        new Date(f.scheduledAt) >= now &&
        new Date(f.scheduledAt) <= futureDate
      )
      .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  }

  async createFollowUp(insertFollowUp: InsertFollowUp): Promise<FollowUp> {
    const id = randomUUID();
    const followUp: FollowUp = {
      ...insertFollowUp,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
      status: insertFollowUp.status ?? "pending",
      priority: insertFollowUp.priority ?? "normal",
      titleAr: insertFollowUp.titleAr ?? null,
      description: insertFollowUp.description ?? null,
      descriptionAr: insertFollowUp.descriptionAr ?? null,
      leadId: insertFollowUp.leadId ?? null,
      dealId: insertFollowUp.dealId ?? null,
      propertyId: insertFollowUp.propertyId ?? null,
      reminderAt: insertFollowUp.reminderAt ?? null,
      notes: insertFollowUp.notes ?? null,
    };
    this.followUps.set(id, followUp);
    
    await this.createActivity({
      type: "follow_up_created",
      entityType: "follow_up",
      entityId: id,
      description: `Follow-up scheduled: ${followUp.title}`,
    });
    
    return followUp;
  }

  async updateFollowUp(id: string, updates: Partial<InsertFollowUp>): Promise<FollowUp | undefined> {
    const followUp = this.followUps.get(id);
    if (!followUp) return undefined;
    const updated = { ...followUp, ...updates, updatedAt: new Date() };
    this.followUps.set(id, updated);
    return updated;
  }

  async completeFollowUp(id: string, notes?: string): Promise<FollowUp | undefined> {
    const followUp = this.followUps.get(id);
    if (!followUp) return undefined;
    const updated = { 
      ...followUp, 
      status: "completed" as const, 
      completedAt: new Date(), 
      updatedAt: new Date(),
      notes: notes ?? followUp.notes 
    };
    this.followUps.set(id, updated);
    
    await this.createActivity({
      type: "follow_up_completed",
      entityType: "follow_up",
      entityId: id,
      description: `Follow-up completed: ${followUp.title}`,
    });
    
    return updated;
  }

  async deleteFollowUp(id: string): Promise<boolean> {
    return this.followUps.delete(id);
  }

  async getCrmIntegrations(userId: string): Promise<CrmIntegration[]> {
    return Array.from(this.crmIntegrations.values())
      .filter(i => i.userId === userId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCrmIntegration(id: string): Promise<CrmIntegration | undefined> {
    return this.crmIntegrations.get(id);
  }

  async createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration> {
    const id = randomUUID();
    const now = new Date();
    const newIntegration: CrmIntegration = {
      id,
      userId: integration.userId,
      provider: integration.provider,
      name: integration.name,
      nameAr: integration.nameAr ?? null,
      isActive: integration.isActive ?? true,
      apiKey: integration.apiKey ?? null,
      apiSecret: integration.apiSecret ?? null,
      instanceUrl: integration.instanceUrl ?? null,
      accessToken: integration.accessToken ?? null,
      refreshToken: integration.refreshToken ?? null,
      tokenExpiresAt: integration.tokenExpiresAt ?? null,
      syncMode: integration.syncMode ?? "one_way_import",
      syncEntities: integration.syncEntities ?? null,
      fieldMappings: integration.fieldMappings ?? null,
      lastSyncAt: null,
      lastSyncStatus: null,
      createdAt: now,
      updatedAt: now,
    };
    this.crmIntegrations.set(id, newIntegration);
    return newIntegration;
  }

  async updateCrmIntegration(id: string, updates: Partial<InsertCrmIntegration>): Promise<CrmIntegration | undefined> {
    const integration = this.crmIntegrations.get(id);
    if (!integration) return undefined;
    const updated = { ...integration, ...updates, updatedAt: new Date() };
    this.crmIntegrations.set(id, updated);
    return updated;
  }

  async deleteCrmIntegration(id: string): Promise<boolean> {
    return this.crmIntegrations.delete(id);
  }

  async getCrmSyncJobs(integrationId: string): Promise<CrmSyncJob[]> {
    return Array.from(this.crmSyncJobs.values())
      .filter(j => j.integrationId === integrationId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getCrmSyncJob(id: string): Promise<CrmSyncJob | undefined> {
    return this.crmSyncJobs.get(id);
  }

  async createCrmSyncJob(job: InsertCrmSyncJob): Promise<CrmSyncJob> {
    const id = randomUUID();
    const newJob: CrmSyncJob = {
      id,
      integrationId: job.integrationId,
      jobType: job.jobType,
      entityType: job.entityType,
      status: job.status ?? "queued",
      direction: job.direction,
      totalRecords: job.totalRecords ?? 0,
      processedRecords: job.processedRecords ?? 0,
      successRecords: job.successRecords ?? 0,
      failedRecords: job.failedRecords ?? 0,
      errorMessage: job.errorMessage ?? null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date(),
    };
    this.crmSyncJobs.set(id, newJob);
    return newJob;
  }

  async updateCrmSyncJob(id: string, updates: Partial<CrmSyncJob>): Promise<CrmSyncJob | undefined> {
    const job = this.crmSyncJobs.get(id);
    if (!job) return undefined;
    const updated = { ...job, ...updates };
    this.crmSyncJobs.set(id, updated);
    return updated;
  }

  async getCrmSyncLogs(syncJobId: string): Promise<CrmSyncLog[]> {
    return Array.from(this.crmSyncLogs.values())
      .filter(l => l.syncJobId === syncJobId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createCrmSyncLog(log: InsertCrmSyncLog): Promise<CrmSyncLog> {
    const id = randomUUID();
    const newLog: CrmSyncLog = {
      id,
      syncJobId: log.syncJobId,
      entityType: log.entityType,
      entityId: log.entityId ?? null,
      externalId: log.externalId ?? null,
      action: log.action,
      status: log.status,
      errorMessage: log.errorMessage ?? null,
      requestPayload: log.requestPayload ?? null,
      responsePayload: log.responsePayload ?? null,
      createdAt: new Date(),
    };
    this.crmSyncLogs.set(id, newLog);
    return newLog;
  }
}

export const storage = new MemStorage();
