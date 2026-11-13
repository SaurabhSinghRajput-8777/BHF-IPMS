# DEVELOPMENT TASK MANAGEMENT — BENNETT HATCHERY IPMS

**Project Name:** Bennett Hatchery Intellectual Property Management System (IPMS)  
**Document Classification:** Single Source of Truth for Implementation Progress  
**Last Updated:** November 13, 2026  
**Overall Project Status:** Phase 0 Active (Documentation Analysis & Project Initialization)

---

## Task Status Legend
- `[ ]` Not Started
- `[~]` In Progress
- `[x]` Completed
- `[!]` Blocked

---

## PHASE 0 — Documentation Analysis and Project Initialization

### Objective
Exhaustively review all provided institutional documentation (PRD, TRD, database schema specifications), identify contradictions and ambiguities, establish the system architecture, write core persistent governance documents, and define the complete phased execution plan.

### Scope
- Complete review and reconciliation of PRD and TRD.
- System directory and baseline configuration inspection.
- Creation of `memory.md`, `task.md`, `README.md`, `docs/architecture.md`, `docs/decisions.md`, and `docs/open-questions.md`.
- Architecture decisions documentation and development conventions definition.

### Detailed Tasks
- [x] Read PRD, TRD, and database schema completely.
- [x] Analyze requirements across Startup, CIE Admin, and Reviewer modules.
- [x] Identify contradictions, technical ambiguities, and missing requirements.
- [x] Inspect existing repository structure.
- [x] Create root-level `memory.md` with all required sections (A through I).
- [x] Create root-level `task.md` with complete Phase 0–10 breakdown.
- [x] Update root-level `README.md` with system overview, architecture, and guides.
- [x] Create `docs/architecture.md` detailing system architecture, data models, state machines, and scoring math.
- [x] Create `docs/decisions.md` documenting Architectural Decision Records (ADR 001–008).
- [x] Create `docs/open-questions.md` listing technical ambiguities and policy clarifications.
- [x] Present architecture summary, risk matrix, and Phase 1 recommendation to stakeholders.

### Dependencies
- Access to project repository and documentation files (`docs/PRD.md`, `docs/TRD.md`).

### Expected Deliverables
- `memory.md`
- `task.md`
- `README.md`
- `docs/architecture.md`
- `docs/decisions.md`
- `docs/open-questions.md`

### Acceptance Criteria
- All supplied documents have been comprehensively reviewed and cross-referenced.
- All contradictions (document storage, email notifications, auth provider) are resolved or flagged.
- Project architecture and directory structure are documented.
- Development phases, tasks, and acceptance criteria are established and approved.

### Testing Requirements
- Review documents for semantic consistency, correct cross-referencing, and alignment with institutional constraints.

### Definition of Done
- All Phase 0 files are generated and committed to the workspace.
- Clear recommendation for Phase 1 presented, awaiting explicit approval before coding begins.

**Phase Status:** `[x]` Completed

---

## PHASE 1 — Project Foundation and Infrastructure

### Objective
Initialize the production-ready Next.js 16 modular monolithic application with TypeScript, Tailwind CSS, shadcn/ui component library, Neon PostgreSQL database connection, and Prisma ORM baseline migrations.

### Scope
- Next.js 16 App Router scaffolding.
- TypeScript, Tailwind CSS, and shadcn/ui installation and thematic configuration.
- Prisma ORM initialization, schema setup, and migration generation.
- Neon PostgreSQL connection setup with connection pooling (`DATABASE_URL`) and direct migration access (`DIRECT_URL`).
- Application directory structure setup according to TRD §27.
- Environment variables schema and validation.
- Git repository conventions and `.gitignore` setup.

### Detailed Tasks
- [x] Initialize Next.js 16 project with TypeScript and ESLint (`src/` directory, App Router).
- [x] Configure Tailwind CSS and typography/color system for Bennett Hatchery branding.
- [x] Initialize and configure shadcn/ui component library.
- [x] Install base dependencies: `prisma`, `@prisma/client`, `zod`, `clsx`, `tailwind-merge`, `lucide-react`, `class-variance-authority`, `tsx`.
- [x] Configure `prisma/schema.prisma` with baseline PostgreSQL models as defined in TRD Part C.
- [x] Configure Neon PostgreSQL connection parameters in `.env.example` and `.env`.
- [x] Establish `src/lib/prisma.ts` with global client caching for serverless execution.
- [x] Validate Prisma schema and generate type-safe Prisma Client.
- [x] Establish modular project directory structure:
  - `src/app/(auth)`
  - `src/app/(startup)`
  - `src/app/(cie)`
  - `src/app/(reviewer)`
  - `src/app/api/v1`
  - `src/components/ui`, `src/components/shared`, `src/components/startup`, `src/components/cie`, `src/components/reviewer`
  - `src/lib`, `src/services`, `src/types`
