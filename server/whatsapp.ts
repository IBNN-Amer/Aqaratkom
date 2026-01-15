/**
 * WhatsApp Cloud API Integration Service
 * 
 * This module provides a production-ready integration with Meta's WhatsApp Cloud API.
 * It handles sending messages, processing incoming webhooks, and managing conversations.
 * 
 * Required Environment Variables:
 * - WHATSAPP_TOKEN: Your WhatsApp Business API access token from Meta
 * - WHATSAPP_PHONE_NUMBER_ID: The Phone Number ID from your WhatsApp Business account
 * - WHATSAPP_VERIFY_TOKEN: A custom token you create for webhook verification
 * - WHATSAPP_APP_SECRET: Your Meta App Secret for webhook signature verification
 * 
 * API Version: v18.0
 * Messaging Product: whatsapp
 */

import axios, { AxiosError } from "axios";
import { createHmac } from "crypto";

const WHATSAPP_API_VERSION = "v18.0";
const WHATSAPP_API_BASE_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  verifyToken: string;
}

interface SendMessageResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

interface WhatsAppMessage {
  from: string;
  text: string;
  timestamp: string;
  messageId: string;
  type: string;
}

interface WhatsAppWebhookPayload {
  object: string;
  entry?: Array<{
    id: string;
    changes?: Array<{
      value?: {
        messaging_product?: string;
        metadata?: {
          display_phone_number?: string;
          phone_number_id?: string;
        };
        contacts?: Array<{
          profile?: { name?: string };
          wa_id?: string;
        }>;
        messages?: Array<{
          from?: string;
          id?: string;
          timestamp?: string;
          type?: string;
          text?: { body?: string };
          image?: { id?: string; caption?: string };
          document?: { id?: string; filename?: string };
          audio?: { id?: string };
          video?: { id?: string };
          location?: { latitude?: number; longitude?: number };
          button?: { text?: string; payload?: string };
          interactive?: { type?: string; button_reply?: { id?: string; title?: string } };
        }>;
        statuses?: Array<{
          id?: string;
          status?: string;
          timestamp?: string;
          recipient_id?: string;
        }>;
      };
      field?: string;
    }>;
  }>;
}

function getConfig(): WhatsAppConfig {
  const accessToken = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (!accessToken || !phoneNumberId || !verifyToken) {
    throw new Error("WhatsApp configuration is incomplete. Please set WHATSAPP_TOKEN, WHATSAPP_PHONE_NUMBER_ID, and WHATSAPP_VERIFY_TOKEN environment variables.");
  }

  return { accessToken, phoneNumberId, verifyToken };
}

function isConfigured(): boolean {
  return !!(
    process.env.WHATSAPP_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_VERIFY_TOKEN
  );
}

const processedMessageIds = new Set<string>();
const MAX_PROCESSED_IDS = 10000;

function trackProcessedMessage(messageId: string): boolean {
  if (processedMessageIds.has(messageId)) {
    return false;
  }
  
  if (processedMessageIds.size >= MAX_PROCESSED_IDS) {
    const firstId = processedMessageIds.values().next().value;
    if (firstId) processedMessageIds.delete(firstId);
  }
  
  processedMessageIds.add(messageId);
  return true;
}

/**
 * Verify webhook signature from Meta
 * Meta signs webhook payloads using your App Secret to ensure authenticity
 * 
 * @param signature - The X-Hub-Signature-256 header value
 * @param rawBody - The raw request body as a string
 * @returns True if signature is valid, false otherwise
 */
