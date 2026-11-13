# Bennett Hatchery – Intellectual Property Management System (IPMS)

[![Application Type](https://img.shields.io/badge/Application-Modular%20Monolith-blue.svg)](#)
[![Framework](https://img.shields.io/badge/Framework-Next.js%2016%20App%20Router-black.svg)](#)
[![Language](https://img.shields.io/badge/Language-TypeScript%205.x-blue.svg)](#)
[![Database](https://img.shields.io/badge/Database-Neon%20PostgreSQL-green.svg)](#)
[![ORM](https://img.shields.io/badge/ORM-Prisma-darkblue.svg)](#)
[![Styling](https://img.shields.io/badge/Styling-Tailwind%20CSS%20%2B%20shadcn%2Fui-38bdf8.svg)](#)
[![Security](https://img.shields.io/badge/Auth-Argon2id%20%2B%20DB%20Sessions-red.svg)](#)

---

## 1. Executive Overview

The **Bennett Hatchery Intellectual Property Management System (IPMS)** is a centralized institutional web platform designed and built for the **Centre for Innovation and Entrepreneurship (CIE), Bennett University**. 

The system digitizes, monitors, and evaluates the intellectual property (IP) readiness, protection progress, and legal hygiene of incubated startups across three primary categories:
1. **Trademark** (Brand, logo, Nice classes, availability searches, filings, and registrations)
2. **Patent** (Novelty, inventive step, prior-art searches, provisional/complete filings, grants)
3. **Copyright** (Source code, literature, multimedia, IP assignment agreements, registrations)

The platform provides an end-to-end operational lifecycle: from self-service startup assessments to reviewer verification, automated maturity scoring, reviewer remarks, approval scheduling, organization-wide analytics, and on-demand PDF/Excel reporting.

---

## 2. Core Modules & User Roles

The platform provides three strictly isolated, role-based modules built on a single database and application runtime:

```text
                       ┌───────────────────────────────┐
                       │     Bennett Hatchery IPMS     │
                       └───────────────┬───────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
┌──────────────────┐          ┌──────────────────┐          ┌──────────────────┐
│  Startup Portal  │          │  CIE Admin View  │          │  Reviewer View   │
│   (`/startup`)   │          │    (`/cie`)      │          │ (`/cie/reviewer`)│
├──────────────────┤          ├──────────────────┤          ├──────────────────┤
│• Profile Mgmt    │          │• Executive KPIs  │          │• Review Queue    │
│• IP Questionnaire│          │• Category Stats  │          │• Assessment Eval │
│• Draft & Submit  │          │• Maturity Distrib│          │• Applicability   │
│• Version History │          │• Startup Dossiers│          │• Remarks & Recs  │
│• Reviewer Remarks│          │• User Provision  │          │• Approve / Reject│
│• PDF Download    │          │• Portfolio Export│          │• Next Review Date│
└──────────────────┘          └──────────────────┘          └──────────────────┘
```

| Module | Target Persona | Primary Functionality |
|---|---|---|
| **Startup Portal** | Incubation Founders / Representatives | Manage startup profile, complete dynamic IP assessments, view scoring, track reviewer feedback, download official IP reports. |
| **CIE Administration** | Bennett Hatchery Leadership / Incubation Team | Monitor aggregate portfolio KPIs, review upcoming and overdue milestones, explore startup directory, manage users, generate consolidated analytics reports. |
| **Reviewer Dashboard** | Designated IP Specialist / Technical Evaluator | Inspect submissions, verify category applicability, record category remarks, approve/reject/request changes, schedule next review date. |

---

## 3. Technology Stack

Adhering strictly to a lean, self-contained, enterprise architecture:

- **Framework:** Next.js 16 (App Router, Server Actions, Route Handlers)
- **Language:** TypeScript 5.x (Strict mode)
- **Frontend & Styling:** React 19, Tailwind CSS, shadcn/ui (Radix UI primitives), Lucide React
- **Database & ORM:** Neon Serverless PostgreSQL with connection pooling; Prisma ORM
- **Authentication & Security:** Custom credentials authentication with **Argon2id** password hashing and database-backed session tokens (hashed in DB with SHA-256), delivered via HTTP-only, Secure, SameSite=Lax cookies
- **Authorization:** Strict server-side Role-Based Access Control (RBAC: `STARTUP`, `CIE_ADMIN`, `REVIEWER`)
- **Visualizations:** Recharts for responsive analytical dashboards
- **Reporting & Exports:** React PDF (`@react-pdf/renderer`) for on-demand server-side streaming PDF reports; ExcelJS for multi-sheet structured analytics exports
- **Deployment & Hosting:** Vercel (Compute & Edge Network) + Neon PostgreSQL (Database)

*Note: In Release 1.0, external document storage (S3/R2) and external email services (Resend) are omitted to minimize operational surface and cost.*

---

## 4. Assessment Lifecycle & Scoring

### Assessment State Machine
```text
[ DRAFT ] ──(Submit)──> [ SUBMITTED ] ──(Open)──> [ UNDER_REVIEW ]
                             ▲                          │
                             │                  ┌───────┴───────┐
                       (Resubmit V+1)           │               │
                             │                  ▼               ▼
                   [ CHANGES_REQUESTED ]   [ APPROVED ]    [ REJECTED ]
                                                │
                                       (Next Review Date
                                          Scheduled)
```

### Core Business Rules
1. **Assessment Immutability:** Once submitted, an assessment version is read-only. Resubmissions increment version (`V1` $\to$ `V2`) and preserve historical submissions.
2. **Scoring Engine:** Calculated strictly on the server:
   - `YES` = 100, `APPLIED` = 50, `NO` = 0
   - `NOT_APPLICABLE` = Excluded from both question and category denominators (no startup penalty)
   - `NOT_SURE` = 0 / highlighted for reviewer scrutiny
   - $\text{Category Score} = \frac{\sum \text{Applicable Question Scores}}{\text{Count of Applicable Questions}}$
   - $\text{Overall IP Maturity} = \frac{\sum \text{Applicable Category Scores}}{\text{Count of Applicable Categories}}$
3. **Official Analytics Rule:** Official incubator-wide metrics are calculated strictly from the **latest approved assessment** per startup.

---

## 5. Project Directory Structure

```text
C:\Projects\BHF-IP-Tool\
├── docs/                      # Architectural & Requirements Specifications
│   ├── PRD.md                 # Product Requirements Document
│   ├── TRD.md                 # Technical Requirements Document & Schema
│   ├── architecture.md        # Comprehensive System Architecture Guide
│   ├── decisions.md           # Architectural Decision Records (ADRs)
│   └── open-questions.md      # Unresolved Ambiguities & Clarifications
├── prisma/                    # Database ORM Configuration
│   ├── schema.prisma          # PostgreSQL Schema Models
│   ├── migrations/            # Schema Migrations
│   └── seed.ts                # Reference Data & User Seed Script
├── public/                    # Static Assets & Institutional Logos
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/            # Authentication Layout & Login
│   │   ├── (startup)/         # Startup Portal
│   │   ├── (cie)/             # CIE Administration Portal
│   │   ├── (reviewer)/        # Reviewer Portal
│   │   └── api/v1/            # Modular RESTful Route Handlers
│   ├── components/            # Reusable UI & Domain Components
│   │   ├── ui/                # shadcn/ui Primitive Elements
│   │   ├── shared/            # Common Layout, Nav, Guards
│   │   ├── startup/           # Startup-specific Views & Forms
│   │   ├── cie/               # CIE Dashboard & Filter Widgets
│   │   ├── reviewer/          # Review Queue & Remark Forms
│   │   └── charts/            # Recharts Visualizations
│   ├── lib/                   # Core Infrastructure & Utilities
│   │   ├── prisma.ts          # Cached Prisma Client
│   │   ├── auth.ts            # Argon2id Password Utilities
│   │   ├── session.ts         # Session Lifecycle & Crypto
│   │   ├── permissions.ts     # RBAC Evaluation
│   │   └── reports/           # PDF & Excel Generation Engines
│   ├── services/              # Pure Business Logic Services
│   └── types/                 # Shared TypeScript Type Definitions
├── memory.md                  # Persistent Project Context & Memory
├── task.md                    # Detailed Phased Task Tracker (Phases 0–10)
├── package.json               # Application Dependencies & Scripts
├── tsconfig.json              # Strict TypeScript Configuration
└── README.md                  # System Documentation
```

---

## 6. Project Control Documents

- **[memory.md](file:///c:/Projects/BHF-IP-Tool/memory.md):** Mandatory persistent memory recording project identity, tech stack, business rules, architecture decisions, and conventions.
- **[task.md](file:///c:/Projects/BHF-IP-Tool/task.md):** Single source of truth for implementation progress, spanning Phase 0 through Phase 10 with detailed DoD and acceptance criteria.
- **[docs/architecture.md](file:///c:/Projects/BHF-IP-Tool/docs/architecture.md):** In-depth technical architecture blueprint.
- **[docs/decisions.md](file:///c:/Projects/BHF-IP-Tool/docs/decisions.md):** Architectural Decision Records (ADR 001–008).
- **[docs/open-questions.md](file:///c:/Projects/BHF-IP-Tool/docs/open-questions.md):** Institutional questions, ambiguities, and policy decisions.

---

## 7. Development & Deployment Workflow

### Prerequisites
- Node.js 20.x or 22.x LTS
- Neon PostgreSQL Account and Database Connection Strings

### Local Setup (Once Phase 1 Commences)
```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env.local

# 3. Apply database migrations
npx prisma migrate dev --name init_ipms_schema

# 4. Seed reference data and default accounts
npx prisma db seed

# 5. Start development server
npm run dev
```

---

## 8. Development Phases Summary

- **Phase 0:** Documentation Analysis & Project Initialization *(In Progress)*
- **Phase 1:** Project Foundation and Infrastructure
- **Phase 2:** Authentication and Authorization
- **Phase 3:** Startup Management
- **Phase 4:** Questionnaire and Assessment Engine
- **Phase 5:** IP Scoring Engine
- **Phase 6:** Reviewer Dashboard and Approval Workflow
- **Phase 7:** CIE Administration Dashboard and Analytics
- **Phase 8:** Reporting and Exports (PDF & Excel)
- **Phase 9:** Testing, Security and Optimization
- **Phase 10:** Production Deployment and Handover

---

**Bennett Hatchery – Centre for Innovation and Entrepreneurship**  
Bennett University, Greater Noida, UP, India