- [x] Create base layout, root metadata, institutional landing page, and health check route (`/api/v1/health`).
- [x] Verify local application build (`npm run build`) and linting (`npm run lint`) with 0 errors.

### Dependencies
- Phase 0 approval.
- Active Neon PostgreSQL database instance and connection strings.

### Expected Deliverables
- Fully running Next.js 16 application.
- Operational Prisma client connected to Neon PostgreSQL.
- Validated Prisma schema.
- Standardized directory tree and base UI shell.
- Verified `.env.example` file.

### Acceptance Criteria
- Application builds and runs locally without warnings or runtime errors.
- Prisma schema is valid and generated without errors.
- Route Handlers adhere to Next.js 16 conventions (`await connection()`, Cache Components).
- No sensitive credentials or secrets are tracked in Git.

### Testing Requirements
- Build smoke test validating zero TypeScript and ESLint errors.
- Validation of Prisma client models and generated types.

### Definition of Done
- Next.js 16 modular monolith initialized, Prisma client generated, essential shadcn UI components configured, `/api/v1/health` endpoint implemented, production build and linting verified with 0 errors.

**Phase Status:** `[x]` Completed

---

## PHASE 2 — Authentication and Authorization

### Objective
Implement a secure, self-contained custom credentials authentication system using Argon2id password hashing, database-backed sessions with SHA-256 token hashing, HTTP-only secure cookies, and strict Role-Based Access Control (RBAC) across `STARTUP`, `CIE_ADMIN`, and `REVIEWER` roles.

### Scope
- User login, logout, and current user retrieval endpoints.
- Password hashing using Argon2id via `argon2`.
- Database session creation, validation, expiration, and revocation.
- HTTP-only, secure, SameSite cookie management.
- Next.js middleware for route protection and RBAC enforcement.
- Admin user provisioning endpoints and secure initial seed script for CIE admins and reviewers.

### Detailed Tasks
- [x] Install `argon2` and cryptographic utilities.
- [x] Implement `src/services/auth.service.ts` with Argon2id password hashing and verification functions.
- [x] Implement `src/lib/session.ts` for generating cryptographically secure session tokens, hashing tokens (SHA-256), creating database sessions, and validating sessions.
- [x] Implement cookie utilities for setting, getting, and clearing `bhf_ipms_session` HTTP-only cookies.
- [x] Build `/api/v1/auth/login` endpoint with input validation (Zod) and account status guards.
- [x] Build `/api/v1/auth/logout` endpoint with database session deletion and cookie clearance.
- [x] Build `/api/v1/auth/me` endpoint to retrieve authenticated user identity and role.
- [x] Build `/api/v1/auth/change-password` endpoint with Argon2id verification and re-hashing.
- [x] Implement Next.js `middleware.ts` to protect `/startup/*`, `/cie/*`, and `/cie/reviewer/*` route hierarchies based on authenticated user session.
- [x] Build client login page UI (`src/app/(auth)/login/page.tsx`) with professional Bennett Hatchery branding and role-based redirect.
- [x] Implement unauthorized redirect page (`src/app/unauthorized/page.tsx`).
- [x] Create database seed script (`prisma/seed.ts`) to securely provision default CIE Admin, Reviewer, and Demo Startup accounts with pre-hashed credentials.
- [x] Author and verify unit test suite (`tests/unit/auth.test.ts`).

### Dependencies
- Phase 1 complete and database operational.

### Expected Deliverables
- Working credentials authentication engine.
- Complete session management system.
- RBAC middleware protecting all route segments.
- Seeded default accounts for `CIE_ADMIN`, `REVIEWER`, and `STARTUP`.
- Login and session verification test suite.

### Acceptance Criteria
- All three roles (`STARTUP`, `CIE_ADMIN`, `REVIEWER`) can authenticate successfully.
- Startup users cannot access `/cie/*` or `/cie/reviewer/*`.
- Reviewers cannot access `/cie/users` or mutate admin configurations.
- Sessions automatically expire after configured max-age (7 days) and can be immediately revoked.
- Passwords are never stored or logged in plaintext; only Argon2id hashes reside in database.
- Database stores only SHA-256 hashes of session tokens.