export function verifyWebhookSignature(
  signature: string | undefined,
  rawBody: string
): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET;
  
  if (!appSecret) {
    if (process.env.NODE_ENV === "production") {
      console.error("[WhatsApp] WHATSAPP_APP_SECRET is required in production for webhook security");
      return false;
    }
    console.warn("[WhatsApp] No WHATSAPP_APP_SECRET configured - skipping signature verification (dev mode only)");
    return true;
  }
  
  if (!signature || !signature.startsWith("sha256=")) {
    console.warn("[WhatsApp] Invalid or missing webhook signature");
    return false;
  }
  
  const expectedSignature = signature.slice(7);
  const hmac = createHmac("sha256", appSecret);
  hmac.update(rawBody, "utf8");
  const calculatedSignature = hmac.digest("hex");
  
  const isValid = expectedSignature === calculatedSignature;
  
  if (!isValid) {
    console.warn("[WhatsApp] Webhook signature verification failed");
  }
  
  return isValid;
}

/**
 * Check if a message has already been processed (for idempotency)
 * Returns true if this is a new message, false if it's a duplicate
 */
export function isNewMessage(messageId: string): boolean {
  return trackProcessedMessage(messageId);
}

/**
 * Send a text message via WhatsApp Cloud API
 * 
 * @param recipientPhone - The recipient's phone number in international format (e.g., "966501234567")
 * @param messageText - The text message to send
 * @returns Promise with the result including success status and message ID
 */
