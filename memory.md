# PROJECT MEMORY — BENNETT HATCHERY IPMS

**Project Name:** Bennett Hatchery Intellectual Property Management System (IPMS)  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University  
**Document Classification:** Primary Project Memory & Context Anchor  
**Last Updated:** November 13, 2026  
**Status:** Phase 0 Active (Initialization & Architectural Baseline)

---

## A. Project Identity

- **Project Name:** Bennett Hatchery Intellectual Property Management System (IPMS)
- **Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University, Greater Noida, India
- **Document Version:** 1.0.0
- **Project Purpose:** Centralize, digitize, evaluate, monitor, and report the intellectual property (Trademark, Patent, Copyright) portfolio and readiness of startups incubated under Bennett Hatchery.
- **Product Vision:** Establish an institutional-grade, continuous intellectual property monitoring ecosystem that enables Bennett Hatchery to systematically evaluate, track, and improve the IP readiness, protection status, and legal hygiene of its incubated startups without manual spreadsheets or fragmented paperwork.
- **Current Development Status:** Phase 2 Next (Authentication and Authorization) — Phases 0 & 1 Completed.

---

## B. Core Product Understanding

The Bennett Hatchery IPMS is a specialized enterprise web application structured around three distinct role-based modules operating over a single database and backend runtime:

### 1. Three User-Facing Modules
1. **Startup Portal (`/startup`):**
   - Self-service profile management for founders and startup representatives.
   - Multi-step, dynamic IP assessment questionnaire covering General IP, Trademark, Patent, and Copyright.
   - Draft persistence with auto-save and preview before submission.
   - Real-time status tracking (Draft, Submitted, Under Review, Changes Requested, Resubmitted, Approved, Rejected).
   - View reviewer remarks, requested modifications, category maturity scores, next review date, and historical assessment records.
   - On-demand streaming download of official approved individual IP reports in PDF format.
2. **CIE Administration Dashboard (`/cie`):**
   - Executive portfolio overview displaying aggregate metrics across all incubated startups.
   - KPI metrics: Total Registered Startups, Total Assessments, Total Approved, Pending Reviews, Average IP Maturity Score, Upcoming/Overdue Reviews.
   - Deep-dive analytics: IP Category Distribution (Trademarks filed/registered, Patents filed/granted, Copyrights documented/registered), Startup-Wise Score Comparisons, Maturity Distribution (Initial, Developing, Intermediate, Advanced, Strong IP Readiness), and Historical Trends.
   - Comprehensive searchable and filterable Startup Directory with drill-down into complete startup IP dossiers.
   - System user provisioning and management (CIE Admins, Reviewers, Startup Founders).
   - Consolidated executive report generation (PDF and Excel `.xlsx`).
3. **CIE Reviewer Dashboard (`/cie/reviewer`):**
   - Review queue for incoming and resubmitted assessments with priority and submission timestamps.
   - Side-by-side assessment evaluation interface displaying startup responses, declared applicability, and calculated provisional scores.
   - Verification of IP applicability per category with reviewer remarks and override capability.
   - Rich remark system: General remarks, category-specific remarks (Trademark, Patent, Copyright), and recommended action items.
   - Decision gateway: **Approve** (with mandatory Next Review Date selection), **Request Changes** (with itemized modification requirements), or **Reject** (with mandatory formal justification).
   - Immutable audit logging of all reviewer actions.

### 2. IP Categories Evaluated
1. **Trademark:** Brand name registration, logo protection, availability searches, Nice classification, filing status, registration certificates.
2. **Patent:** Novelty evaluation, technical innovation, prior art searches, inventive step, industrial applicability, provisional/complete filing status, patent grant status.
3. **Copyright:** Original source code/software documentation, creative content, UI designs, founder/employee IP assignment agreements, registration status.

### 3. Complete Assessment Lifecycle
```text
[ DRAFT ] ──────── (Startup submits) ────────> [ SUBMITTED ]
                                                     │
                                             (Reviewer opens)
                                                     │
                                                     ▼
                                            [ UNDER_REVIEW ]
                                             │            │
                         (Changes Requested) │            │ (Approved)
                                             ▼            ▼
                                   [ CHANGES_REQUESTED ] [ APPROVED ]
                                             │                  │
                                     (Startup edits &     (Next Review
                                      creates V+1 Draft)   Scheduled)
                                             │
                                             ▼
                                       [ RESUBMITTED ]
                                             │
                                             ▼
                                      [ UNDER_REVIEW ]
                                             │
                                             ▼
                                   [ APPROVED ] or [ REJECTED ]
```

