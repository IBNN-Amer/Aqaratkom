# Design Guidelines: Real Estate CRM + WhatsApp Marketing Platform

## Design Approach: Design System Foundation

**Selected System**: Material Design with Carbon Design influences
**Rationale**: This is a data-intensive, productivity-focused enterprise application requiring clear information hierarchy, robust data displays, and efficient workflows. The system prioritizes usability and consistency over visual experimentation.

**Key Principles**:
- Information density with breathing room
- Clear task-oriented workflows
- Responsive layouts for desktop-first usage (with mobile support for field agents)
- RTL support for Arabic-first experience

---

## Typography System

**Font Families**: 
- Primary: Inter (via Google Fonts) - UI text, labels, data
- Secondary: Poppins (via Google Fonts) - Headings, emphasis

**Hierarchy**:
- Page Headers: text-3xl font-bold (Poppins)
- Section Headers: text-xl font-semibold (Poppins)
- Card Titles: text-lg font-medium (Inter)
- Body Text: text-base font-normal (Inter)
- Labels/Meta: text-sm font-medium (Inter)
- Helper Text: text-xs font-normal (Inter)

---

## Layout & Spacing System

**Tailwind Spacing Units**: Use 2, 4, 6, 8, 12, 16, 20 consistently
- Component padding: p-4, p-6, p-8
- Section margins: mb-6, mb-8, mb-12
- Grid gaps: gap-4, gap-6

**Layout Structure**:
- Sidebar navigation: Fixed 16rem width (w-64) on desktop, collapsible on mobile
- Main content area: max-w-7xl with px-6 py-8 padding
- Dashboard cards: Grid layouts (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- Data tables: Full-width with horizontal scroll on mobile

---

## Core Components Library

### Navigation & Structure
- **Top Navigation Bar**: Fixed height (h-16), contains search, notifications, user profile, language toggle
- **Sidebar**: Hierarchical navigation with icons (Heroicons), expandable sections, active state indicators
- **Breadcrumbs**: For deep navigation paths

### Data Display
- **Dashboard Cards**: Elevated surfaces with icon, metric, trend indicator, sparkline chart
- **Data Tables**: Sticky headers, row actions (kebab menu), sorting, filtering, pagination
- **Property Cards**: Image thumbnail, title, price, location, key specs, action buttons
- **Lead Cards**: Contact info, source badge, status tag, last interaction timestamp, quick actions
- **Timeline**: Vertical activity feed for lead/deal history

### Forms & Input
- **Text Inputs**: Floating labels, validation states, helper text
- **Select Dropdowns**: Searchable with typeahead for large lists
- **Date/Time Pickers**: Calendar overlays with timezone support
- **Tag Input**: Multi-select chips for properties, statuses, categories
- **Rich Text Editor**: For WhatsApp message templates and notes

### Communication Components
- **WhatsApp Chat Interface**: Message bubbles (sent/received), typing indicators, attachment previews, template selector
- **Conversation List**: Contact avatar, name, last message preview, unread badge, timestamp
- **Message Templates**: Preview cards with variable placeholders, approval status badges

### Analytics & Reporting
- **KPI Widgets**: Large metric display with comparison indicators (↑ 12% vs last month)
- **Charts**: Line charts (trends), bar charts (comparisons), donut charts (distribution), funnel charts (pipeline)
- **Report Builder**: Drag-and-drop filters, date range picker, export options

### Actions & Feedback
- **Primary Buttons**: Prominent CTAs (text-base, px-6, py-3, rounded-lg)
- **Secondary Buttons**: Outlined variant for less critical actions
- **Icon Buttons**: For table row actions, toolbar items (h-10 w-10)
- **Toast Notifications**: Top-right position for success/error/info messages
- **Modals**: Centered overlays for forms, confirmations (max-w-2xl)
- **Loading States**: Skeleton screens for data tables, spinner for actions

---

## Page Templates

### Dashboard Home
- Grid of KPI cards (4 columns on desktop)
- Lead activity timeline (center column)
- Quick stats sidebar (deals in pipeline, response time, conversion rate)
- Recent conversations widget
- Top-performing properties carousel

### Leads Management
- Filter sidebar (source, status, assigned agent, date range)
- Lead cards in masonry grid or table view toggle
- Bulk action toolbar
- Export/import controls

### Property Listings
- Visual grid with large property images
- Quick view modal on click
- Add/edit property drawer (slide-in from right)

### WhatsApp Workspace
- Three-column layout: conversation list (25%), active chat (50%), lead/contact details sidebar (25%)
- Template quick-access toolbar
- Automated message history indicator

### Pipeline/Deal Management
- Kanban board view (cards draggable between stages)
- Compact list view alternative
- Deal value aggregates per stage

---

## Responsive Behavior

- **Desktop (lg+)**: Multi-column layouts, expanded sidebar, full data tables
- **Tablet (md)**: Collapsed sidebar to icon-only, 2-column grids, horizontal scroll tables
- **Mobile**: Single column, hamburger menu, card-based layouts, swipe gestures

---

## Accessibility & Localization

- RTL layout support for Arabic (use Tailwind RTL directives)
- High contrast ratios for text (WCAG AA minimum)
- Keyboard navigation for all interactive elements
- Screen reader labels for icons and actions
- Language toggle persists user preference

---

## Icons

**Library**: Heroicons (via CDN)
**Usage**: 
- Navigation items (outline variant, h-5 w-5)
- Card headers (solid variant, h-6 w-6)
- Action buttons (outline, h-5 w-5)
- Status indicators (solid, h-4 w-4)

---

## Images

**Property Images**: Use high-quality property photos as primary visual elements
- **Placement**: Property cards (16:9 ratio), property detail headers (full-width hero), gallery carousels
- **Hero Section** (Optional Marketing Pages): Include aspirational property imagery with blurred-background CTAs if creating public-facing landing pages