### Testing Requirements
- Unit tests for password hashing/verification (`tests/unit/auth.test.ts` passing 3/3).
- Security verification of Argon2id hashing parameters and token length.

### Definition of Done
- Authentication, session lifecycle, and RBAC middleware implemented, verified with passing automated tests.

**Phase Status:** `[x]` Completed

---

## PHASE 3 — Startup Management

### Objective
Implement the Startup master data module, enabling profile creation, editing, unique Startup ID generation (`BH-YYYY-NNN`), user-to-startup association, and the centralized CIE Startup Directory with multi-facet search and filtering.

### Scope
- Startup data models and service methods.
- Immutable `startup_code` generation engine.
- Startup profile page and update form for founders.
- CIE Startup Directory with server-side pagination, search, and filtering.
- Detailed Startup dossier view for CIE admins and assigned reviewers.

### Detailed Tasks
- [ ] Implement `src/services/startup.service.ts` for startup CRUD, member association, and directory querying.
- [ ] Implement unique startup ID generation algorithm (`BH-YYYY-NNN` with sequence locking).
- [ ] Build `GET /api/v1/startups/me` and `PUT /api/v1/startups/me` route handlers.
- [ ] Build `GET /api/v1/cie/startups` route handler with query parameters: `search`, `industry`, `stage`, `page`, `limit`.
- [ ] Build `GET /api/v1/cie/startups/:id` route handler for detailed startup view.
- [ ] Create Startup profile UI (`src/app/(startup)/startup/profile/page.tsx`) with fields:
  - Startup Name, Founder Name, Co-founders, Official Email, Phone, Website
  - Industry/Sector, Stage (Idea, Prototype, MVP, Early Revenue, Growth, Established)
  - Incorporation Date, CIN/Registration, Startup Description, Product Description
- [ ] Create CIE Startup Directory UI (`src/app/(cie)/cie/startups/page.tsx`) with data table, search bar, and facet filters.
- [ ] Create CIE Startup Details UI (`src/app/(cie)/cie/startups/[startupId]/page.tsx`).
- [ ] Implement audit logging on startup profile updates.
- [ ] Enforce startup data isolation: startup users can only view and mutate their linked startup.

### Dependencies
- Phase 2 complete.

### Expected Deliverables
- Startup management service and REST APIs.
- Startup profile editor and viewing interface.
- CIE Startup Directory table with filtering and pagination.
- Startup ID auto-generator.

### Acceptance Criteria
- Startup ID format strictly matches `BH-YYYY-NNN` and is unique across all startups.
- Profile changes persist reliably in Neon database and log an audit record.
- Non-admin startup users cannot query or inspect other startups.
- CIE administrators can search, filter, and drill into any startup dossier.

### Testing Requirements
- Unit tests for startup ID generator sequence and uniqueness.
- Integration tests verifying startup isolation and authorization barriers.
- Filter and pagination query tests for the directory API.

### Definition of Done
- Startup profile management and CIE directory functional, tested, and verified end-to-end.

**Phase Status:** `[ ]` Not Started

---

## PHASE 4 — Questionnaire and Assessment Engine

### Objective
Develop the dynamic, version-controlled IP questionnaire and assessment engine covering Trademark, Patent, and Copyright categories, supporting draft auto-saving, conditional display logic, category applicability declarations, validation, and immutable submission versioning.

### Scope
- IP Categories seed: Trademark, Patent, Copyright.
- Questionnaire versioning system (`IpQuestionnaire` + `IpQuestion`).
- Dynamic questionnaire form with conditional logic and response options (`YES`, `NO`, `APPLIED`, `NOT_APPLICABLE`, `NOT_SURE`).
- Draft assessment persistence and retrieval.
- Assessment validation engine ensuring mandatory questions and applicability declarations are complete.
- Assessment submission workflow creating immutable version snapshots (`V1`, `V2`, etc.).

### Detailed Tasks
- [ ] Seed reference data for IP Categories (`TRADEMARK`, `PATENT`, `COPYRIGHT`) in `prisma/seed.ts`.
- [ ] Seed initial questionnaire version 1 (`IpQuestionnaire` v1) with full set of questions:
  - General IP questions (5 items)
  - Trademark assessment questions (8 items + details)
  - Patent assessment questions (8 items + details)
  - Copyright assessment questions (8 items + details)