### 4. Analytics and Reporting Rules
- **Official Analytics Rule:** Official CIE portfolio metrics and statistics rely strictly on the **latest approved assessment** for each startup.
- **Draft & Pending Submissions:** Counted separately in operational queues; never factored into official IP maturity averages.
- **Reports:** Server-side streaming generation of Individual Startup Reports (PDF) and Consolidated CIE Portfolio Reports (PDF & Excel). No permanent file storage on cloud disks in v1; reports are dynamically rendered and streamed.

---

## C. Confirmed Technology Stack

Strict adherence to the following baseline architecture without introducing unapproved third-party SaaS or microservices:

| Layer | Confirmed Technology | Version / Specification | Rationale & Constraints |
|---|---|---|---|
| **Framework** | Next.js | 16 (App Router) | Unified React frontend and serverless API route handlers. |
| **Language** | TypeScript | 5.x (Strict mode) | Complete end-to-end type safety; no unconstrained `any`. |
| **Frontend Runtime**| React | 19.x (Server & Client Components) | Modern React paradigms; server-side rendering where applicable. |
| **Styling** | Tailwind CSS | 4.x / PostCSS | Utility-first, performant institutional styling. |
| **UI Components** | shadcn/ui | Radix UI primitives | Accessible, customizable, high-grade institutional components. |
| **Backend API** | Next.js Route Handlers | RESTful `/api/v1/*` | Modular API route endpoints within the monolith. |
| **Database** | Neon PostgreSQL | PostgreSQL 16/17 Serverless | High-performance managed Postgres; connection pooling enabled. |
| **ORM** | Prisma | Latest 6.x | Schema-driven migrations, type-safe queries, client generation. |
| **Authentication** | Custom Credentials | Argon2id + DB Sessions | Self-contained, zero external auth provider dependency. |
| **Password Hashing** | Argon2id | `hash()` via `argon2` npm package | OWASP recommended modern memory-hard hashing algorithm. |
| **Session Security** | Database-backed Sessions | Cryptographic Random Token Hash | SHA-256 hashed in DB; raw token in secure HTTP-only cookies. |
| **Authorization** | Role-Based Access Control | Strict RBAC (`STARTUP`, `CIE_ADMIN`, `REVIEWER`) | Server-side validation on every protected route and mutation. |
| **Data Visualization**| Recharts | Latest | Clean, responsive charting for CIE dashboards and analytics. |
| **PDF Generation** | React PDF (`@react-pdf/renderer`)| Server-side streaming | Clean institutional layout generation without headless Chrome. |
| **Excel Export** | ExcelJS | Streaming workbook generation | Multi-sheet structured reports with formatting and formulas. |
| **Hosting Platform** | Vercel | Production & Preview | Native Next.js deployment, zero-config serverless execution. |
| **Version Control** | Git / GitHub | Feature branch & PR workflow | Git-based CI/CD triggers on Vercel. |

### Prohibited Dependencies in Release 1.0:
- **No Supabase / Firebase / Clerk / Auth.js / NextAuth:** Replaced by custom Argon2id + database sessions.
- **No Cloudflare R2 / AWS S3 / Supabase Storage:** No external document storage in v1. Supporting references are captured as metadata/text until file storage is formally provisioned.
- **No Resend / SendGrid / Nodemailer:** Email notifications are excluded from v1 scope. In-app alerts, queue statuses, and review calendars satisfy monitoring needs.
- **No Redis / Memcached:** Database indexing and query optimization on Neon suffice for current scale.
- **No Kubernetes / Docker Swarm / Microservices:** Single cohesive modular monolith.

---

## D. User Roles & Access Control

### 1. STARTUP
- **Entity Association:** 1-to-1 association with a specific `Startup` record via `StartupMember`.
- **Permissions:**
  - Authenticate into the startup portal.
  - View and edit authorized fields of their own Startup profile.
  - Initiate, edit, and save draft IP assessments.
  - Submit assessments for CIE review.
  - View historical assessment versions and status transitions for their startup.
  - View category and overall scores once calculated/approved.
  - View reviewer remarks and requested modifications.
  - Download official individual IP PDF reports for approved assessments.
  - View scheduled review dates.