export async function sendWhatsAppMessage(
  recipientPhone: string,
  messageText: string
): Promise<SendMessageResult> {
  try {
    const config = getConfig();
    
    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "text",
        text: { body: messageText }
      },
      {
        headers: {
          "Authorization": `Bearer ${config.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`[WhatsApp] Message sent successfully to ${recipientPhone}`);
    
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
    console.error(`[WhatsApp] Failed to send message: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send a template message via WhatsApp Cloud API
 * Templates must be pre-approved by Meta before use.
 * 
 * @param recipientPhone - The recipient's phone number in international format
 * @param templateName - The name of the approved template
 * @param languageCode - The language code (e.g., "en", "ar")
 * @param components - Optional template components for dynamic content
 * @returns Promise with the result including success status and message ID
 */
export async function sendWhatsAppTemplate(
  recipientPhone: string,
  templateName: string,
  languageCode: string = "en",
  components?: Array<{
    type: "header" | "body" | "button";
    parameters: Array<{ type: string; text?: string; image?: { link: string } }>;
  }>
): Promise<SendMessageResult> {
  try {
    const config = getConfig();
    
    const payload: Record<string, unknown> = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: recipientPhone,
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode }
      }
    };

    if (components) {
      (payload.template as Record<string, unknown>).components = components;
    }

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/${config.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          "Authorization": `Bearer ${config.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`[WhatsApp] Template "${templateName}" sent successfully to ${recipientPhone}`);
    
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
    console.error(`[WhatsApp] Failed to send template: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Send a media message (image, document, audio, video) via WhatsApp Cloud API
 * 
 * @param recipientPhone - The recipient's phone number in international format
 * @param mediaType - Type of media: "image", "document", "audio", "video"
 * @param mediaUrl - Public URL of the media file
 * @param caption - Optional caption for images and videos
 * @param filename - Optional filename for documents
 * @returns Promise with the result including success status and message ID
 */
export async function sendWhatsAppMedia(
  recipientPhone: string,
  mediaType: "image" | "document" | "audio" | "video",
  mediaUrl: string,
  caption?: string,
  filename?: string
): Promise<SendMessageResult> {
  try {
    const config = getConfig();
    
    const mediaPayload: Record<string, string> = { link: mediaUrl };
    if (caption && (mediaType === "image" || mediaType === "video")) {
      mediaPayload.caption = caption;
    }
    if (filename && mediaType === "document") {
      mediaPayload.filename = filename;
    }

    const response = await axios.post(
      `${WHATSAPP_API_BASE_URL}/${config.phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: mediaType,
        [mediaType]: mediaPayload
      },
      {
        headers: {
          "Authorization": `Bearer ${config.accessToken}`,
          "Content-Type": "application/json"
        }
      }
    );

    console.log(`[WhatsApp] ${mediaType} sent successfully to ${recipientPhone}`);
    
    return {
      success: true,
      messageId: response.data?.messages?.[0]?.id
    };
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: { message?: string } }>;
    const errorMessage = axiosError.response?.data?.error?.message || axiosError.message;
    console.error(`[WhatsApp] Failed to send media: ${errorMessage}`);
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Verify webhook challenge from Meta
 * This is called when Meta sets up webhook verification
 * 
 * @param mode - The hub.mode parameter from the query string
 * @param token - The hub.verify_token parameter from the query string
 * @param challenge - The hub.challenge parameter from the query string
 * @returns The challenge string if verification passes, null otherwise
 */
export function verifyWebhook(
  mode: string | undefined,
  token: string | undefined,
  challenge: string | undefined
): string | null {
  if (!isConfigured()) {
    console.warn("[WhatsApp] Webhook verification attempted but WhatsApp is not configured");
    return null;
  }

  const config = getConfig();

  if (mode === "subscribe" && token === config.verifyToken) {
    console.log("[WhatsApp] Webhook verified successfully");
    return challenge || null;
  }

  console.warn("[WhatsApp] Webhook verification failed - token mismatch");
  return null;
}

/**
 * Parse incoming WhatsApp webhook payload and extract messages
 * 
 * @param payload - The raw webhook payload from Meta
 * @returns Array of parsed WhatsApp messages
 */
export function parseWebhookMessages(payload: WhatsAppWebhookPayload): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];

  if (payload.object !== "whatsapp_business_account") {
    return messages;
  }

  if (!payload.entry) {
    return messages;
  }

  for (const entry of payload.entry) {
    if (!entry.changes) continue;

    for (const change of entry.changes) {
      if (change.field !== "messages") continue;
      if (!change.value?.messages) continue;

      for (const msg of change.value.messages) {
        if (!msg.from || !msg.id) continue;

        let textContent = "";
        const msgType = msg.type || "unknown";

        switch (msgType) {
          case "text":
            textContent = msg.text?.body || "";
            break;
          case "image":
            textContent = msg.image?.caption || "[Image received]";
            break;
          case "document":
            textContent = `[Document: ${msg.document?.filename || "file"}]`;
            break;
          case "audio":
            textContent = "[Audio message received]";
            break;
          case "video":
            textContent = "[Video received]";
            break;
          case "location":
            textContent = `[Location: ${msg.location?.latitude}, ${msg.location?.longitude}]`;
            break;
          case "button":
            textContent = msg.button?.text || "[Button clicked]";
            break;
          case "interactive":
            textContent = msg.interactive?.button_reply?.title || "[Interactive response]";
            break;
          default:
            textContent = `[${msgType} message]`;
        }

        messages.push({
          from: msg.from,
          text: textContent,
          timestamp: msg.timestamp || new Date().toISOString(),
          messageId: msg.id,
          type: msgType
        });

        console.log(`[WhatsApp] Received ${msgType} from ${msg.from}: ${textContent.substring(0, 50)}...`);
      }
    }
  }

  return messages;
}

/**
 * Get contact name from webhook payload
 */
export function extractContactInfo(payload: WhatsAppWebhookPayload): { phone: string; name: string } | null {
  if (!payload.entry?.[0]?.changes?.[0]?.value?.contacts?.[0]) {
    return null;
  }

  const contact = payload.entry[0].changes[0].value.contacts[0];
  return {
    phone: contact.wa_id || "",
    name: contact.profile?.name || ""
  };
}

/**
 * Check if WhatsApp integration is properly configured
 */
export function getWhatsAppStatus(): { configured: boolean; missing: string[] } {
  const missing: string[] = [];
  
  if (!process.env.WHATSAPP_TOKEN) missing.push("WHATSAPP_TOKEN");
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) missing.push("WHATSAPP_PHONE_NUMBER_ID");
  if (!process.env.WHATSAPP_VERIFY_TOKEN) missing.push("WHATSAPP_VERIFY_TOKEN");

  return {
    configured: missing.length === 0,
    missing
  };
}

export type { WhatsAppMessage, WhatsAppWebhookPayload, SendMessageResult };