- [ ] Implement `src/services/questionnaire.service.ts` to fetch published questionnaires and question schemas.
- [ ] Implement `src/services/assessment.service.ts` for draft creation, autosave, preview, and submission.
- [ ] Build route handlers:
  - `GET /api/v1/questionnaires/active`
  - `POST /api/v1/assessments` (Create draft)
  - `GET /api/v1/assessments/:id` (Get assessment details)
  - `PUT /api/v1/assessments/:id` (Save draft responses)
  - `POST /api/v1/assessments/:id/submit` (Finalize submission)
  - `GET /api/v1/startups/me/assessments` (List version history)
- [ ] Build multi-step assessment UI (`src/app/(startup)/startup/assessment/page.tsx`):
  - Section 1: General IP & Applicability Declaration
  - Section 2: Trademark Assessment
  - Section 3: Patent Assessment
  - Section 4: Copyright Assessment
  - Section 5: Review & Preview before Submission
- [ ] Implement conditional rendering logic (e.g. show patent filing details only if Patent Filed = YES/APPLIED).
- [ ] Implement Category Applicability UI allowing startup to declare applicability with mandatory justification if Not Applicable.
- [ ] Implement transactional submission logic in `assessment.service.ts`:
  - Validate all required responses.
  - Snapshot responses in `IpResponse`.
  - Snapshot applicability in `AssessmentApplicability`.
  - Set status to `SUBMITTED`, set `submittedAt` timestamp.
  - Calculate provisional score.
  - Lock assessment to read-only.
  - Create audit log entry.
- [ ] Implement resubmission workflow: when status is `CHANGES_REQUESTED`, allow startup to initiate a new version (`version = previous + 1`), pre-filling previous answers.

### Dependencies
- Phase 3 complete.

### Expected Deliverables
- Versioned questionnaire engine with full initial question bank.
- Interactive multi-step assessment form with conditional branches.
- Transactional draft saving and immutable submission mechanism.
- Assessment versioning and historical response viewer.

### Acceptance Criteria
- Questionnaire is dynamic and driven from database configurations.
- Conditional questions render seamlessly based on previous answers.
- Draft assessments persist reliably without data loss across sessions.
- Once submitted, an assessment cannot be edited or overwritten.
- Resubmission produces a new version while preserving previous versions in historical state.

### Testing Requirements
- Unit tests for conditional question evaluation logic.
- Integration tests for draft autosave, submission validation, and version incrementing.
- Immutability tests: assert that PUT requests to submitted assessments fail with 403/409.

### Definition of Done
- Complete questionnaire lifecycle from blank draft to immutable submission tested and verified.

**Phase Status:** `[ ]` Not Started

---

## PHASE 5 — IP Scoring Engine

### Objective
Implement the server-side Intellectual Property maturity scoring engine, calculating normalized category scores and overall portfolio maturity scores, handling `NOT_APPLICABLE` category exclusions, managing `NOT_SURE` responses, and enabling authorized reviewer score overrides with justification.

### Scope
- Server-side question score mapping (`YES`=100, `APPLIED`=50, `NO`=0, `NOT_APPLICABLE`=Exclude, `NOT_SURE`=0/Pending).
- Category-wise maturity score aggregation.
- Overall IP maturity score calculation with dynamic category denominator.
- Reviewer applicability verification integration into scoring.
- Score persistence in `IpScore` table.
- Score classification mapping (`Initial`, `Developing`, `Intermediate`, `Advanced`, `Strong IP Readiness`).
- Historical score comparisons across assessment versions.

### Detailed Tasks
- [ ] Implement `src/services/scoring.service.ts` with pure mathematical calculation functions.
- [ ] Implement question-level response scoring parser based on question `scoringConfig`.
- [ ] Implement category score calculation:
  $$\text{CategoryScore} = \frac{\sum \text{QuestionScores}}{\text{ApplicableQuestionCount}}$$
- [ ] Implement overall score calculation:
  $$\text{OverallScore} = \frac{\sum \text{ApplicableCategoryScores}}{\text{ApplicableCategoryCount}}$$
- [ ] Handle edge cases:
  - If all questions in a category are `NOT_APPLICABLE`, category is treated as inapplicable.
  - If all 3 categories are declared inapplicable, return score 0 with flag `NO_APPLICABLE_IP`.
  - `NOT_SURE` responses scored as 0 and highlighted for reviewer verification.