- **Restrictions:**
  - Strictly isolated to their own startup records (`tenant_isolation`).
  - Cannot access other startups or global directory.
  - Cannot view CIE administration or reviewer dashboards.
  - Cannot modify submitted, under-review, or approved assessments.
  - Cannot approve, reject, or override any score.

### 2. CIE_ADMIN
- **Entity Association:** Bennett Hatchery Incubation Team / Institutional Administrators.
- **Permissions:**
  - Authenticate into the CIE administration dashboard.
  - View all registered startups and startup profiles.
  - View all assessment submissions across all versions and statuses.
  - Monitor portfolio-wide KPIs, score distributions, and time trends.
  - Search and filter startup directory across industry, stage, status, score range.
  - Generate consolidated portfolio analytics reports (PDF & Excel).
  - Generate individual startup reports for any startup.
  - Monitor upcoming and overdue review schedules across the incubator.
  - Provision, manage, activate, and deactivate user accounts (`STARTUP`, `REVIEWER`, `CIE_ADMIN`).
  - Read system audit logs.
- **Restrictions:**
  - Cannot submit startup assessments on behalf of startups without an auditable workflow.
  - Cannot bypass role checks or delete immutable assessment/audit records.

### 3. REVIEWER
- **Entity Association:** Designated Intellectual Property Specialist / CIE Technical Evaluator.
- **Permissions:**
  - Authenticate into the Reviewer workspace (`/cie/reviewer`).
  - Access the review queue of submitted and resubmitted assessments.
  - Inspect detailed questionnaire responses, applicability declarations, and provisional scores.
  - Verify and modify IP applicability per category with mandatory remarks.
  - Record general remarks, category-specific remarks, and action recommendations.
  - Execute review decisions:
    - **Approve:** Finalize scores, transition status to `APPROVED`, record approval timestamp, and set mandatory `Next Review Date`.
    - **Request Changes:** Transition status to `CHANGES_REQUESTED`, itemize required changes, unlock resubmission capability.
    - **Reject:** Transition status to `REJECTED` with mandatory justification.
  - View past review history and audit records.
- **Restrictions:**
  - Cannot mutate raw startup questionnaire responses directly.
  - Cannot approve an assessment without setting a valid future review date.
  - Cannot access administrative configuration or user provisioning.

---

## E. Core Business Rules

1. **Unique Startup Identification:** Every startup has an immutable, system-generated identifier formatted as `BH-YYYY-NNN` (e.g. `BH-2026-001`).
2. **Assessment Immutability & Versioning:**
   - When an assessment is in `DRAFT`, it can be edited and saved iteratively.
   - Upon `SUBMITTED`, the version becomes strictly **read-only**.
   - If a reviewer requests changes (`CHANGES_REQUESTED`), the startup creates a new version (`V_next`) cloned from the previous responses, preserving the prior submission in history.
   - Version numbers increment monotonically (`1`, `2`, `3`...).
   - A previously submitted assessment is **never silently overwritten or mutated**.
3. **Official Portfolio Analytics Ingestion:**
   - Only assessments in `APPROVED` status contribute to official CIE portfolio KPIs and average maturity scores.
   - When a startup has multiple approved assessments over time, only the **latest approved assessment** is included in the current portfolio metrics snapshot.
   - Historical approved assessments are preserved for chronological trend lines and cohort analysis.
4. **Scoring Engine Integrity:**
   - All scoring calculations take place strictly on the server; client-provided scores are discarded.
   - Standardized question score mappings:
     - `YES` = 100 points
     - `APPLIED` = 50 points
     - `NO` = 0 points
     - `NOT_APPLICABLE` = Excluded from applicable denominator
     - `NOT_SURE` = 0 points / pending verification (flagged for reviewer scrutiny)
   - Category Score formula:  
     $$\text{Category Score} = \frac{\sum \text{Applicable Question Scores}}{\text{Count of Applicable Questions}}$$
   - Overall IP Maturity Score formula:  
     $$\text{Overall Score} = \frac{\sum \text{Applicable Category Scores}}{\text{Count of Applicable Categories}}$$
   - If a category is formally marked and verified as `NOT_APPLICABLE`, it is completely excluded from the overall score denominator so the startup is not penalized.
5. **Applicability Verification Dual-Check:**
   - The startup declares applicability per category (`startupApplicable: boolean`, `startupRemarks: string`).
   - The reviewer verifies applicability during review (`reviewerApplicable: boolean`, `reviewerRemarks: string`).
   - Reviewer-verified applicability supersedes startup declaration for score computation upon approval.
