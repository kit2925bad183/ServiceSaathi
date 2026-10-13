# ServiceSaathi (சர்வீஸ்சாதி)

> **Multi-Business Service-Management SaaS for Local Service Companies in India**

ServiceSaathi is a full-featured, multi-tenant field service management platform designed specifically for local trade contractors and service businesses in India (AC repair, home appliances, electrical, plumbing, cleaning, CCTV, vehicle care, solar maintenance, etc.).

---

## 🏗️ Architecture & Implementation State

ServiceSaathi is engineered as a **modular monolith** with clear domain separation, atomic transactions, and strict multi-tenant boundary enforcement:

```
src/
├── app/                  # Next.js 15 App Router (61 routes, 0 build errors)
│   ├── page.tsx          # Homepage with Three.js 3D miniature service neighbourhood
│   ├── features/         # Operations, mobile tech, finance, security feature breakdowns
│   ├── services/         # 10+ trade verticals with checklists & transparent pricing
│   ├── how-it-works/     # 6-stage lifecycle from booking to warranty portal
│   ├── pricing/          # Transparent Starter, Growth, Enterprise tiers
│   ├── contact/          # Lead intake form posting directly to /api/contact
│   ├── login/ & register/# Session auth, multi-business switcher & tenant setup
│   ├── forgot-password/  # Stateless cryptographic account recovery request
│   ├── reset-password/   # Token-verified password reset with bcrypt hashing
│   ├── b/[businessSlug]/ # 5-step customer booking wizard with PIN code validation
│   ├── portal/           # Customer self-service portal (history, quotes, invoices, feedback, warranty)
│   │   ├── bookings/     # Customer bookings review
│   │   ├── invoices/     # Customer invoices & payment status
│   │   ├── complaints/   # Warranty dispute registration & tracking
│   │   └── history/      # Completed service records & warranties
│   ├── technician/       # Mobile-first field technician interface:
│   │   ├── today/        # Shift schedule, navigation shortcuts, En-Route / Start Work toggles
│   │   ├── jobs/         # All assigned jobs filterable by status
│   │   ├── jobs/[id]/    # Step-by-step checklist, spare parts deduction, before/after photos
│   │   └── profile/      # Technician trade skills, assigned branch, and sign-out
│   ├── platform/         # Platform super-administrator console (protected by requirePlatformAdmin):
│   │   ├── businesses/   # Directory of registered businesses, city, and verification status
│   │   ├── subscriptions/# Tenant SaaS plans, trial expiration, billing cycles
│   │   ├── operations/   # Transactional outbox health, retry counts, queue metrics
│   │   └── audit/        # Immutable system security audit trail
│   ├── dashboard/        # Business operations workspace (aliased via /app/*):
│   │   ├── jobs/         # Dispatch calendar, timeline view, unassigned triage, conflict warnings
│   │   ├── bookings/     # Booking requests triage & confirmation
│   │   ├── catalogue/    # Service pricing models (Fixed, Inspection, Quotation)
│   │   ├── customers/    # Customer profiles, multiple addresses, appliances & private notes
│   │   ├── quotations/   # Itemized estimates, versions, & approval links
│   │   ├── invoices/     # GST tax invoices & partial payments ledger
│   │   ├── inventory/    # Parts stock ledger & auto deductions
│   │   ├── complaints/   # Operations complaints & warranty resolution tracking
│   │   ├── reports/      # Database-backed metrics & formula-safe CSV exports
│   │   └── settings/     # Onboarding checklist, operating hours, PIN codes, staff roles
│   └── api/              # RESTful JSON handlers & webhook receivers
├── components/           # Reusable UI components (Three.js Scene, ConnectivityIndicator, etc.)
├── modules/              # Core domain services (Bookings, Jobs, Quotes, Invoices, Reports)
├── lib/
│   ├── auth/             # Jose HS256 encrypted session cookies, RBAC matrix, context derivation
│   ├── db.ts             # Prisma Client singleton
│   ├── i18n/             # English and Tamil (தமிழ்) translation dictionaries
│   ├── money.ts          # Integer minor-unit (paise) math & INR formatting
│   ├── security/         # RFC 4180 CSV formula-injection protection
│   ├── queue/            # Transactional outbox event bus
│   └── adapters/         # Email (Mailpit/SMTP), WhatsApp/SMS, Razorpay sandbox
├── worker/               # Background outbox worker process
└── tests/                # Vitest unit & integration test suite (50 tests across 13 suites)
```

---

## 🎨 Interactive Three.js 3D Experience

The public homepage features a custom **interactive 3D miniature service neighbourhood** built directly with Three.js:
- **Geometry**: Stylised isometric island platform with homes, offices, workshop facilities, overhead water tanks, and road intersections.
- **Service Markers**: Color-coded beacons for AC & HVAC (Teal), Electrical & Rewiring (Amber), Plumbing (Sky Blue), and Deep Cleaning (Emerald).
- **Travelling Technician**: Animated technician field van with service ladders circulating along neighbourhood roads between service calls.
- **Interactivity**: Selecting a service category in the UI gently lifts and highlights the corresponding building and pulses its service beacon.
- **Accessibility & Fallbacks**:
  - Full accessible HTML text mirror beside the canvas for screen readers and keyboard users.
  - Automatic detection of WebGL capability with lightweight static SVG/HTML fallback.
  - Respects user's `prefers-reduced-motion` settings.
  - Rendering pauses automatically when offscreen or when tab is hidden to save laptop/phone battery.
  - Device pixel ratio capped at `1.75` for smooth framerates on high-density displays.
  - Geometries, materials, and renderer are cleanly disposed of on unmount.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20+ (tested on Node v22/v24)