- [ ] Implement score classification function returning tier (`Initial` to `Strong IP Readiness`).
- [ ] Build `GET /api/v1/assessments/:id/score` route handler.
- [ ] Implement score persistence logic: store individual category scores and overall score in `IpScore` table within submission and approval transactions.
- [ ] Implement authorized score override logic for reviewers with mandatory `overrideReason`.
- [ ] Build score comparison utility comparing `V_current` scores against `V_previous` scores.
- [ ] Display visual score cards and progress gauges on Startup Dashboard (`src/app/(startup)/startup/dashboard/page.tsx`).

### Dependencies
- Phase 4 complete.

### Expected Deliverables
- Server-side scoring engine with 100% calculation determinism.
- Score persistence and history comparison models.
- Frontend score cards and classification indicators.
- Comprehensive scoring test suite.

### Acceptance Criteria
- All calculations are performed on the server; client score submissions are impossible.
- Categories verified as Not Applicable are excluded from overall score denominator.
- Stored scores are reproducible from questionnaire responses and scoring configuration.
- Score classifications accurately reflect defined institutional ranges (0–20, 21–40, 41–60, 61–80, 81–100).
- Overrides require reviewer authorization and logged justification.

### Testing Requirements
- Unit test suite testing 20+ scoring scenarios (all YES, all NO, mixed, all NA, single category NA, all Not Sure).
- Integration test for score calculation and persistence during assessment submission and approval.

### Definition of Done
- Scoring engine verified against mathematical test matrix with zero discrepancies.

**Phase Status:** `[ ]` Not Started

---

## PHASE 6 — Reviewer Dashboard and Approval Workflow

### Objective
Build the dedicated CIE Reviewer workspace, including the review queue, detailed assessment inspection interface, category-level remarks and action items, applicability verification, decision state machine (Approve / Request Changes / Reject), and mandatory Next Review Date scheduling.

### Scope
- Reviewer Dashboard with operational KPI metrics and review queue table.
- Assessment review workspace with question responses, applicability checks, and score preview.
- Remark system (General, Trademark, Patent, Copyright, Recommended Actions).
- Transactional decision execution (`APPROVED`, `CHANGES_REQUESTED`, `REJECTED`).
- Review scheduling engine with calendar/date picker and validation.
- Complete audit logging of all reviewer actions.

### Detailed Tasks
- [ ] Implement `src/services/reviewer.service.ts` for queue retrieval, remarks management, and decision processing.
- [ ] Build route handlers:
  - `GET /api/v1/reviewer/queue` (Filter by status, priority, date)
  - `GET /api/v1/reviewer/assessments/:id` (Full assessment payload for review)
  - `POST /api/v1/reviewer/assessments/:id/remarks` (Save remarks)
  - `POST /api/v1/reviewer/assessments/:id/applicability` (Verify category applicability)
  - `POST /api/v1/reviewer/assessments/:id/approve` (Approve with next review date)
  - `POST /api/v1/reviewer/assessments/:id/request-changes` (Request changes with itemized notes)
  - `POST /api/v1/reviewer/assessments/:id/reject` (Reject with formal reason)
  - `GET /api/v1/reviewer/history` (Past review decisions)
- [ ] Build Reviewer Queue UI (`src/app/(reviewer)/cie/reviewer/queue/page.tsx`):
  - Table: Assessment ID, Startup Name, Submission Date, Version, Current Status, Score, Actions.
- [ ] Build Assessment Review UI (`src/app/(reviewer)/cie/reviewer/assessments/[assessmentId]/page.tsx`):
  - Startup Profile Summary
  - Tabbed category responses (General, Trademark, Patent, Copyright)
  - Applicability verification toggle with reviewer justification field
  - Provisional score preview
  - Category remark text areas
  - Final decision panel: Approve (with Date Picker), Request Changes, Reject
- [ ] Implement transactional approval logic in `reviewer.service.ts`:
  - Validate assessment is in `SUBMITTED` or `RESUBMITTED` or `UNDER_REVIEW`.
  - Validate next review date is in the future.
  - Finalize and persist scores in `IpScore`.
  - Create `ReviewRecord` with remarks and decision.
  - Create `ReviewSchedule` record with scheduled date.
  - Update `IpAssessment` status to `APPROVED`, set `approvedAt`.
  - Write audit log entry.
- [ ] Implement changes requested logic:
  - Update status to `CHANGES_REQUESTED`.
  - Record reviewer remarks in `ReviewRecord`.
  - Unlock startup resubmission capability.
- [ ] Build Reviewer History UI (`src/app/(reviewer)/cie/reviewer/history/page.tsx`).