6. **Mandatory Review Scheduling:**
   - An assessment cannot be approved without specifying a valid future `Next Review Date`.
   - The scheduled date generates an entry in `ReviewSchedule` and binds to review monitoring widgets.
7. **Score Classifications:**
   - `0 – 20`: Initial
   - `21 – 40`: Developing
   - `41 – 60`: Intermediate
   - `61 – 80`: Advanced
   - `81 – 100`: Strong IP Readiness
   *(Disclaimers mandatory on UI and reports: Scores indicate internal incubation maturity and progress, not legal patentability or certification).*
8. **Auditing & Traceability:**
   - Every login, profile update, draft creation, submission, review remark, status change, score calculation, override, and report export generates an immutable `AuditLog` entry.

---

## F. Architecture Decisions

### 1. Modular Monolithic Next.js 16 Application
- Next.js 16 App Router housing frontend React components, server-side layouts, server actions/utilities, and RESTful Route Handlers under `/src/app/api/v1/*`.
- Single deployment bundle on Vercel ensuring frictionless development, unified TypeScript typing, zero CORS latency, and atomic deployments.

### 2. Separation of Concerns & Service Layer Pattern
- UI Components (`/src/components/*`) only invoke service functions or route handlers.
- Pure Business Logic resides inside `/src/services/*`:
  - `auth.service.ts`
  - `startup.service.ts`
  - `questionnaire.service.ts`
  - `assessment.service.ts`
  - `scoring.service.ts`
  - `reviewer.service.ts`
  - `analytics.service.ts`
  - `report.service.ts`
- Database access is isolated through `/src/lib/prisma.ts`.

### 3. Custom Stateless-Token Database Session Authentication
- Login verifies password using `argon2.verify()`.
- Upon successful authentication, generates a cryptographically secure random token (32 bytes, hex-encoded).
- Computes SHA-256 hash of the token and stores it in the `Session` table with an expiration timestamp (`expiresAt = now + 7 days`).
- Sends the raw token to the client inside an HTTP-only, Secure (in production), SameSite=Lax cookie named `bhf_ipms_session`.
- On incoming requests, Next.js middleware and route handlers hash the cookie value and lookup the active session joined with the `User` record.
- Fast, secure, completely database-revocable, zero third-party vendor lock-in.

### 4. Database & ORM Strategy
- **Neon PostgreSQL** serverless database with connection pooling enabled.
- **Prisma ORM** for schema declaration, migration generation, and type-safe query execution.
- Direct connection string (`DIRECT_URL`) configured for CLI migrations, pooled connection (`DATABASE_URL`) for runtime query execution.

### 5. On-Demand Streaming Reports
- Reports are dynamically computed from live database entities at request time.
- Individual reports: Rendered via `@react-pdf/renderer` in Node.js runtime and streamed with `Content-Type: application/pdf`.
- Consolidated reports: Streamed via `ExcelJS` as `.xlsx` or React PDF as `.pdf`.
- Report generation creates an entry in `ReportRecord` for audit traceability without storing heavy binary blobs on disk.

---

## G. Current Development Progress

| Phase | Phase Name | Status | Key Deliverables & Milestones |
|---|---|---|---|
| **Phase 0** | Documentation Analysis & Initialization | **Completed** | Comprehensive review of PRD/TRD, `memory.md`, `task.md`, `README.md`, `architecture.md`, `decisions.md`, `open-questions.md`. |
| **Phase 1** | Foundation & Infrastructure | **Completed** | Next.js 16 modular monolith, TypeScript 5, Tailwind CSS 4, shadcn/ui components, Neon PostgreSQL Prisma schema, `/api/v1/health` dynamic route, 0 build/lint errors. |
| **Phase 2** | Authentication & Authorization | **Next** | Argon2id hashing, database sessions, HTTP-only cookies, RBAC middleware, account provisioning & seeding. |
| **Phase 3** | Startup Management | Not Started | Startup models, ID generator (`BH-YYYY-NNN`), profile CRUD, member linking, CIE startup directory. |
| **Phase 4** | Questionnaire & Assessment Engine | Not Started | Category seed (Trademark, Patent, Copyright), questionnaire versioning, dynamic forms, draft auto-save, submission immutability. |
| **Phase 5** | IP Scoring Engine | Not Started | Question scoring, category aggregation, overall weighted/unweighted scores, applicability filtering, score persistence. |
| **Phase 6** | Reviewer Dashboard & Approval Workflow | Not Started | Review queue, remarks interface, applicability confirmation, Approve/Changes/Reject state machine, review scheduler. |
| **Phase 7** | CIE Administration & Analytics | Not Started | KPI cards, category breakdown, maturity distributions, trend analysis, review monitoring (7-day/30-day/overdue). |
| **Phase 8** | Reporting & Exports | Not Started | Individual PDF report streaming, consolidated PDF report, Excel export via ExcelJS, report logging. |
| **Phase 9** | Testing, Security & Optimization | Not Started | Unit/integration/security testing suites, RBAC penetration checks, calculation accuracy, migration rollback tests. |
| **Phase 10** | Production Deployment & Handover | Not Started | Vercel production deployment, Neon production branch, reference data seeding, CIE admin provisioning, handover docs. |

