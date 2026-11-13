# Bennett Hatchery IPMS — Architectural Decision Records (ADRs)

**Document Version:** 1.0.0  
**Classification:** Technical Governance & Architectural Decisions  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University  
**Last Updated:** November 13, 2026

---

## Index of Architectural Decisions

- [ADR-001: Modular Monolithic Architecture with Next.js 16 App Router](#adr-001-modular-monolithic-architecture-with-nextjs-16-app-router)
- [ADR-002: Neon PostgreSQL with Prisma ORM](#adr-002-neon-postgresql-with-prisma-orm)
- [ADR-003: Custom Credentials Authentication with Argon2id and Database Sessions](#adr-003-custom-credentials-authentication-with-argon2id-and-database-sessions)
- [ADR-004: Exclusion of Cloud Object Storage in Release 1.0](#adr-004-exclusion-of-cloud-object-storage-in-release-10)
- [ADR-005: Exclusion of External Email Delivery Services in Release 1.0](#adr-005-exclusion-of-external-email-delivery-services-in-release-10)
- [ADR-006: Server-Side On-Demand Streaming for Reports](#adr-006-server-side-on-demand-streaming-for-reports)
- [ADR-007: Strict Assessment Immutability and Version Incrementing](#adr-007-strict-assessment-immutability-and-version-incrementing)
- [ADR-008: Server-Side Scoring with Formal Category Applicability Exclusion](#adr-008-server-side-scoring-with-formal-category-applicability-exclusion)
- [ADR-009: Portfolio Analytics Driven Exclusively by Latest Approved Assessment](#adr-009-portfolio-analytics-driven-exclusively-by-latest-approved-assessment)
- [ADR-010: Shared Review Queue with Transactional Review Records](#adr-010-shared-review-queue-with-transactional-review-records)

---

## ADR-001: Modular Monolithic Architecture with Next.js 16 App Router

### Status
Accepted

### Context
Bennett Hatchery needs an enterprise platform to manage IP assessments across incubated startups, CIE administration, and reviewers. The architectural choice lies between a distributed microservices setup (separate UI, Auth service, API gateway, scoring service) versus a modular monolithic Next.js application.

### Decision
We will develop the system as a **modular monolith** using Next.js 16 (App Router, Server Components, Route Handlers).

### Rationale
- **Development Velocity & Type Safety:** Single codebase enables end-to-end TypeScript sharing from database models to UI components.
- **Operational Simplicity:** Avoids managing multiple container registries, orchestration clusters (Kubernetes), API gateways, and distributed network latency.
- **Zero Cost Overhead:** Can be deployed effortlessly on Vercel without recurring infrastructure management overhead.
- **Modular Boundaries:** Clear separation of domain concerns inside `/src/services/*` allows future extraction of services if institutional scale requires it.

### Consequences
- **Positive:** Rapid development, atomic deployments, unified testing, zero inter-service network failure modes.
- **Negative:** Deployment updates release both frontend and backend together (acceptable for this institutional scope).

---

## ADR-002: Neon PostgreSQL with Prisma ORM

### Status
Accepted

### Context
The application requires a robust relational database with strong foreign key enforcement, ACID transactions (for assessment submission and reviewer approval), JSONB support for dynamic questionnaire configuration, and schema migrations.

### Decision
Adopt **Neon PostgreSQL** (managed serverless Postgres) as the primary database, interfaced via **Prisma ORM**.

### Rationale
- **ACID Transactions:** Critical for atomic state transitions (submission, scoring, review recording, review scheduling).
- **Prisma Type Safety:** Auto-generated TypeScript types prevent schema mismatch runtime bugs.
- **Connection Pooling:** Neon provides built-in pgBouncer pooling (`DATABASE_URL`), ensuring high connection resilience during serverless execution on Vercel.
- **Migrations:** Prisma migration engine guarantees reproducible schema states across development, staging, and production.

### Consequences
- **Positive:** Type-safe database queries, automated migration history, managed backups and point-in-time recovery.
- **Negative:** Requires separating pooled connection (`DATABASE_URL`) from direct connection (`DIRECT_URL`) for Prisma CLI schema migrations.

---

## ADR-003: Custom Credentials Authentication with Argon2id and Database Sessions

### Status
Accepted

### Context
The platform requires authentication for three user roles (`STARTUP`, `CIE_ADMIN`, `REVIEWER`). Third-party SaaS providers (Clerk, Supabase Auth, Auth0) introduce external monthly costs, data sovereignty concerns, and vendor lock-in.

### Decision
Implement a **custom credentials authentication system** utilizing:
1. **Argon2id** for password hashing.
2. **Database-backed sessions** storing SHA-256 hashed cryptographically random tokens.
3. **HTTP-only, Secure, SameSite=Lax cookies** for transport.
4. **No public user self-registration:** User accounts are provisioned exclusively by authorized CIE administrators or initial database seed scripts.

### Rationale
- **Data Sovereignty:** All credentials and sessions reside within the incubator's own PostgreSQL database.
- **Zero Ongoing Cost:** No per-user or monthly active user (MAU) SaaS subscription fees.
- **Immediate Revocability:** Database-backed sessions can be revoked instantaneously upon logout or account deactivation, unlike stateless JWTs.
- **Institutional Governance:** Controlled user provisioning aligns with Bennett Hatchery's incubation management policy.

### Consequences
- **Positive:** Full ownership of authentication logic, zero vendor dependence, auditable session lifecycles.
- **Negative:** Session validation requires a fast indexed database query on protected requests (mitigated by Neon connection pooling and database indexing).

---

## ADR-004: Exclusion of Cloud Object Storage in Release 1.0

### Status
Accepted

### Context
The initial PRD mentioned supporting document uploads for trademarks, patents, and copyrights. However, TRD §2.1 and §29 explicitly confirmed that external file storage (Cloudflare R2, AWS S3, Supabase Storage) is **out of scope** for Release 1.0 to minimize deployment complexity and operating cost.

### Decision
Exclude binary document storage from Release 1.0. Supporting document references in the questionnaire will be captured as structured metadata, text identifiers (e.g. Application Number, Registration Certificate Number, or institutional drive URLs) rather than binary file uploads.

### Rationale
- Removes the need to configure, secure, pay for, and maintain cloud object storage buckets.
- Eliminates file virus scanning, mime-type validation vulnerabilities, and pre-signed URL management overhead.
- Focuses initial release on the core business problem: structured IP questionnaire collection, dynamic maturity scoring, reviewer workflow, and portfolio analytics.

### Consequences
- **Positive:** Cleaner infrastructure, zero storage billing, faster development cycle.
- **Negative:** Startups cannot upload raw PDF certificates directly to the server; must provide registration/application numbers or shared drive links.

---

## ADR-005: Exclusion of External Email Delivery Services in Release 1.0

### Status
Accepted

### Context
PRD §11 suggested sending email notifications (via Resend) for submissions, approvals, and reminders. TRD §2.1 and §29 explicitly excluded external email providers from Release 1.0.

### Decision
Exclude Resend or external SMTP email services from Release 1.0. Institutional notifications and reminders will be delivered through:
1. In-app status badges on Startup and Reviewer dashboards.
2. Dedicated "Review Monitoring" dashboard tables highlighting reviews due in 7 days, 30 days, and overdue reviews.
3. Review queue status counters.

### Rationale
- Avoids external SaaS dependencies, API keys, domain DNS TXT/SPF/DKIM records configuration, and email deliverability maintenance.
- CIE team and reviewers operate directly within the daily dashboard where overdue reviews are surfaced prominently.

### Consequences
- **Positive:** Zero third-party email service dependency or delivery failure points.
- **Negative:** Users do not receive external emails in their inbox; must log in to view review reminders.

---

## ADR-006: Server-Side On-Demand Streaming for Reports

### Status
Accepted

### Context
The system must generate downloadable individual startup IP reports and consolidated CIE analytics reports in PDF and Excel formats. Storing generated report files on disk or cloud buckets consumes storage and creates orphaned file management challenges.

### Decision
Generate reports **server-side on demand** and stream binary payloads directly to the client HTTP response:
- PDF generation: `@react-pdf/renderer` in Node.js runtime.
- Excel generation: `ExcelJS` streaming workbook.
- Log report generation metadata in `ReportRecord` for audit compliance.

### Rationale
- Reports always reflect the exact current database state without caching stale files.
- Zero disk storage consumption or cleanup cron jobs needed.
- Direct HTTP response streaming with `Content-Disposition: attachment` delivers instant browser downloads.

### Consequences
- **Positive:** Stateless report generation, zero storage costs, guaranteed up-to-date data.
- **Negative:** Compute intensive on serverless functions during large consolidated exports (mitigated by bounded incubation cohort sizes < 1,000 startups).

---

## ADR-007: Strict Assessment Immutability and Version Incrementing

### Status
Accepted

### Context
In academic incubation, historical records of what a startup submitted and what an evaluator reviewed must be preserved for auditability and accreditation. Editing submitted assessments in-place destroys historical evidence.

### Decision
Enforce **strict immutability** on assessments once their status changes from `DRAFT` to `SUBMITTED`.
- An assessment in `SUBMITTED`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, or `REJECTED` cannot be modified.
- When changes are requested, a new version is created (`version = current_version + 1`) in `DRAFT` status with pre-populated responses from the previous version.
- The previous assessment version remains permanently in the database.

### Rationale
- Guarantees complete non-repudiation and auditability.
- Enables chronological comparative scoring (e.g. comparing V1 score vs V2 score).
- Protects reviewer remarks from being orphaned by modified answers.

### Consequences
- **Positive:** Complete institutional audit compliance and historical traceability.
- **Negative:** Additional rows in `IpAssessment` and `IpResponse` (minimal footprint in PostgreSQL).

---

## ADR-008: Server-Side Scoring with Formal Category Applicability Exclusion

### Status
Accepted

### Context
Startups operate across varied domains (e.g. pure SaaS startups may require Trademark and Copyright, but have no patentable physical or algorithmic invention). Penalizing a startup for having no patents when patents are not applicable would distort incubator metrics.

### Decision
1. All scores are calculated strictly **server-side**.
2. Startups declare category applicability with remarks; Reviewers formally verify and can override applicability.
3. Categories formally verified as `NOT_APPLICABLE` are **completely excluded** from the overall score denominator.
4. Individual question responses marked `NOT_APPLICABLE` are excluded from category score calculations.

### Rationale
- Fair, standardized evaluation that reflects true IP maturity relative to what the startup actually needs.
- Prevents startups from attempting to submit client-computed scores.

### Consequences
- **Positive:** Accurate, domain-appropriate IP maturity scoring without unfair penalties.
- **Negative:** Requires handling mathematical edge cases (e.g. when all categories are Not Applicable, overall score must safely default to 0.00 with appropriate flag).

---

## ADR-009: Portfolio Analytics Driven Exclusively by Latest Approved Assessment

### Status
Accepted

### Context
If multiple versions or unapproved drafts of a startup were counted in executive analytics, the portfolio metrics would be duplicated or skewed by unverified data.

### Decision
Official CIE portfolio metrics (Total Approved, Average IP Maturity Score, Category Progress Distributions) will query strictly the **latest approved assessment** per startup.
- Formula: For each registered startup, select the assessment where `status = 'APPROVED'` with `max(version)`.
- Drafts, pending submissions, and rejected assessments are tracked in separate operational monitoring widgets.

### Rationale
- Ensures administrative leadership sees only verified, authenticated data.
- Eliminates double-counting startups that undergo multiple annual or semi-annual review cycles.

### Consequences
- **Positive:** Executive analytics are 100% statistically accurate and audit-compliant.
- **Negative:** Requires subquery or window function (`ROW_NUMBER() OVER (PARTITION BY startup_id ORDER BY version DESC)`) in Prisma/SQL queries.

---

## ADR-010: Shared Review Queue with Transactional Review Records

### Status
Accepted

### Context
The CIE team includes designated reviewers who evaluate submitted startup assessments. The assignment model can either be rigid 1-to-1 pre-assignment by admin or an open shared queue with reviewer locking.

### Decision
Implement a **shared reviewer pool**:
1. All pending assessments (`SUBMITTED`, `RESUBMITTED`) appear in the centralized Review Queue visible to all reviewers.
2. When a reviewer begins evaluation, status transitions to `UNDER_REVIEW`.
3. When the reviewer executes a decision (Approve / Request Changes / Reject), the decision is wrapped in a PostgreSQL transaction that binds their `reviewerId` to the immutable `ReviewRecord`.

### Rationale
- Accommodates flexible team operations within Bennett Hatchery's small incubation staff.
- Prevents bottlenecks if an individual reviewer is unavailable.
- Fully records individual reviewer accountability upon decision creation.

### Consequences
- **Positive:** High operational flexibility, zero admin dispatch overhead, complete accountability upon action.
- **Negative:** Potential edge case of two reviewers viewing the same submission simultaneously (mitigated by optimistic concurrency checks on assessment status).

