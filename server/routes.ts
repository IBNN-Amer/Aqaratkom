import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLeadSchema, insertPropertySchema, insertDealSchema, insertMessageTemplateSchema, insertMessageSchema, insertPropertyOfferSchema, insertRealEstateOfficeSchema, insertSalesAgentSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";

function validateBody<T extends z.ZodSchema>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new Error(fromZodError(result.error).message);
  }
  return result.data;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/leads-by-source", async (req, res) => {
    try {
      const data = await storage.getLeadsBySource();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads by source" });
    }
  });

  app.get("/api/dashboard/deals-by-stage", async (req, res) => {
    try {
      const data = await storage.getDealsByStage();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals by stage" });
    }
  });

  app.get("/api/leads", async (req, res) => {
    try {
      const leads = await storage.getLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leads" });
    }
  });

  app.get("/api/leads/:id", async (req, res) => {
    try {
      const lead = await storage.getLead(req.params.id);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead" });
    }
  });

  app.post("/api/leads", async (req, res) => {
    try {
      const validated = validateBody(insertLeadSchema, req.body);
      const lead = await storage.createLead(validated);
      res.status(201).json(lead);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create lead";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/leads/:id", async (req, res) => {
    try {
      const partialSchema = insertLeadSchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const lead = await storage.updateLead(req.params.id, validated);
      if (!lead) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update lead";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/leads/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteLead(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Lead not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete lead" });
    }
  });

  app.get("/api/properties", async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch properties" });
    }
  });

  app.get("/api/properties/:id", async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property" });
    }
  });

  app.post("/api/properties", async (req, res) => {
    try {
      const validated = validateBody(insertPropertySchema, req.body);
      const property = await storage.createProperty(validated);
      res.status(201).json(property);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create property";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/properties/:id", async (req, res) => {
    try {
      const partialSchema = insertPropertySchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const property = await storage.updateProperty(req.params.id, validated);
      if (!property) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update property";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/properties/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete property" });
    }
  });

  app.get("/api/deals", async (req, res) => {
    try {
      const deals = await storage.getDeals();
      res.json(deals);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deals" });
    }
  });

  app.get("/api/deals/:id", async (req, res) => {
    try {
      const deal = await storage.getDeal(req.params.id);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch deal" });
    }
  });

  app.post("/api/deals", async (req, res) => {
    try {
      const validated = validateBody(insertDealSchema, req.body);
      const deal = await storage.createDeal(validated);
      res.status(201).json(deal);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create deal";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/deals/:id", async (req, res) => {
    try {
      const partialSchema = insertDealSchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const deal = await storage.updateDeal(req.params.id, validated);
      if (!deal) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.json(deal);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update deal";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/deals/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDeal(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Deal not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete deal" });
    }
  });

  app.get("/api/conversations", async (req, res) => {
    try {
      const conversations = await storage.getConversations();
      res.json(conversations);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    try {
      const schema = z.object({ leadId: z.string().min(1) });
      const validated = validateBody(schema, req.body);
      const conversation = await storage.createConversation({
        leadId: validated.leadId,
        status: "open",
      });
      res.status(201).json(conversation);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create conversation";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req, res) => {
    try {
      const validated = validateBody(insertMessageSchema.pick({ content: true, direction: true }), req.body);
      const message = await storage.createMessage({
        conversationId: req.params.id,
        content: validated.content,
        direction: validated.direction || "outgoing",
      });
      res.status(201).json(message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send message";
      res.status(400).json({ error: message });
    }
  });

  app.get("/api/templates", async (req, res) => {
    try {
      const templates = await storage.getTemplates();
      res.json(templates);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch templates" });
    }
  });

  app.post("/api/templates", async (req, res) => {
    try {
      const validated = validateBody(insertMessageTemplateSchema, req.body);
      const template = await storage.createTemplate(validated);
      res.status(201).json(template);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create template";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/templates/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteTemplate(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Template not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete template" });
    }
  });

  app.get("/api/activities", async (req, res) => {
    try {
      const activities = await storage.getActivities();
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.get("/api/analytics/lead-trends", async (req, res) => {
    try {
      const trends = await storage.getLeadTrends();
      res.json(trends);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch lead trends" });
    }
  });

  app.get("/api/analytics/agent-performance", async (req, res) => {
    try {
      const performance = await storage.getAgentPerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch agent performance" });
    }
  });

  app.get("/api/analytics/source-performance", async (req, res) => {
    try {
      const performance = await storage.getSourcePerformance();
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch source performance" });
    }
  });

  app.get("/api/property-offers", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const offers = status 
        ? await storage.getPropertyOffersByStatus(status)
        : await storage.getPropertyOffers();
      res.json(offers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property offers" });
    }
  });

  app.get("/api/property-offers/:id", async (req, res) => {
    try {
      const offer = await storage.getPropertyOffer(req.params.id);
      if (!offer) {
        return res.status(404).json({ error: "Property offer not found" });
      }
      res.json(offer);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch property offer" });
    }
  });

  app.post("/api/property-offers", async (req, res) => {
    try {
      const validated = validateBody(insertPropertyOfferSchema, req.body);
      const offer = await storage.createPropertyOffer(validated);
      res.status(201).json(offer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create property offer";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/property-offers/:id", async (req, res) => {
    try {
      const partialSchema = insertPropertyOfferSchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const offer = await storage.updatePropertyOffer(req.params.id, validated);
      if (!offer) {
        return res.status(404).json({ error: "Property offer not found" });
      }
      res.json(offer);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update property offer";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/property-offers/:id", async (req, res) => {
    try {
      const deleted = await storage.deletePropertyOffer(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Property offer not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete property offer" });
    }
  });

  app.get("/api/offices", async (req, res) => {
    try {
      const offices = await storage.getOffices();
      res.json(offices);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch offices" });
    }
  });

  app.get("/api/offices/:id", async (req, res) => {
    try {
      const office = await storage.getOffice(req.params.id);
      if (!office) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(office);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch office" });
    }
  });

  app.post("/api/offices", async (req, res) => {
    try {
      const validated = validateBody(insertRealEstateOfficeSchema, req.body);
      const office = await storage.createOffice(validated);
      res.status(201).json(office);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create office";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/offices/:id", async (req, res) => {
    try {
      const partialSchema = insertRealEstateOfficeSchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const office = await storage.updateOffice(req.params.id, validated);
      if (!office) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.json(office);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update office";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/offices/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteOffice(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Office not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete office" });
    }
  });

  app.get("/api/sales-agents", async (req, res) => {
    try {
      const officeId = req.query.officeId as string | undefined;
      const agents = officeId
        ? await storage.getSalesAgentsByOffice(officeId)
        : await storage.getSalesAgents();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales agents" });
    }
  });

  app.get("/api/sales-agents/:id", async (req, res) => {
    try {
      const agent = await storage.getSalesAgent(req.params.id);
      if (!agent) {
        return res.status(404).json({ error: "Sales agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch sales agent" });
    }
  });

  app.post("/api/sales-agents", async (req, res) => {
    try {
      const validated = validateBody(insertSalesAgentSchema, req.body);
      const agent = await storage.createSalesAgent(validated);
      res.status(201).json(agent);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create sales agent";
      res.status(400).json({ error: message });
    }
  });

  app.patch("/api/sales-agents/:id", async (req, res) => {
    try {
      const partialSchema = insertSalesAgentSchema.partial();
      const validated = validateBody(partialSchema, req.body);
      const agent = await storage.updateSalesAgent(req.params.id, validated);
      if (!agent) {
        return res.status(404).json({ error: "Sales agent not found" });
      }
      res.json(agent);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to update sales agent";
      res.status(400).json({ error: message });
    }
  });

  app.delete("/api/sales-agents/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteSalesAgent(req.params.id);
      if (!deleted) {
        return res.status(404).json({ error: "Sales agent not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete sales agent" });
    }
  });

  return httpServer;
}
