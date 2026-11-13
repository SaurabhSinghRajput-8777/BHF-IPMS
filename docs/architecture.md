# Bennett Hatchery IPMS — System Architecture Specification

**Document Version:** 1.0.0  
**Classification:** Technical Architecture Specification  
**Application:** Bennett Hatchery Intellectual Property Management System (IPMS)  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University  
**Last Updated:** November 13, 2026

---

## 1. Architectural Overview & Context

The Bennett Hatchery Intellectual Property Management System (IPMS) is engineered as an enterprise-grade **modular monolith** running on Next.js 16 with TypeScript and a serverless Neon PostgreSQL database accessed via Prisma ORM.

### 1.1 Architectural Goals
1. **Institutional Reliability:** Continuous tracking of incubated startups' IP assets (Trademarks, Patents, Copyrights) across years of incubation cohorts.
2. **Strict Data Isolation:** Multi-tenant logical isolation between startups with zero cross-tenant leakage.
3. **Auditability & Non-Repudiation:** Immutability of submitted assessments, historical preservation of previous assessment versions, and comprehensive audit logs of all reviewer actions.
4. **Zero-Vendor Lock-in for Auth & Storage:** In-house credentials authentication (Argon2id + database sessions) and on-demand streaming document generation without dependence on external auth providers or cloud object storage.
5. **Deterministic Scoring:** Server-side mathematical scoring engine with formal handling of category applicability and reviewer overrides.

### 1.2 System Context Diagram

