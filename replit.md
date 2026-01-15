# عقارك 1 - Real Estate Marketing Platform

## Overview

عقارك 1 (Aqarak 1) is a real estate marketing and customer relationship management platform with integrated WhatsApp messaging capabilities. The application is designed for real estate companies in the Middle East, supporting both English and Arabic languages with RTL layout support. It provides lead management, property listings, deal pipeline tracking, WhatsApp conversation management, and analytics dashboards.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack React Query for server state and data fetching
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming (light/dark mode support)
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualizations

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **API Style**: RESTful JSON API endpoints under `/api/*`
- **Development Server**: Vite dev server with HMR proxied through Express

### Data Layer
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema Location**: `shared/schema.ts` contains all table definitions
- **Validation**: Drizzle-Zod for generating Zod schemas from database tables
- **Migrations**: Drizzle Kit for schema migrations (`db:push` command)

### Core Entities
- **Users**: Authentication and role-based access (agent, admin roles)
- **Leads**: Contact management with source tracking, scoring, and status pipeline
- **Properties**: Real estate listings with bilingual support (English/Arabic)
- **Deals**: Sales pipeline with stages from qualified through closed
- **Conversations**: WhatsApp conversation threads linked to leads
- **Messages**: Individual messages within conversations
- **Message Templates**: Pre-approved WhatsApp message templates
- **Activities**: Audit trail of all CRM actions

### Design Patterns
- **Shared Types**: Schema definitions in `/shared` are imported by both client and server
- **Path Aliases**: `@/` maps to client source, `@shared/` maps to shared code
- **In-Memory Storage**: Development uses `MemStorage` class with fallback to PostgreSQL via `DatabaseStorage`
- **Component Architecture**: Reusable card components for leads, properties, deals, and conversations

### Internationalization
- Custom i18n provider supporting English and Arabic
- RTL layout support via document direction attribute on both html and body elements
- Automatic direction sync when language changes
- Font families: Inter for UI text, Poppins for headings, Noto Sans Arabic for Arabic text
- All components use ltr:/rtl: Tailwind variants for directional spacing

### Theme System
- Light and dark mode with CSS custom properties
- Theme class applied to both document.documentElement and document.body
- Theme persisted to localStorage
- System preference detection as fallback

### API Routes (All with Zod Validation)
- `GET/POST /api/leads` - Lead management
- `GET/POST /api/properties` - Property listings
- `GET/POST /api/deals` - Deal pipeline
- `GET/POST /api/conversations` - WhatsApp conversations
- `POST /api/conversations/:id/messages` - Send messages
- `GET/POST /api/templates` - Message templates
- `GET /api/activities` - Activity timeline
- `GET /api/dashboard/stats` - Dashboard KPIs
- `GET /api/analytics/*` - Analytics data

### WhatsApp Cloud API Integration
- `GET /webhook` - Meta webhook verification endpoint
- `POST /webhook` - Receive incoming WhatsApp messages (with signature verification and idempotency)
- `POST /api/whatsapp/send` - Send WhatsApp messages (with Zod validation)
- `GET /api/whatsapp/status` - Check WhatsApp integration status
- **API Version**: v18.0
- **Required Secrets**: 
  - `WHATSAPP_TOKEN` - WhatsApp Business API access token from Meta
  - `WHATSAPP_PHONE_NUMBER_ID` - Phone Number ID from WhatsApp Business account
  - `WHATSAPP_VERIFY_TOKEN` - Custom token for webhook verification
  - `WHATSAPP_APP_SECRET` - Meta App Secret for webhook signature verification (optional but recommended)
- **Service Module**: `server/whatsapp.ts` - Contains all WhatsApp API functions
- **Security Features**: Webhook signature verification (X-Hub-Signature-256), message deduplication

### WhatsApp Chatbot (Auto-Reply)
- **Bot Module**: `server/whatsapp-bot.ts` - Conversational flow handler
- **Features**:
  - Automatic greeting and menu presentation
  - Property request flow (buy/rent): collects unit type, budget, area, and details
  - Property offer flow (sell/rent out): collects property information
  - Step-by-step data collection with Arabic responses
  - Cancel command support (send "0" or "إلغاء")
- **Menu Options**:
  1. طلب شراء (Purchase Request)
  2. طلب إيجار (Rental Request)
  3. عرض عقار للبيع (Property for Sale)
  4. عرض عقار للإيجار (Property for Rent)

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage in PostgreSQL

### UI Libraries
- **Radix UI**: Full suite of accessible primitives (dialog, dropdown, tabs, etc.)
- **Embla Carousel**: Image carousels for property galleries
- **Recharts**: Data visualization charts
- **Vaul**: Drawer component for mobile interfaces

### Build Tools
- **Vite**: Frontend build and development server
- **esbuild**: Server-side bundling for production
- **tsx**: TypeScript execution for development

### Replit-Specific
- **@replit/vite-plugin-runtime-error-modal**: Error overlay in development
- **@replit/vite-plugin-cartographer**: Source mapping for Replit
- **@replit/vite-plugin-dev-banner**: Development environment indicator