### Dependencies
- Phase 5 complete.

### Expected Deliverables
- Reviewer queue and evaluation workspace.
- Transactional decision processor for Approve, Request Changes, Reject.
- Review scheduling system.
- Complete reviewer audit trail.

### Acceptance Criteria
- Only users with `REVIEWER` (or authorized `CIE_ADMIN`) role can access the review module.
- An assessment cannot be approved without specifying a valid future review date.
- Status transitions follow strict state machine rules; invalid transitions are rejected.
- Approval and scheduling execute atomically in a single database transaction.
- Remarks and review decisions are permanently stored and viewable by the startup.

### Testing Requirements
- State machine transition tests (e.g. attempting to approve a DRAFT fails).
- Transaction rollback test: simulate database failure during review scheduling to verify rollback.
- RBAC tests: assert startup users cannot call approval endpoints.

### Definition of Done
- Complete reviewer lifecycle tested end-to-end with verified database records and audit logs.

**Phase Status:** `[ ]` Not Started

---

## PHASE 7 — CIE Administration Dashboard and Analytics

### Objective
Develop the centralized CIE Administration Dashboard providing comprehensive portfolio analytics, KPI summary cards, category distributions, maturity classifications, historical submission and approval trends, upcoming/overdue review monitoring, and advanced filtering.

### Scope
- Portfolio KPI calculations based strictly on the latest approved assessment per startup.
- Real-time aggregation queries for Trademark, Patent, and Copyright progress.
- Visual analytics charts using Recharts (Maturity distribution, Category readiness, Monthly trends).
- Review monitoring system (reviews due in 7 days, 30 days, overdue reviews).
- Advanced filter controls across industry, stage, category, score range, and dates.

### Detailed Tasks
- [ ] Implement `src/services/analytics.service.ts` with optimized database aggregation queries:
  - `getPortfolioKpis()`: Total Startups, Submitted Assessments, Approved Assessments, Pending Assessments, Requiring Changes, Average IP Score.
  - `getCategoryDistribution()`: Trademark, Patent, Copyright application and registration counts.
  - `getMaturityDistribution()`: Startups grouped by score classification (Initial to Strong IP).
  - `getMonthlyTrends(months)`: Submissions vs Approvals over time.
  - `getReviewMonitoring()`: Upcoming (7 days, 30 days) and Overdue reviews.
- [ ] Build route handlers:
  - `GET /api/v1/cie/analytics/overview`
  - `GET /api/v1/cie/analytics/categories`
  - `GET /api/v1/cie/analytics/trends`
  - `GET /api/v1/cie/reviews/upcoming`
- [ ] Build CIE Dashboard UI (`src/app/(cie)/cie/dashboard/page.tsx`):
  - Top KPI Metric Cards
  - IP Category Readiness Progress Bars
  - IP Maturity Classification Distribution Chart (Bar/Pie via Recharts)
  - Monthly Submission & Approval Trends Chart (Area/Line via Recharts)
  - Review Monitoring Widget (Tabs: Due in 7 Days, Due in 30 Days, Overdue)
  - Recent Submissions & Pending Reviews Quick Table
- [ ] Implement filter controls on dashboard (Industry, Startup Stage, Date Range) with reactive query refetching.
- [ ] Implement Review Monitoring dedicated view (`src/app/(cie)/cie/reviews/page.tsx`).
- [ ] Validate analytics data integrity rule: pending/rejected assessments never pollute approved portfolio averages.

### Dependencies
- Phase 6 complete.

### Expected Deliverables
- Analytics aggregation service with optimized Prisma/SQL queries.
- Interactive CIE Executive Dashboard with responsive Recharts visualizations.
- Review schedule monitoring and overdue tracking dashboard.

### Acceptance Criteria
- Portfolio KPIs strictly use the latest approved assessment per startup.
- Inapplicable categories are excluded from portfolio averages.
- Visual charts are accurate, fully responsive, and render within performance thresholds (< 2s).
- Overdue reviews are calculated dynamically based on current date vs scheduled date.

### Testing Requirements
- Query performance testing under simulated multi-startup data.
- Analytical accuracy validation: assert calculated dashboard metrics match raw database aggregations.

### Definition of Done
- CIE Dashboard fully operational with live database metrics, responsive charts, and passing validation tests.

**Phase Status:** `[ ]` Not Started

---

## PHASE 8 — Reporting and Exports