- **npm**: v10+
- **Docker & Docker Compose** (for local PostgreSQL, Redis, MinIO, and Mailpit)

### 2. Install Dependencies
```powershell
npm install
```

### 3. Start Local Infrastructure Services (Docker)
```powershell
docker compose up -d
```
This boots up:
- **PostgreSQL 16**: `localhost:5432` (`servicesaathi_dev`)
- **Redis 7**: `localhost:6379`
- **MinIO S3**: `localhost:9000` (Console at `localhost:9001`)
- **Mailpit Email Inbox**: `localhost:1025` (Web UI at `localhost:8025`)

### 4. Database Setup & Seed
```powershell
# Generate Prisma Client
npm run prisma:generate

# Apply migrations
npm run prisma:migrate

# Seed demonstration businesses and staff accounts
npm run db:seed
```

### 5. Start the Web App and Background Worker
In Terminal 1 (Next.js Web App):
```powershell
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

In Terminal 2 (Background Outbox Worker):
```powershell
npm run worker
```

---

## 🧪 Automated Testing

Run the test suite:
```powershell
npm test
```

### Test Coverage (50 Tests Across 13 Test Files):
1. `tests/two-business-isolation.test.ts`: Proves cross-tenant data queries are blocked; protects last active business owner from demotion or suspension; verifies public registration cannot grant platform admin.
2. `tests/scheduling-conflict.test.ts`: Detects overlapping job assignments for the same worker; allows concurrent assignments for different technicians; permits back-to-back jobs.
3. `tests/quotations-revisions-and-cancellation.test.ts`: Verifies quotation revisions increment version numbers (v1 -> v2) and supersede previous quotes; tests customer rejections; checks token expiration; tests cancellation state transitions; enforces completed status for feedback.
4. `tests/tenant-isolation.test.ts`: Enforces RBAC permissions across Owner, Dispatcher, and Technician roles.
5. `tests/invoice-financials.test.ts`: Validates minor-unit paise calculations, GST basis points rounding, and partial payment balance deductions.
6. `tests/e2e-workflow.test.ts`: End-to-end operational lifecycle from booking to quotation, invoice, and payment.
7. `tests/formula-injection.test.ts`: Sanitizes spreadsheet formula prefixes (`=`, `+`, `-`, `@`, tab, return).
8. `tests/outbox-worker.test.ts`: Tests transactional outbox batch processing and retry increments.
9. `tests/webhooks.test.ts`: Verifies HMAC SHA-256 signature checking and idempotency against replay attacks.
10. `tests/password-reset-and-recovery.test.ts`: Cryptographic token generation, expiration, email normalization, and tamper detection.
11. `tests/platform-admin-authorization.test.ts`: Enforces `requirePlatformAdmin` to block business owners, dispatchers, and technicians from super-admin operations.
12. `tests/inventory-stock-concurrency.test.ts`: Prevents negative warehouse stock, deducts consumed parts, and triggers low-stock alerts.
13. `tests/voice-draft-ai-safety.test.ts`: Verifies provider safety fallbacks and mandatory staff review invariants.

---

## 🔑 Demonstration Accounts

| Role | Business | Email | Password | Primary Capabilities |
|---|---|---|---|---|
| **Platform Admin** | Platform Console | `rajesh@coolbreeze.in` | `Password123!` | Access `/platform/*`, tenant directory, outbox health |
| **Owner** | CoolBreeze AC (Chennai) | `rajesh@coolbreeze.in` | `Password123!` | Full business admin, staff invites, GST settings, reports |
| **Dispatcher** | CoolBreeze AC (Chennai) | `priya@coolbreeze.in` | `Password123!` | Scheduling calendar, conflict checks, job assignment |
| **Technician** | CoolBreeze AC (Chennai) | `murugan@coolbreeze.in` | `Password123!` | Touch-optimized field app `/technician`, checklists, parts deduction |
| **Owner** | Apex Care (Coimbatore) | `karthik@apexcare.in` | `Password123!` | Multi-business isolation demonstration |

---

## ⚙️ Required Environment Variables

See `.env.example` for the full reference:
- `SESSION_SECRET`: HS256 JWT cookie secret (at least 32 characters)
- `DATABASE_URL`: PostgreSQL connection string with schema parameter
- `REDIS_URL`: Redis connection URL for background queues
- `APP_URL`: Base application URL for invitation and quote links (`http://localhost:3000`)
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET`: Razorpay sandbox credentials
- `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`: S3 / MinIO storage
- `SMTP_HOST`, `SMTP_PORT`: Mailpit / SMTP server for transactional outbox
- `AI_VOICE_FEATURE_ENABLED`: Optional feature flag for audio note extraction (`false` by default)

---

## ⚠️ Controlled Pilot Limitations

For the controlled pilot with local trade businesses:
1. **Connectivity for Mutations**: Offline mutations are not queued locally in this release; active network connectivity is required for saving job updates, taking payments, or submitting checklists.
2. **Payment Gateway**: Configured in transparent Razorpay Sandbox mode. In-person UPI and cash collections are audited through manual payment recording with reference IDs.
3. **SMS / WhatsApp Gateway**: Transactional outbox processes events reliably; simulated delivery is logged when external SMS/WhatsApp credentials are not configured.
4. **Single Active Owner Rule**: Each business workspace must maintain at least one active `OWNER`. Suspending or demoting the last owner is explicitly prevented by the server.
5. **Platform Administration**: Protected by explicit `requirePlatformAdmin` checks; public business registration never grants platform super-admin privileges.
