import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  role: text("role").notNull().default("agent"),
  avatar: text("avatar"),
});

export const leads = pgTable("leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  source: text("source").notNull(),
  status: text("status").notNull().default("new"),
  score: integer("score").default(0),
  assignedTo: varchar("assigned_to"),
  notes: text("notes"),
  tags: text("tags").array(),
  propertyInterest: text("property_interest"),
  budget: text("budget"),
  createdAt: timestamp("created_at").defaultNow(),
  lastContactAt: timestamp("last_contact_at"),
});

export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  officeId: varchar("office_id"),
  agentId: varchar("agent_id"),
  title: text("title").notNull(),
  titleAr: text("title_ar"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  type: text("type").notNull(),
  status: text("status").notNull().default("available"),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  area: integer("area"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  location: text("location").notNull(),
  locationAr: text("location_ar"),
  images: text("images").array(),
  primaryImageIndex: integer("primary_image_index").default(0),
  features: text("features").array(),
  propertySource: text("property_source"),
  sourceDetails: text("source_details"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const deals = pgTable("deals", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  propertyId: varchar("property_id"),
  stage: text("stage").notNull().default("qualified"),
  value: decimal("value", { precision: 12, scale: 2 }),
  probability: integer("probability").default(20),
  expectedCloseDate: timestamp("expected_close_date"),
  assignedTo: varchar("assigned_to"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  assignedTo: varchar("assigned_to"),
  status: text("status").notNull().default("open"),
  unreadCount: integer("unread_count").default(0),
  lastMessageAt: timestamp("last_message_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  direction: text("direction").notNull(),
  content: text("content").notNull(),
  messageType: text("message_type").default("text"),
  templateId: varchar("template_id"),
  status: text("status").default("sent"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const messageTemplates = pgTable("message_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  category: text("category").notNull(),
  content: text("content").notNull(),
  contentAr: text("content_ar"),
  variables: text("variables").array(),
  approvalStatus: text("approval_status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  type: text("type").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  userId: varchar("user_id"),
  description: text("description").notNull(),
  descriptionAr: text("description_ar"),
  metadata: text("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const realEstateOffices = pgTable("real_estate_offices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  logo: text("logo"),
  phone: text("phone").notNull(),
  email: text("email"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  addressAr: text("address_ar"),
  city: text("city"),
  licenseNumber: text("license_number"),
  description: text("description"),
  descriptionAr: text("description_ar"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const salesAgents = pgTable("sales_agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  officeId: varchar("office_id").notNull(),
  name: text("name").notNull(),
  nameAr: text("name_ar"),
  phone: text("phone").notNull(),
  email: text("email"),
  role: text("role").notNull().default("sales"),
  avatar: text("avatar"),
  isActive: boolean("is_active").default(true),
  propertiesCount: integer("properties_count").default(0),
  dealsCount: integer("deals_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyOffers = pgTable("property_offers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  city: text("city").notNull(),
  cityAr: text("city_ar"),
  district: text("district").notNull(),
  districtAr: text("district_ar"),
  propertyType: text("property_type").notNull(),
  listingType: text("listing_type").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull(),
  area: integer("area").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  falLicenseNumber: text("fal_license_number"),
  brokerName: text("broker_name").notNull(),
  brokerPhone: text("broker_phone").notNull(),
  brokerEmail: text("broker_email"),
  developerName: text("developer_name"),
  propertyCondition: text("property_condition").notNull(),
  description: text("description"),
  descriptionAr: text("description_ar"),
  images: text("images").array(),
  primaryImageIndex: integer("primary_image_index").default(0),
  reviewStatus: text("review_status").notNull().default("pending"),
  reviewNotes: text("review_notes"),
  reviewedBy: varchar("reviewed_by"),
  reviewedAt: timestamp("reviewed_at"),
  submittedBy: varchar("submitted_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyRequests = pgTable("property_requests", {
  id: varchar("id").primaryKey(),
  requesterId: varchar("requester_id"),
  requesterAgentId: varchar("requester_agent_id"),
  requesterOfficeId: varchar("requester_office_id"),
  propertyType: text("property_type").notNull(),
  listingType: text("listing_type").notNull(),
  city: text("city").notNull(),
  cityAr: text("city_ar"),
  district: text("district"),
  districtAr: text("district_ar"),
  minPrice: text("min_price"),
  maxPrice: text("max_price").notNull(),
  minArea: integer("min_area"),
  maxArea: integer("max_area"),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  propertyCondition: text("property_condition"),
  clientName: text("client_name"),
  clientPhone: text("client_phone"),
  notes: text("notes"),
  notesAr: text("notes_ar"),
  status: text("status").notNull().default("active"),
  matchCount: integer("match_count").default(0),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const propertyMatches = pgTable("property_matches", {
  id: varchar("id").primaryKey(),
  requestId: varchar("request_id").notNull(),
  propertyOfferId: varchar("property_offer_id").notNull(),
  matchScore: integer("match_score").notNull(),
  matchDetails: text("match_details"),
  status: text("status").notNull().default("new"),
  viewedAt: timestamp("viewed_at"),
  contactedAt: timestamp("contacted_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertPropertySchema = createInsertSchema(properties).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDealSchema = createInsertSchema(deals).omit({ id: true, createdAt: true, updatedAt: true });
export const insertConversationSchema = createInsertSchema(conversations).omit({ id: true, createdAt: true });
export const insertMessageSchema = createInsertSchema(messages).omit({ id: true, createdAt: true });
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertPropertyOfferSchema = createInsertSchema(propertyOffers).omit({ id: true, createdAt: true, updatedAt: true, reviewedAt: true });
export const insertRealEstateOfficeSchema = createInsertSchema(realEstateOffices).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSalesAgentSchema = createInsertSchema(salesAgents).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPropertyRequestSchema = createInsertSchema(propertyRequests).omit({ id: true, createdAt: true, updatedAt: true });
export const insertPropertyMatchSchema = createInsertSchema(propertyMatches).omit({ id: true, createdAt: true });

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;
export type InsertDeal = z.infer<typeof insertDealSchema>;
export type Deal = typeof deals.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertPropertyOffer = z.infer<typeof insertPropertyOfferSchema>;
export type PropertyOffer = typeof propertyOffers.$inferSelect;
export type InsertRealEstateOffice = z.infer<typeof insertRealEstateOfficeSchema>;
export type RealEstateOffice = typeof realEstateOffices.$inferSelect;
export type InsertSalesAgent = z.infer<typeof insertSalesAgentSchema>;
export type SalesAgent = typeof salesAgents.$inferSelect;
export type InsertPropertyRequest = z.infer<typeof insertPropertyRequestSchema>;
export type PropertyRequest = typeof propertyRequests.$inferSelect;
export type InsertPropertyMatch = z.infer<typeof insertPropertyMatchSchema>;
export type PropertyMatch = typeof propertyMatches.$inferSelect;

export const LeadSources = ["facebook", "instagram", "website", "whatsapp", "referral", "phone", "walk_in"] as const;
export const LeadStatuses = ["new", "contacted", "qualified", "negotiating", "won", "lost"] as const;
export const PropertyTypes = ["apartment", "villa", "townhouse", "penthouse", "office", "retail", "land"] as const;
export const PropertyStatuses = ["available", "reserved", "sold", "rented"] as const;
export const DealStages = ["qualified", "proposal", "negotiation", "contract", "closed_won", "closed_lost"] as const;

export const SaudiCities = ["riyadh", "jeddah", "makkah", "madinah", "dammam", "khobar", "dhahran", "tabuk", "abha", "taif", "jubail", "yanbu"] as const;
export const OfferPropertyTypes = ["residential", "commercial", "investment"] as const;
export const ListingTypes = ["sale", "rent"] as const;
export const PropertyConditions = ["ready", "under_construction", "off_plan"] as const;
export const OfferReviewStatuses = ["pending", "approved", "rejected", "needs_revision"] as const;

export type LeadSource = typeof LeadSources[number];
export type LeadStatus = typeof LeadStatuses[number];
export type PropertyType = typeof PropertyTypes[number];
export type PropertyStatus = typeof PropertyStatuses[number];
export type DealStage = typeof DealStages[number];
export type SaudiCity = typeof SaudiCities[number];
export type OfferPropertyType = typeof OfferPropertyTypes[number];
export type ListingType = typeof ListingTypes[number];
export type PropertyCondition = typeof PropertyConditions[number];
export type OfferReviewStatus = typeof OfferReviewStatuses[number];

export const PropertySources = ["developer", "broker", "direct_owner", "marketing_campaign", "custom"] as const;
export const SalesAgentRoles = ["sales", "supervisor", "manager"] as const;
export const RequestStatuses = ["active", "matched", "fulfilled", "expired", "cancelled"] as const;
export const MatchStatuses = ["new", "viewed", "contacted", "successful", "unsuccessful"] as const;

export type PropertySourceType = typeof PropertySources[number];
export type SalesAgentRole = typeof SalesAgentRoles[number];
export type RequestStatus = typeof RequestStatuses[number];
export type MatchStatus = typeof MatchStatuses[number];