### Objective
Implement institutional report generation engines, providing server-side dynamic PDF generation for Individual Startup IP Reports and Consolidated CIE Portfolio Reports, as well as multi-sheet structured Excel exports (`.xlsx`) via ExcelJS.

### Scope
- Server-side PDF generation via React PDF (`@react-pdf/renderer`).
- Individual Startup IP Assessment Report (PDF).
- Consolidated CIE Portfolio Analytics Report (PDF).
- Excel Analytics Export (`.xlsx`) via `ExcelJS`.
- Report metadata tracking in `ReportRecord` table.
- Secure, authorized streaming delivery without permanent file storage.

### Detailed Tasks
- [ ] Install `@react-pdf/renderer` and `exceljs`.
- [ ] Implement `src/services/report.service.ts` for report data collation, metadata logging, and streaming.
- [ ] Design Individual Startup Report PDF template (`src/lib/reports/StartupReportPdf.tsx`):
  - Bennett Hatchery branding and institutional header
  - Report ID, Startup ID, Startup Profile (Founder, Sector, Stage, Contact)
  - Assessment metadata: Version, Submission Date, Approval Date, Reviewer Name
  - Overall IP Maturity Score & Category Scores (Trademark, Patent, Copyright)
  - Category-by-category questionnaire responses and status
  - Reviewer remarks, action recommendations, and Next Review Date
  - Legal disclaimer on scoring interpretation
- [ ] Design Consolidated CIE Portfolio Report PDF template (`src/lib/reports/CieConsolidatedReportPdf.tsx`):
  - Executive summary and portfolio KPIs
  - Category breakdown and distribution charts
  - Startup-by-startup score comparison table
  - Upcoming and overdue reviews summary
- [ ] Implement Excel export generator (`src/lib/reports/CieExcelExport.ts`) using `ExcelJS`:
  - Sheet 1: Executive Summary & KPIs
  - Sheet 2: Startup Master & Latest IP Scores
  - Sheet 3: Category Detailed Progress (Trademark, Patent, Copyright)
  - Sheet 4: Review Schedules & Overdue Tracker
  - Professional column formatting, styling, and header freeze panes
- [ ] Build report streaming route handlers:
  - `GET /api/v1/assessments/:id/report` (Individual PDF)
  - `GET /api/v1/cie/reports/analytics?format=pdf` (Consolidated PDF)
  - `GET /api/v1/cie/reports/analytics?format=xlsx` (Consolidated Excel)
- [ ] Implement report generation audit logging in `ReportRecord`.
- [ ] Add download buttons and report viewing UI in Startup and CIE portals.

### Dependencies
- Phase 7 complete.

### Expected Deliverables
- Individual Startup PDF report generator.
- Consolidated Portfolio PDF report generator.
- Multi-sheet Excel workbook export generator.
- Streaming REST endpoints and UI download controls.

### Acceptance Criteria
- Reports render server-side and stream directly to client with appropriate HTTP headers (`Content-Disposition: attachment`).
- Individual reports include all required fields (submission, approval, next review, category scores, remarks).
- Consolidated reports exactly match live CIE dashboard metrics.
- Draft or rejected assessments are never issued as approved reports.
- Startup users can only download reports for their own approved assessments.

### Testing Requirements
- Unit tests validating report data assembly.
- Integration tests asserting successful PDF and Excel stream responses (status 200, valid binary content).
- Authorization checks verifying startup access isolation for report endpoints.

### Definition of Done
- Both PDF formats and Excel export tested, visually validated, and verified against database records.

**Phase Status:** `[ ]` Not Started

---

## PHASE 9 — Testing, Security and Optimization

### Objective
Execute rigorous end-to-end verification, comprehensive unit and integration test suites, RBAC security penetration testing, database integrity validation, query optimization, input sanitization, and disaster recovery procedures.

### Scope
- Comprehensive automated test suite (Jest/Vitest + React Testing Library).
- Unit tests: Scoring engine, applicability formulas, session validation, ID generation.
- Integration tests: Complete assessment lifecycle from draft to approval and reporting.
- Security tests: Role boundary tests, IDOR prevention, SQL injection defense, CSRF/XSS sanitization.
- Performance optimization: Prisma query profiling, index verification, connection pool tuning.
- Database backup and recovery verification on Neon PostgreSQL.

### Detailed Tasks
- [ ] Configure testing framework (`vitest` or `jest`, `@testing-library/react`).
- [ ] Write unit test suite for Scoring Engine:
  - 100% code coverage on scoring math, edge cases, NA exclusions, Not Sure handling.