---

## H. Important Decisions and Assumptions

| Date | ID | Decision / Assumption | Rationale |
|---|---|---|---|
| 2026-11-13 | DEC-001 | Exclude external document storage (S3/R2/Supabase) in v1. | Explicitly confirmed by institutional requirements. Reduces operational surface and deployment complexity. Metadata/text references will be accepted in questionnaire. |
| 2026-11-13 | DEC-002 | Exclude external email service (Resend) in v1. | In-app alerts, calendar widgets, and queue status indicators meet institutional operational needs for initial launch. |
| 2026-11-13 | DEC-003 | Custom Argon2id + Database Sessions for Auth. | Replaces Supabase/Clerk. Guarantees 100% self-hosted credentials, database revocability, and zero recurring vendor cost. |
| 2026-11-13 | DEC-004 | Equal weighting for applicable IP categories initially. | In absence of custom category coefficients, Trademark, Patent, and Copyright contribute equally ($\frac{1}{N}$ where $N$ is count of applicable categories). |
| 2026-11-13 | DEC-005 | Shared Review Queue for CIE Reviewers. | All designated reviewers can view submitted assessments; reviewing locks or tags the assessment to the active reviewer during decision creation. |
| 2026-11-13 | DEC-006 | Snapshotting Questionnaire on Assessment Creation. | To guarantee assessment immutability across questionnaire version upgrades, assessments bind to immutable questionnaire versions. |
| 2026-11-13 | DEC-007 | Server-side Streaming for Report Exports. | Prevents disk accumulation and storage bucket billing; reports are generated on-the-fly and streamed directly to HTTP responses. |

---

## I. Development Conventions

1. **Language & Type Safety:**
   - Strict TypeScript configuration (`"strict": true`, `"noImplicitAny": true`).
   - Shared validation schemas using Zod for API payloads and form inputs.
   - Database entities mapped via Prisma generated types.
2. **Naming Conventions:**
   - Database tables: snake_case plural (`users`, `startups`, `ip_assessments`).
   - Prisma models: PascalCase singular (`User`, `Startup`, `IpAssessment`).
   - Database columns: snake_case mapped in Prisma using `@map` (`startup_code`, `created_at`).
   - TypeScript interfaces & types: PascalCase (`AssessmentDto`, `ScoringResult`).
   - Route handlers: Next.js standard `route.ts`.
   - React components: PascalCase (`StartupProfileForm.tsx`, `ReviewQueueTable.tsx`).
   - Service files: kebab-case with `.service.ts` (`assessment.service.ts`).
3. **Database & Transactions:**
   - Every multi-step mutation (e.g. submitting assessment, approving assessment, updating scores, creating review record) must run inside `prisma.$transaction()`.
   - Never write raw unparameterized SQL queries.
4. **Error Handling & Response Structure:**
   - Standardized API response format:
     ```json
     {
       "success": true,
       "data": { ... },
       "error": null,
       "timestamp": "2026-11-13T10:00:00.000Z"
     }
     ```
   - Standardized error format:
     ```json
     {
       "success": false,
       "data": null,
       "error": {
         "code": "UNAUTHORIZED",
         "message": "User does not have permission to review this assessment.",
         "details": []
       },
       "timestamp": "2026-11-13T10:00:00.000Z"
     }
     ```
5. **Security Conventions:**
   - Always validate session and check permissions inside route handlers and server actions; do not trust client cookies blindly.
   - Hash all passwords using Argon2id with recommended parameters (memory cost 64MB, time cost 3, parallelism 1).
   - Sanitize all text input against XSS before storage and rendering.
   - Strip sensitive attributes (`passwordHash`, `tokenHash`) before returning any user object in responses.