```text
                               ┌────────────────────────────────┐
                               │     Bennett University Users   │
                               └───────────────┬────────────────┘
                                               │ HTTPS
                                               ▼
                               ┌────────────────────────────────┐
                               │         Vercel Edge / CDN      │
                               │   (SSL Termination, Routing)   │
                               └───────────────┬────────────────┘
                                               │
                                               ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Next.js 16 Application Runtime (Modular Monolith)                                       │
│                                                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Presentation Layer (React 19 Server/Client Components + shadcn/ui + Tailwind CSS) │  │
│  │   • Startup Portal (/startup)                                                     │  │
│  │   • CIE Administration Dashboard (/cie)                                           │  │
│  │   • Reviewer Evaluation Workspace (/cie/reviewer)                                 │  │
│  │   • Authentication Shell (/login, /unauthorized)                                  │  │
│  └─────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                        │                                                │
│  ┌─────────────────────────────────────▼─────────────────────────────────────────────┐  │
│  │ Request Processing & Security Layer                                               │  │
│  │   • Next.js Middleware (Session validation & Route Protection)                    │  │
│  │   • RESTful Route Handlers (/api/v1/*)                                            │  │
│  │   • Input Validation (Zod Schemas)                                                │  │
│  │   • Cookie Management (HTTP-only, Secure, SameSite)                               │  │
│  └─────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                        │                                                │
│  ┌─────────────────────────────────────▼─────────────────────────────────────────────┐  │
│  │ Domain Service Layer (Pure Business Logic)                                        │  │
│  │   • AuthService                • QuestionnaireService   • ReviewerService         │  │
│  │   • StartupService            • AssessmentService      • AnalyticsService        │  │
│  │   • ScoringEngineService       • ReviewScheduleService  • ReportService           │  │
│  └─────────────────────────────────────┬─────────────────────────────────────────────┘  │
│                                        │                                                │
│  ┌─────────────────────────────────────▼─────────────────────────────────────────────┐  │
│  │ Data Access Layer (Prisma ORM)                                                    │  │
│  │   • Global Cached PrismaClient with connection pooling                            │  │
│  │   • Explicit multi-entity transactional isolation                                 │  │
│  └─────────────────────────────────────┬─────────────────────────────────────────────┘  │
└────────────────────────────────────────┼────────────────────────────────────────────────┘
                                         │ PostgreSQL Wire Protocol
                                         │ (pgbouncer pooled / direct)
                                         ▼
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ Neon PostgreSQL Managed Serverless Database                                             │
│   • Normalized relational schema                                                        │
│   • Immutable version tables                                                            │
│   • JSONB configurations for dynamic questions                                         │
│   • Complete audit trail & indexes                                                      │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Next.js 16 Application Architecture

### 2.1 Route Groups and Boundary Separation
Next.js 16 App Router uses route groups (parentheses) to enforce logical separation of concerns without altering URL segments:

- `src/app/(auth)/login`: Login interface, password resets, public auth views.
- `src/app/(startup)/startup/*`: Dedicated startup founder experience. Includes profile management, multi-step assessment forms, version history, and individual report downloads.
- `src/app/(cie)/cie/*`: Dedicated incubation management dashboard. Includes aggregate portfolio KPIs, category progress charts, searchable startup directory, and consolidated reporting.
- `src/app/(reviewer)/cie/reviewer/*`: Dedicated reviewer evaluation workspace. Includes the review queue, detailed assessment inspection, category remarks form, applicability confirmation, and review scheduling calendar.

### 2.2 Server Components vs. Client Components
- **Server Components (Default):** All page wrappers, data-fetching containers, analytics card layouts, and static layouts run as React Server Components (RSC) to maximize server execution speed and minimize client bundle size.
- **Client Components (`"use client"`):** Restricted strictly to interactive UI elements:
  - Dynamic multi-step questionnaire forms with conditional logic.
  - Interactive Recharts visualization wrappers.
  - Filter and search input fields with debounce.
  - Modals, popovers, and interactive dropdowns from shadcn/ui.

### 2.3 Layered Responsibility Pattern
To maintain enterprise maintainability and prevent business logic leaks into React components:
1. **Controllers/Route Handlers (`src/app/api/v1/*`):** Handle HTTP request parsing, Zod schema validation, invoking the appropriate service function, and formatting standardized HTTP responses.
2. **Domain Services (`src/services/*`):** Contain 100% of the business logic, calculations, workflow validations, and transactional boundaries. Completely decoupled from HTTP request/response objects.
3. **Data Access (`src/lib/prisma.ts`):** Single point of contact for Prisma operations.

---

## 3. Database Architecture & Data Models

### 3.1 Entity Relationship Diagram (ERD)

```text
 +--------------------------------------------------------------------------+
 |                                  USERS                                   |
 | id (PK), name, email (UQ), password_hash, role, is_active, created_at    |
 +-------------------+-----------------------+---------------------+--------+
                     |                       |                     |
          1:N        |            1:N        |          1:N        |
          +----------+                       |                     |
          |                                  |                     |
          ▼                                  ▼                     ▼
 +------------------+              +-------------------+ +------------------+
 |     SESSIONS     |              |    AUDIT_LOGS     | |  REVIEW_RECORDS  |
 | id (PK), user_id |              | id (PK), user_id  | | id (PK), user_id |
 | token_hash (UQ)  |              | action, entity    | | decision, remarks|
 | expires_at       |              +-------------------+ +--------+---------+
 +------------------+                                             |
                                                                  |
 +---------------------------------------------------------+      |
 |                        STARTUPS                         |      |
 | id (PK), startup_code (UQ), name, founder_name, email   |      |
 | contact_number, industry, startup_stage, description    |      |
 +---------+---------------------------------+-------------+      |
           |                                 |                    |
       1:N |                             1:N |                    |
           ▼                                 ▼                    |
 +--------------------+            +--------------------+         |
 |  STARTUP_MEMBERS   |            |   IP_ASSESSMENTS   |◄────────+
 | id (PK), startup_id|            | id (PK), startup_id|
 | user_id (UQ), role |            | questionnaire_id   |
 +--------------------+            | version (UQ: s,v)  |
                                   | status, submitted  |
                                   +----+----+----+-----+
                                        |    |    |
        +-------------------------------+    |    +-------------------------------+
        | 1:N                                | 1:N                                | 1:N
        ▼                                    ▼                                    ▼
 +---------------------+            +--------------------+             +--------------------+
 |    IP_RESPONSES     |            | ASSESSMENT_APPLIC. |             |     IP_SCORES      |
 | id (PK), assess_id  |            | id (PK), assess_id |             | id (PK), assess_id |
 | question_id, value  |            | category_id        |             | category_id (NULL) |
 | justification       |            | startup_applicable |             | score, applicable  |
 +----------▲----------+            | reviewer_applicable|             | scored_questions   |
            |                       +---------▲----------+             +---------▲----------+
            | 1:N                             |                                  |
            |                                 |                                  |
 +----------+----------+                      |                                  |
 |    IP_QUESTIONS     |                      |                                  |
 | id (PK), quest_id   |                      |                                  |
 | category_id, text   |                      |                                  |
 | type, scoring_config|                      |                                  |
 +----------▲----------+                      |                                  |
            |                                 |                                  |
            | N:1                             | N:1                              | N:1
 +----------+----------+            +---------+----------+                       |
 |  IP_QUESTIONNAIRES  |            |   IP_CATEGORIES    |───────────────────────+
 | id (PK), version    |            | id (PK), code (UQ) |
 | is_active, published|            | name (TM, PT, CR)  |
 +---------------------+            +--------------------+
```

### 3.2 Key Relational Rules & Integrity Constraints
1. **Assessment Compound Uniqueness:** `UNIQUE(startup_id, version)`. A startup can have version 1, 2, 3... but never two records with the same version number.
2. **Response Compound Uniqueness:** `UNIQUE(assessment_id, question_id)`. Prevents duplicate answers within the same assessment.
3. **Applicability Compound Uniqueness:** `UNIQUE(assessment_id, category_id)`. Exactly one applicability declaration per category per assessment.
4. **Startup Member Association:** `UNIQUE(user_id)`. Each startup user belongs strictly to one startup in v1.
5. **Questionnaire Publication Immutability:** Once an `IpQuestionnaire` has `is_active = true` and `published_at` is set, question definitions cannot be mutated. Any change necessitates a new questionnaire version (`version + 1`).

---

## 4. Authentication & Session Security Lifecycle

Rather than delegating identity to third-party services (Clerk, Supabase, Auth0), the IPMS implements a self-hosted, cryptographically sound credentials authentication engine.

### 4.1 Password Hashing via Argon2id
- Algorithm: **Argon2id** (winner of the Password Hashing Competition, recommended by OWASP).
- Library: `argon2` npm package with native bindings.
- Parameters:
  - Memory Cost: 65,536 KiB (64 MiB)
  - Time Cost: 3 iterations
  - Parallelism: 1 thread
  - Hash Length: 32 bytes

### 4.2 Database-Backed Session Flow
```text
Client (Browser)                API Handler                    Database (Neon)
      │                              │                               │
      │ 1. POST /auth/login          │                               │
      │    (email, password)         │                               │
      ├─────────────────────────────>│                               │
      │                              │ 2. Find user by email         │
      │                              ├──────────────────────────────>│
      │                              │<──────────────────────────────┤
      │                              │                               │
      │                              │ 3. argon2.verify(hash, pass)  │
      │                              │    If invalid: Return 401     │
      │                              │                               │
      │                              │ 4. Generate random token      │
      │                              │    crypto.randomBytes(32)     │
      │                              │                               │
      │                              │ 5. SHA-256(token)             │
      │                              │ 6. INSERT session record      │
      │                              ├──────────────────────────────>│
      │                              │<──────────────────────────────┤
      │                              │                               │
      │ 7. Set-Cookie: bhf_session   │                               │
      │    (Raw Token, HttpOnly,     │                               │
      │     Secure, SameSite=Lax)    │                               │
      │<─────────────────────────────┤                               │
```

### 4.3 Session Validation on Protected Requests
1. Next.js middleware or route handler extracts `bhf_ipms_session` cookie.
2. Computes SHA-256 hash of the cookie value: `tokenHash = createHash('sha256').update(cookieToken).digest('hex')`.
3. Performs indexed database lookup:
   ```prisma
   prisma.session.findUnique({
     where: { tokenHash },
     include: { user: { include: { startupMembership: true } } }
   })
   ```
4. If session not found or `expiresAt < now()` or `user.isActive == false`:
   - Delete cookie.
   - Reject request with 401 Unauthorized or redirect to `/login`.
5. If valid, attaches user context (`id`, `role`, `startupId`) to request context.

---

## 5. Role-Based Access Control (RBAC) & Tenant Isolation

### 5.1 Roles Definition
- `STARTUP`: Founder or representative of an incubated startup.
- `CIE_ADMIN`: Administrative manager of Bennett Hatchery / CIE.
- `REVIEWER`: Designated IP evaluator / reviewer.

### 5.2 Server-Side Authorization Matrix

| Operation | Route / Endpoint | STARTUP | CIE_ADMIN | REVIEWER |
|---|---|---|---|---|
| View own profile | `GET /api/v1/startups/me` | Allowed (Own) | Denied | Denied |
| Update own profile | `PUT /api/v1/startups/me` | Allowed (Own) | Denied | Denied |
| View all startups | `GET /api/v1/cie/startups` | **Denied** | Allowed | Allowed (Queue) |
| Create draft assessment | `POST /api/v1/assessments` | Allowed (Own) | Denied | Denied |
| Edit draft assessment | `PUT /api/v1/assessments/:id` | Allowed (Draft/Own) | Denied | Denied |
| Submit assessment | `POST /api/v1/assessments/:id/submit`| Allowed (Own) | Denied | Denied |
| View Review Queue | `GET /api/v1/reviewer/queue` | **Denied** | Allowed | Allowed |
| Save Reviewer Remarks | `POST /api/v1/reviewer/assessments/:id/remarks` | **Denied** | Denied | Allowed |
| Approve Assessment | `POST /api/v1/reviewer/assessments/:id/approve` | **Denied** | Denied | Allowed |
| Request Changes | `POST /api/v1/reviewer/assessments/:id/request-changes` | **Denied** | Denied | Allowed |
| Reject Assessment | `POST /api/v1/reviewer/assessments/:id/reject` | **Denied** | Denied | Allowed |
| View CIE Portfolio Analytics | `GET /api/v1/cie/analytics/*` | **Denied** | Allowed | Limited |
| Download Startup PDF | `GET /api/v1/assessments/:id/report` | Allowed (Approved/Own) | Allowed | Allowed |
| Export Consolidated Excel | `GET /api/v1/cie/reports/analytics` | **Denied** | Allowed | Denied |
| User Provisioning | `POST /api/v1/cie/users` | **Denied** | Allowed | Denied |

### 5.3 Tenant Isolation Guarantee
For any startup request targeting `assessmentId` or `startupId`:
- The service extracts `user.startupMembership.startupId` from the verified session.
- The SQL query joins `IpAssessment.startupId == userStartupId`.
- Even if an attacker guesses another startup's UUID, the database query returns `null`, resulting in a safe `404 Not Found` or `403 Forbidden`.

---

## 6. Assessment Versioning & State Transition Engine

### 6.1 State Machine Diagram

```text
               ┌─────────────┐
               │    DRAFT    │◄─────────────────────────────┐
               └──────┬──────┘                              │
                      │                                     │
                      │ Startup Submits                     │ Startup Resubmits
                      ▼                                     │ (Clones into V+1)
               ┌─────────────┐                              │
               │  SUBMITTED  │                              │
               └──────┬──────┘                              │
                      │                                     │
                      │ Reviewer Opens                      │
                      ▼                                     │
               ┌─────────────┐                              │
               │UNDER_REVIEW │                              │
               └──────┬──────┘                              │
                      │                                     │
         ┌────────────┼────────────────────────┐            │
         │            │                        │            │
         │ Approve    │ Reject                 │ Changes    │
         │            │                        │ Requested  │
         ▼            ▼                        ▼            │
   ┌───────────┐ ┌───────────┐       ┌───────────────────┐  │
   │ APPROVED  │ │ REJECTED  │       │ CHANGES_REQUESTED ├──┘
   └───────────┘ └───────────┘       └───────────────────┘
```

### 6.2 Resubmission Protocol
1. An assessment in `CHANGES_REQUESTED` is locked against further edits to preserve the exact audit state that the reviewer saw.
2. When the startup founder initiates a resubmission, the system executes a transaction:
   - Queries `max(version)` for the startup (e.g. `1`).
   - Creates a new `IpAssessment` with `version = 2` and status `DRAFT`.
   - Clones all responses from Version 1 into Version 2 as initial draft values.
   - Clones category applicability declarations.
   - Links the new draft to the startup.
3. The startup edits the updated questions, addresses reviewer remarks, and submits Version 2.
4. Version 1 remains permanently in the database with status `CHANGES_REQUESTED` and its attached `ReviewRecord`.

---

## 7. IP Scoring Engine & Mathematical Models

### 7.1 Response Value Scoring Weights
Each question response option maps to a normalized numeric score:

| Response Value | Meaning | Point Value | Inclusion in Calculation |
|---|---|---|---|
| `YES` | Fully implemented / filed / registered | 100 | Included in numerator & denominator |
| `APPLIED` | Application submitted / in progress | 50 | Included in numerator & denominator |
| `NO` | Not initiated / not protected | 0 | Included in numerator & denominator |
| `NOT_APPLICABLE` | Not relevant to startup technology | N/A | **Excluded** from numerator & denominator |
| `NOT_SURE` | Requires reviewer clarification | 0 | Included in denominator (provisional score) |

### 7.2 Category Score Calculation
Let $C$ be an IP category ($C \in \{\text{TRADEMARK}, \text{PATENT}, \text{COPYRIGHT}\}$).  
Let $Q_C$ be the set of questions belonging to category $C$.  
Let $A_C \subseteq Q_C$ be the set of applicable questions where $\text{response}(q) \neq \text{NOT\_APPLICABLE}$.

$$\text{Category Score}(C) = 
\begin{cases} 
\frac{\sum_{q \in A_C} \text{score}(q)}{|A_C|} & \text{if } |A_C| > 0 \\
\text{EXCLUDED} & \text{if } |A_C| = 0 \text{ or category verified Not Applicable}
\end{cases}$$

### 7.3 Overall IP Maturity Score Calculation
Let $\mathcal{C}_{\text{app}}$ be the set of categories that are verified as applicable for the startup ($\mathcal{C}_{\text{app}} \subseteq \{\text{TRADEMARK}, \text{PATENT}, \text{COPYRIGHT}\}$).

$$\text{Overall Score} = 
\begin{cases}
\frac{\sum_{C \in \mathcal{C}_{\text{app}}} \text{Category Score}(C)}{|\mathcal{C}_{\text{app}}|} & \text{if } |\mathcal{C}_{\text{app}}| > 0 \\
0.00 & \text{if } |\mathcal{C}_{\text{app}}| = 0 \quad (\text{Flag: NO\_APPLICABLE\_IP})
\end{cases}$$

### 7.4 Score Classification Tiers
- **0.00 – 20.00:** Initial (Basic awareness, no formal protection)
- **20.01 – 40.00:** Developing (Early searches or drafting in progress)
- **40.01 – 60.00:** Intermediate (Applications submitted, formal documentation maintained)
- **60.01 – 80.00:** Advanced (Registered trademarks/copyrights, patent applications published)
- **80.01 – 100.00:** Strong IP Readiness (Granted patents, multi-class trademarks, robust IP assignment)

---

## 8. Portfolio Analytics & Reporting Pipeline

### 8.1 The "Latest Approved Assessment" Rule
To prevent statistical distortion:
1. **Official Incubation KPIs:**
   - Only assessments where `status == 'APPROVED'` are considered official.
   - For any startup with multiple approved versions (e.g. V1 approved in January, V2 approved in July), only the **highest version approved assessment** is included in current portfolio averages.
   - Submissions in `DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, or `REJECTED` are displayed strictly in operational queues, never inside the maturity average.
2. **Historical Trend Analysis:**
   - Approved assessments are grouped by `approvedAt` month/quarter to compute historical cohort progress and growth over time.

### 8.2 Reporting Pipeline
1. **Individual Startup Report (PDF):**
   - Implemented via `@react-pdf/renderer`.
   - Node.js runtime creates a readable stream of binary PDF data directly to the client response headers:
     `Content-Type: application/pdf`  
     `Content-Disposition: attachment; filename="BHF-IP-Report-BH-2026-001-V2.pdf"`
   - Zero temporary disk files created.
2. **Consolidated Portfolio Analytics Report (PDF & Excel):**
   - PDF: Formatted executive briefing summarizing KPIs, distributions, and review status.
   - Excel (`.xlsx`): Generated via `ExcelJS` containing multiple formatted tabs (Executive Summary, Startup Directory, Category Breakdown, Review Schedules).

---

## 9. Security, Auditing & Operational Governance

### 9.1 Data Protection Principles
- **No Plaintext Passwords:** Argon2id with 64MB memory cost.
- **No Plaintext Session Tokens:** Database stores SHA-256 hash of tokens.
- **Strict HTTPS:** Enforced via Vercel edge rules and HSTS headers.
- **CSRF Defense:** Cookie attributes `SameSite=Lax`, custom origin validation on mutations.
- **SQL Injection Defense:** 100% parameterized queries via Prisma ORM.

### 9.2 Comprehensive Audit Logging
The `AuditLog` table records all state-altering operations:
- `user_id`: Acting user.
- `action`: E.g. `ASSESSMENT_SUBMITTED`, `ASSESSMENT_APPROVED`, `SCORE_OVERRIDDEN`, `USER_PROVISIONED`.
- `entity_type`: E.g. `IpAssessment`, `Startup`, `User`.
- `entity_id`: UUID of the affected entity.
- `old_values`: JSONB snapshot of previous state.
- `new_values`: JSONB snapshot of updated state.
- `ip_address`: Client IP recorded from request headers.
- `created_at`: UTC timestamp.

---

## 10. Deployment & Infrastructure Architecture

- **Hosting Platform:** Vercel (Edge network + Node.js Serverless Functions).
- **Database:** Neon PostgreSQL Serverless.
  - Connection pooling enabled for runtime queries (`DATABASE_URL`).
  - Direct connection string (`DIRECT_URL`) configured for Prisma migrations.
- **Continuous Integration / Continuous Deployment:**
  - GitHub feature branch $\to$ Pull Request $\to$ Vercel Preview Deployment.
  - Merge to `main` $\to$ Automated Prisma migration $\to$ Vercel Production Deployment.