- [ ] Write unit test suite for Authentication & Session management:
  - Password hashing, session token generation, hashing, expiration checks.
- [ ] Write integration test suite for Assessment Lifecycle:
  - Draft creation -> Autosave -> Submission -> Reviewer Remarks -> Changes Requested -> Resubmission -> Approval.
- [ ] Write security tests for RBAC:
  - Attempt startup access to CIE routes (assert 403 Forbidden).
  - Attempt startup access to other startup IDs (assert 403 Forbidden / 404 Not Found).
  - Attempt reviewer approval without required role (assert 403 Forbidden).
  - Verify assessment immutability after submission (assert updates fail).
- [ ] Audit all input validation schemas (Zod) across all API endpoints.
- [ ] Profile database queries on Neon, verify query execution plans and index utilization.
- [ ] Validate and tune Neon connection pooling settings.
- [ ] Verify database backup and export procedures.
- [ ] Conduct end-to-end user journey smoke tests for all three personas.

### Dependencies
- Phases 1 through 8 complete.

### Expected Deliverables
- Automated test suite with passing unit, integration, and security tests.
- Security audit report verifying zero critical vulnerabilities.
- Database query performance optimization report.
- Tested backup and restoration runbook.

### Acceptance Criteria
- All automated tests pass with zero regressions.
- No cross-tenant data leaks or unauthorized privilege escalation possible.
- Assessment versions remain 100% immutable once submitted.
- Standard dashboard and assessment pages load under 2 seconds.
- Neon database backup restoration verified successfully.

### Testing Requirements
- 100% pass rate across unit, integration, and security test suites.

### Definition of Done
- Complete test suite passing, security verification sign-off, system ready for CIE institutional UAT.

**Phase Status:** `[ ]` Not Started

---

## PHASE 10 — Production Deployment and Handover

### Objective
Deploy the production-grade Bennett Hatchery IPMS on Vercel with production Neon PostgreSQL database, apply production migrations, seed reference data, provision official CIE administrator accounts, verify operational stability, and deliver user documentation and technical handover.

### Scope
- Vercel production project configuration and custom domain setup.
- Production Neon PostgreSQL branch setup and connection string configuration.
- Production database migration and reference data seeding.
- Provisioning of initial CIE administrative and reviewer accounts.
- Final production smoke testing across all three user workflows.
- Technical documentation, administrator user manual, and institutional handover.

### Detailed Tasks
- [ ] Set up production project on Vercel connected to official GitHub repository.
- [ ] Configure production environment variables on Vercel (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NODE_ENV=production`, `APP_URL`).
- [ ] Configure production Neon PostgreSQL database branch.
- [ ] Execute Prisma production migrations (`prisma migrate deploy`).
- [ ] Run production seed script to populate IP categories and active questionnaire v1.
- [ ] Securely provision initial Bennett Hatchery CIE Admin and Reviewer accounts with temporary credentials requiring immediate rotation.
- [ ] Configure institutional domain and verify SSL/TLS certificate.
- [ ] Verify production security headers (CSP, HSTS, X-Content-Type-Options, X-Frame-Options).
- [ ] Perform comprehensive production smoke test:
  - Login as CIE Admin
  - Provision test startup
  - Login as Startup, complete assessment, submit
  - Login as Reviewer, review, request changes, resubmit, approve, set next review date
  - Verify CIE dashboard analytics update
  - Generate and inspect individual PDF and consolidated Excel exports
- [ ] Compile User Guide for Startups.
- [ ] Compile Administrator & Reviewer Operations Manual for Bennett Hatchery / CIE team.
- [ ] Conduct official institutional handover session with Bennett Hatchery leadership.

### Dependencies
- Phase 9 complete with all acceptance criteria satisfied.

### Expected Deliverables
- Live, operational production deployment on Vercel.
- Production Neon PostgreSQL database with applied schema and reference data.
- Initial CIE administrator accounts provisioned.
- Production deployment runbook and user documentation.
- Institutional handover sign-off.

### Acceptance Criteria
- Application is live and fully accessible on institutional domain.
- All three interfaces (`/startup`, `/cie`, `/cie/reviewer`) operational without errors.
- Role-based permissions work flawlessly in production.
- Reports generate and download properly in production runtime.
- Bennett Hatchery team trained and capable of operating the platform.

### Definition of Done
- Platform live in production, smoke tests verified, documentation delivered, institutional handover complete.

**Phase Status:** `[ ]` Not Started

