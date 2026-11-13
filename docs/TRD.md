# Bennett Hatchery – Intellectual Property Management System (IPMS)
# Technical Requirements Document (TRD) & Database Schema

**Version:** 1.0  
**Status:** Technical Draft  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship, Bennett University  
**Application Type:** Web-Based Application  
**Architecture:** Modular Monolith  
**Database:** Neon PostgreSQL  
**ORM:** Prisma  
**Frontend & Backend:** Next.js 16 + TypeScript

---

# PART A: TECHNICAL REQUIREMENTS DOCUMENT (TRD)

## 1. Technical Overview

The Intellectual Property Management System (IPMS) will be developed as a centralized web application for managing, assessing, reviewing, and monitoring the intellectual property progress of startups incubated under Bennett Hatchery.

The application will provide three role-based interfaces:

1. Startup Portal
2. CIE Administration Dashboard
3. CIE Reviewer Dashboard

The application will follow a modular monolithic architecture, where the frontend, backend APIs, business logic, authentication, and authorization are maintained within a single Next.js application.

A centralized PostgreSQL database hosted on Neon will store startup information, assessment responses, calculated scores, reviewer remarks, approval records, review schedules, and audit logs.

### 1.1 Technical Objectives

- Implement a secure, role-based web application.
- Maintain centralized startup and IP assessment records.
- Provide a configurable questionnaire system.
- Implement an automated IP scoring engine.
- Support multiple assessment versions.
- Implement reviewer approval workflows.
- Provide real-time dashboard analytics through database queries.
- Generate individual and consolidated PDF/Excel reports.
- Maintain a complete audit trail.
- Minimize external infrastructure dependencies.

---

## 2. Technology Stack

| Layer | Technology | Responsibility |
|---|---|---|
| Frontend | Next.js 16 | Application UI |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS | UI styling |
| Components | shadcn/ui | Reusable UI components |
| Backend | Next.js Route Handlers | REST APIs |
| Database | Neon PostgreSQL | Persistent data |
| ORM | Prisma | Database access |
| Authentication | Custom credentials authentication | Login and sessions |
| Password Hashing | Argon2id | Password security |
| Authorization | RBAC | Access control |
| Session Management | HTTP-only cookies | Secure sessions |
| Charts | Recharts | Analytics visualization |
| PDF | React PDF | Individual and consolidated reports |
| Excel | ExcelJS | Analytics export |
| Hosting | Vercel | Application deployment |
| Version Control | GitHub | Source code management |

### 2.1 Infrastructure Scope

The initial implementation will not require:

- Supabase.
- Clerk or Auth.js.
- Cloudflare R2.
- Resend or external email services.
- Redis.
- Kubernetes.
- Separate Express/NestJS backend.
- Microservices.
- External document storage.

The application will operate using Next.js, Neon PostgreSQL, and Vercel.

---

## 3. System Architecture

### 3.1 Architecture Pattern

The application will follow a modular monolithic architecture.

The codebase will be divided into independent functional modules while sharing the same application runtime and database.

### 3.2 High-Level Architecture

```text
                   USERS
                     |
        +------------+------------+
        |            |            |
     STARTUP       CIE TEAM     REVIEWER
        |            |            |
        +------------+------------+
                     |
              NEXT.JS FRONTEND
                     |
              NEXT.JS BACKEND
                     |
        +------------+------------+
        |            |            |
    AUTH MODULE  BUSINESS LOGIC  REPORTS
        |            |            |
        +------------+------------+
                     |
                PRISMA ORM
                     |
               NEON POSTGRES
```

### 3.3 Application Modules

The backend must be organized into the following logical modules:

| Module | Responsibility |
|---|---|
| Authentication | Login, logout, session validation |
| Authorization | Role and permission verification |
| Startup Management | Startup profile management |
| Questionnaire | Question and category management |
| Assessment | Assessment creation and submission |
| Scoring Engine | Score calculation and classification |
| Reviewer | Assessment verification and approval |
| Analytics | CIE dashboard statistics |
| Scheduling | Next review dates and review monitoring |
| Reporting | PDF and Excel generation |
| Audit | Activity and change tracking |

---

## 4. Application Routing Structure

The application will use Next.js App Router.

### 4.1 Public Routes

| Route | Purpose |
|---|---|
| `/login` | User login |
| `/unauthorized` | Unauthorized access |
| `/` | Redirect based on authenticated role |

Public registration will not be enabled.

### 4.2 Startup Routes

```text
/startup
/startup/dashboard
/startup/profile
/startup/assessment
/startup/assessment/new
/startup/assessment/[assessmentId]
/startup/history
/startup/reports
/startup/settings
```

### 4.3 CIE Team Routes

```text
/cie
/cie/dashboard
/cie/startups
/cie/startups/[startupId]
/cie/assessments
/cie/analytics
/cie/reviews
/cie/reports
/cie/settings
/cie/users
```

### 4.4 Reviewer Routes

```text
/cie/reviewer
/cie/reviewer/dashboard
/cie/reviewer/queue
/cie/reviewer/assessments/[assessmentId]
/cie/reviewer/history
/cie/reviewer/calendar
```

### 4.5 Route Protection

Every protected route must validate:

1. Whether the user is authenticated.
2. Whether the session is valid.
3. Whether the account is active.
4. Whether the user has the required role.
5. Whether the user is authorized to access the requested resource.

Frontend route protection must be supplemented by server-side authorization.

---

## 5. Authentication and Authorization

### 5.1 Authentication Strategy

A simple database-backed credentials authentication system will be implemented.

There will be no public signup.

User accounts will be created through a protected administrative provisioning mechanism.

### 5.2 Login Process

1. User enters email and password.
2. Backend retrieves the user record.
3. Password is verified against the stored Argon2id hash.
4. If valid, the backend generates a cryptographically secure random session token.
5. Only the hash of the session token is stored in the database.
6. The original token is placed in an HTTP-only cookie.
7. The backend validates the session on protected requests.

### 5.3 Session Requirements

- HTTP-only cookies.
- Secure cookies in production.
- SameSite=Lax or stricter where compatible.
- Session expiration.
- Session revocation on logout.
- Session invalidation when an account is disabled.
- Login rate limiting.
- Password reset through a controlled administrative process.

Suggested initial session duration: 7 days.

### 5.4 User Roles

```text
STARTUP
CIE_ADMIN
REVIEWER
```

### 5.5 Role Permissions

| Permission | Startup | CIE Admin | Reviewer |
|---|---|---|---|
| View own profile | Yes | Yes | Yes |
| View all startups | No | Yes | Assigned |
| Create assessment | Yes | No | No |
| Edit draft assessment | Yes | No | No |
| Submit assessment | Yes | No | No |
| View own assessment history | Yes | Yes | Assigned |
| Review assessment | No | No | Yes |
| Approve assessment | No | No | Yes |
| Request changes | No | No | Yes |
| Reject assessment | No | No | Yes |
| View analytics | No | Yes | Limited |
| Generate startup report | Own | All | Assigned |
| Generate consolidated report | No | Yes | No |
| Manage users | No | Authorized Admin | No |

### 5.6 CIE Team User Management

The initial system will support four CIE team accounts.

- Accounts will be created manually.
- No public account registration will be available.
- Each user will have an assigned role.
- CIE administrators can provision authorized user accounts.
- User deactivation must immediately prevent future access.
- User actions must be recorded in audit logs.

The four-person restriction should initially be a configurable administrative limit, not a hardcoded database constraint.

---

## 6. Startup Management Module

### 6.1 Startup Profile

Each startup must have a unique profile.

Required information:

- Startup ID.
- Startup Name.
- Founder Name.
- Co-founder Details.
- Official Email.
- Contact Number.
- Website.
- Industry.
- Startup Stage.
- Incorporation Date.
- Registration Number.
- Startup Description.
- Product/Service Description.
- Created Date.
- Updated Date.

### 6.2 Startup ID Generation

Suggested format:

```text
BH-2026-001
BH-2026-002
BH-2026-003
```

The identifier must be unique and immutable.

### 6.3 Startup Data Access

- Startups can access only their own profiles.
- CIE administrators can access all startup profiles.
- Reviewers can access assigned startup profiles.
- All modifications must be timestamped.
- Important changes must be auditable.

---

## 7. Questionnaire Management Module

### 7.1 Questionnaire Structure

The questionnaire will consist of four sections:

1. General IP Information.
2. Trademark.
3. Patent.
4. Copyright.

### 7.2 Question Attributes

Every question must support:

- Question ID.
- Question Text.
- Description.
- Category.
- Question Type.
- Response Options.
- Score Mapping.
- Required/Optional Flag.
- Display Order.
- Active/Inactive Status.
- Conditional Display Rules.
- Applicable Assessment Version.

### 7.3 Response Types

The initial questionnaire will support:

```text
YES
NO
APPLIED
NOT_APPLICABLE
NOT_SURE
```

### 7.4 Conditional Logic

Examples:

- If Patent Filed = Yes, display patent application details.
- If Trademark Registered = Yes, display registration information.
- If Software Developed = Yes, display relevant copyright questions.
- If Not Applicable is selected, allow the startup to enter a justification.

### 7.5 Configurability

Questions and score mappings should be configurable.

Changing a question must not alter historical assessment records.

Each questionnaire must have a version.

Submitted assessments must retain the questionnaire version against which they were created.

---

## 8. Assessment Management Module

### 8.1 Assessment Lifecycle

```text
DRAFT
  |
  v
SUBMITTED
  |
  v
UNDER_REVIEW
  |
  +--------------------+
  |                    |
  v                    v
APPROVED         CHANGES_REQUESTED
                       |
                       v
                   RESUBMITTED
                       |
                       v
                   UNDER_REVIEW
                       |
              +--------+--------+
              |                 |
              v                 v
           APPROVED          REJECTED
```

### 8.2 Assessment Requirements

- Every assessment must have a unique ID.
- Every assessment must belong to one startup.
- Every assessment must have a version number.
- A startup must be able to save a draft.
- A startup must be able to submit an assessment.
- Submitted assessments must become read-only.
- Changes requested must allow a new revision.
- Previous submissions must remain preserved.
- Submission date must be automatically generated.
- Approval date must be generated on approval.
- Reviewer identity must be recorded.

### 8.3 Assessment Versioning

Example:

```text
Startup: BH-2026-001

Assessment V1
    |
    | Changes Requested
    |
Assessment V2
    |
    | Approved
    |
Assessment V2 becomes the latest approved assessment
```

The system must never silently overwrite a previously submitted assessment.

A new version must be created when a startup resubmits after requested modifications.

---

## 9. IP Scoring Engine

### 9.1 Initial Scoring Mapping

| Response | Score |
|---|---:|
| YES | 100 |
| APPLIED | 50 |
| NO | 0 |
| NOT_APPLICABLE | Excluded |
| NOT_SURE | Unscored pending verification |

The scoring configuration must be maintained in the database.

### 9.2 Category Scoring

```text
Category Score =
Sum of Applicable Question Scores
/
Number of Applicable Questions
```

The result must be represented as a percentage.

### 9.3 Overall Scoring

```text
Overall IP Score =
Sum of Applicable Category Scores
/
Number of Applicable Categories
```

The system must exclude categories that have been formally verified as Not Applicable.

### 9.4 Score Classification

| Score | Classification |
|---|---|
| 0–20 | Initial |
| 21–40 | Developing |
| 41–60 | Intermediate |
| 61–80 | Advanced |
| 81–100 | Strong IP Readiness |

### 9.5 Scoring Requirements

- All calculations must occur server-side.
- Frontend-calculated values must never be trusted.
- Score mappings must be configurable.
- Category scores must be stored separately.
- Overall scores must be stored separately.
- Every score must be linked to an assessment version.
- Reviewer overrides must require a justification.
- Historical scores must remain unchanged.

The score must represent IP maturity and progress, not legal eligibility or certification.

---

## 10. Reviewer Management Module

### 10.1 Reviewer Queue

The reviewer dashboard must display:

- Assessment ID.
- Startup Name.
- Submission Date.
- Current Status.
- Calculated Score.
- Assigned Reviewer.
- Review Priority.

### 10.2 Reviewer Actions

The reviewer must be able to:

- View complete startup information.
- View all questionnaire responses.
- View category-wise scores.
- Add general remarks.
- Add category-specific remarks.
- Request changes.
- Approve assessments.
- Reject assessments.
- Set next review dates.

### 10.3 Approval Conditions

An assessment cannot be approved unless:

- Mandatory information is complete.
- Required applicability decisions are verified.
- All required reviewer checks are completed.
- A next review date is specified.
- Reviewer remarks are recorded where required.

### 10.4 Review Records

Every reviewer action must create an immutable review record.

The record must contain:

- Assessment ID.
- Reviewer ID.
- Decision.
- Remarks.
- Review Timestamp.
- Previous Status.
- New Status.

---

## 11. Review Scheduling Module

The reviewer must be able to schedule the next review.

### 11.1 Review Information

- Startup ID.
- Assessment ID.
- Scheduled Review Date.
- Review Status.
- Reviewer ID.
- Created Date.
- Completed Date.

### 11.2 Review Status

```text
SCHEDULED
COMPLETED
OVERDUE
CANCELLED
```

Overdue status may be calculated from the scheduled date and current status rather than requiring manual database updates.

### 11.3 Dashboard Integration

The system must show:

- Upcoming reviews.
- Reviews due within seven days.
- Reviews due within thirty days.
- Overdue reviews.
- Completed reviews.

The next review date must appear in the startup dashboard, reviewer dashboard, and individual report.

---

## 12. CIE Analytics Module

### 12.1 Dashboard KPIs

The CIE dashboard must display:

- Total Startups.
- Total Submitted Assessments.
- Total Approved Assessments.
- Pending Assessments.
- Assessments Requiring Changes.
- Average IP Score.
- Trademark Progress.
- Patent Progress.
- Copyright Progress.
- Upcoming Reviews.
- Overdue Reviews.

### 12.2 Analytics

The system must support:

1. Startup-wise IP performance.
2. Trademark application and registration distribution.
3. Patent application and grant distribution.
4. Copyright documentation and registration distribution.
5. Overall IP maturity distribution.
6. Monthly assessment submissions.
7. Monthly assessment approvals.
8. Historical score comparisons.
9. Review completion statistics.

### 12.3 Analytics Rules

- Only the latest approved assessment per startup should contribute to current official portfolio metrics.
- Pending assessments must be displayed separately.
- Rejected assessments must not be counted as approved.
- Historical approved assessments must remain available for trends.
- Not Applicable categories must be excluded from applicable score averages.
- Dashboard calculations must be performed using server-side database queries.

---

## 13. Reporting Module

### 13.1 Individual Startup Report

The system must generate an individual startup IP report in PDF format.

Report contents:

- Bennett Hatchery branding.
- Report ID.
- Startup ID.
- Startup Name.
- Startup Information.
- Assessment Version.
- Submission Date.
- Approval Date.
- Reviewer Information.
- Overall IP Score.
- Trademark Score.
- Patent Score.
- Copyright Score.
- Questionnaire Responses.
- Reviewer Remarks.
- Recommended Actions.
- Next Review Date.
- Report Generation Date.

### 13.2 Consolidated CIE Report

The CIE team must be able to generate:

- Total startup statistics.
- Category-wise statistics.
- Overall score distribution.
- Startup-wise performance.
- Assessment status distribution.
- Monthly trends.
- Upcoming reviews.
- Overdue reviews.

### 13.3 Export Formats

- PDF for individual and consolidated reports.
- Excel (.xlsx) for consolidated analytics.

### 13.4 Reporting Rules

- Reports must be generated server-side.
- Reports must contain the source assessment version.
- Reports must display accurate timestamps.
- Only approved reports may be labelled as approved.
- Report generation must be logged.
- Report generation must not modify assessment records.

---

## 14. API Architecture

All APIs must follow REST conventions.

Base URL:

```text
/api/v1
```

### 14.1 Authentication APIs

| Method | Endpoint | Purpose |
|---|---|---|
| POST | /auth/login | Authenticate user |
| POST | /auth/logout | End session |
| GET | /auth/me | Get authenticated user |
| POST | /auth/change-password | Change password |

### 14.2 Startup APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /startups/me | Get startup profile |
| PUT | /startups/me | Update startup profile |
| GET | /startups/me/assessments | Get assessment history |
| GET | /startups/me/reports | Get available reports |

### 14.3 Assessment APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /questionnaires/active | Get active questionnaire |
| POST | /assessments | Create draft |
| GET | /assessments/:id | Get assessment |
| PUT | /assessments/:id | Update draft |
| POST | /assessments/:id/submit | Submit assessment |
| GET | /assessments/:id/score | Get calculated score |

### 14.4 Reviewer APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /reviewer/queue | Get review queue |
| GET | /reviewer/assessments/:id | Get assessment |
| POST | /reviewer/assessments/:id/remarks | Add remarks |
| POST | /reviewer/assessments/:id/approve | Approve assessment |
| POST | /reviewer/assessments/:id/request-changes | Request changes |
| POST | /reviewer/assessments/:id/reject | Reject assessment |
| POST | /reviewer/assessments/:id/schedule | Schedule review |
| GET | /reviewer/history | Get review history |

### 14.5 CIE APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /cie/startups | Get all startups |
| GET | /cie/startups/:id | Get startup details |
| GET | /cie/analytics/overview | Dashboard overview |
| GET | /cie/analytics/categories | Category analytics |
| GET | /cie/analytics/trends | Historical trends |
| GET | /cie/reviews/upcoming | Upcoming reviews |
| GET | /cie/reports/analytics | Generate consolidated report |

### 14.6 User Management APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /cie/users | List users |
| POST | /cie/users | Create user |
| PATCH | /cie/users/:id | Update user |
| PATCH | /cie/users/:id/status | Activate/deactivate user |

All endpoints must implement authentication, authorization, validation, and appropriate error handling.

---

## 15. Database and ORM Requirements

### 15.1 Database

Neon PostgreSQL will be used as the primary relational database.

Recommended region: Mumbai (ap-south-1), subject to institutional approval and provider availability.

### 15.2 ORM

Prisma will manage:

- Database models.
- Migrations.
- Relationships.
- Query operations.
- Transactions.
- Type-safe database access.

### 15.3 Connection Management

- Use Neon's pooled connection string for application runtime.
- Use the direct connection string for Prisma migrations where required.
- Store connection strings in environment variables.
- Never expose database credentials to frontend code.
- Use transactions for critical multi-table operations.

### 15.4 Data Integrity

- Use foreign keys.
- Use unique constraints.
- Use appropriate indexes.
- Use database transactions for approvals and submissions.
- Preserve historical records.
- Prevent unauthorized updates.

---

## 16. Security Requirements

### 16.1 Authentication Security

- Passwords must be hashed using Argon2id.
- Plaintext passwords must never be stored.
- Session tokens must be generated using cryptographically secure randomness.
- Session tokens must be stored hashed in the database.
- Cookies must be HTTP-only and Secure in production.
- Login attempts must be rate-limited.
- Disabled users must not be able to authenticate.

### 16.2 Authorization Security

- Every protected API must perform server-side role validation.
- Startup users must only access their own data.
- Reviewer access must be limited to authorized assessments.
- CIE administrators may access organization-wide records.
- Sensitive administrative actions must be logged.

### 16.3 Data Security

- Use HTTPS.
- Validate and sanitize incoming data.
- Prevent SQL injection through parameterized ORM queries.
- Protect against XSS.
- Apply CSRF protection where applicable.
- Prevent mass-assignment vulnerabilities.
- Avoid exposing internal database errors.
- Do not expose secrets in client-side environment variables.

### 16.4 Audit Logging

The following actions must be logged:

- Login and logout.
- Account creation and deactivation.
- Startup profile updates.
- Assessment creation.
- Assessment submission.
- Assessment resubmission.
- Reviewer remarks.
- Approval.
- Rejection.
- Review scheduling.
- Score overrides.
- Report generation.

---

## 17. Performance and Reliability

| Requirement | Target |
|---|---|
| Standard page loading | Within 3 seconds under normal load |
| Dashboard API | Within 2 seconds under normal load |
| Assessment submission | Reliable transactional completion |
| Authentication | Secure session validation |
| Database | Connection pooling enabled |
| Application availability | Target 99.5% monthly |
| Data integrity | No silent assessment overwrites |
| Scalability | Support growth in startup and assessment records |

Performance targets are initial engineering objectives and must be validated through testing.

---

## 18. Environment Configuration

Three environments must be maintained.

| Environment | Purpose |
|---|---|
| Development | Local development |
| Staging | Testing and CIE UAT |
| Production | Live application |

### Environment Variables

```env
DATABASE_URL=
DIRECT_URL=

APP_URL=
NODE_ENV=

SESSION_SECRET=
```

Additional configuration may include:

```env
SESSION_MAX_AGE=
RATE_LIMIT_MAX_ATTEMPTS=
```

All environment variables must be stored securely.

No credentials must be committed to GitHub.

---

## 19. Deployment Architecture

### Hosting

- Frontend and backend: Vercel.
- Database: Neon PostgreSQL.
- Source code: GitHub.

### Deployment Process

1. Developer pushes code to GitHub.
2. Pull request triggers preview deployment.
3. Code is reviewed.
4. Changes are merged into the staging branch.
5. Staging deployment is tested.
6. Approved changes are merged into production.
7. Database migrations are executed through the controlled deployment process.
8. Production deployment is verified.

### Database Backup

- Enable provider-supported backups.
- Confirm backup retention for the selected Neon plan.
- Establish periodic independent database exports.
- Test restoration procedures.
- Maintain a documented recovery procedure.

---

## 20. Testing Requirements

### Unit Testing

Test:

- Scoring engine.
- Applicability calculations.
- Assessment status transitions.
- Session validation.
- Role authorization.
- Startup ID generation.
- Report calculations.

### Integration Testing

Test:

- Assessment creation.
- Assessment submission.
- Reviewer approval.
- Changes requested and resubmission.
- Assessment versioning.
- Score persistence.
- Dashboard aggregation.
- Report generation.

### Security Testing

Test:

- Unauthorized route access.
- Startup cross-account access.
- Reviewer permission boundaries.
- Session expiration.
- Invalid credentials.
- CSRF/XSS protections.
- API input validation.

### User Acceptance Testing

The system must be tested with:

- At least one startup account.
- CIE administrator accounts.
- At least one reviewer account.

All three application interfaces must be validated before production release.

---

# PART B: DATABASE SCHEMA

## 21. Database Design Overview

The database will use PostgreSQL with normalized relational tables.

The schema must support:

- Multiple startups.
- Multiple user roles.
- Multiple assessment versions.
- Configurable IP questionnaires.
- Individual question responses.
- Category-wise scoring.
- Reviewer decisions.
- Historical remarks.
- Review schedules.
- Analytics and reporting.
- Audit logs.

### 21.1 Entity Relationship Overview

```text
USERS
  |
  +---- SESSIONS
  |
  +---- AUDIT_LOGS
  |
  +---- REVIEW_RECORDS

STARTUPS
  |
  +---- STARTUP_MEMBERS
  |
  +---- IP_ASSESSMENTS
           |
           +---- IP_RESPONSES
           |
           +---- IP_SCORES
           |
           +---- REVIEW_RECORDS
           |
           +---- REVIEW_SCHEDULES
           |
           +---- REPORT_RECORDS

IP_QUESTIONNAIRES
  |
  +---- IP_QUESTIONS
           |
           +---- IP_RESPONSES

IP_CATEGORIES
  |
  +---- IP_QUESTIONS
  |
  +---- IP_SCORES
```

---

## 22. Database Tables

### 22.1 users

Stores all application user records.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| name | VARCHAR(150) | NOT NULL |
| email | VARCHAR(255) | UNIQUE, NOT NULL |
| password_hash | TEXT | NOT NULL |
| role | ENUM | NOT NULL |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Roles:

```text
STARTUP
CIE_ADMIN
REVIEWER
```

### 22.2 sessions

Stores authenticated user sessions.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key |
| token_hash | TEXT | UNIQUE |
| expires_at | TIMESTAMP | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

### 22.3 startups

Stores startup master information.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| startup_code | VARCHAR(30) | UNIQUE |
| name | VARCHAR(255) | NOT NULL |
| founder_name | VARCHAR(150) | NOT NULL |
| email | VARCHAR(255) | NOT NULL |
| contact_number | VARCHAR(20) | NOT NULL |
| website | TEXT | NULL |
| industry | VARCHAR(150) | NOT NULL |
| startup_stage | VARCHAR(50) | NOT NULL |
| incorporation_date | DATE | NULL |
| registration_number | VARCHAR(100) | NULL |
| description | TEXT | NOT NULL |
| product_description | TEXT | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

### 22.4 startup_members

Associates user accounts with startups.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| startup_id | UUID | Foreign Key |
| user_id | UUID | Foreign Key, UNIQUE |
| member_role | VARCHAR(50) | NOT NULL |
| created_at | TIMESTAMP | NOT NULL |

### 22.5 ip_categories

Stores IP categories.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| code | VARCHAR(30) | UNIQUE |
| name | VARCHAR(100) | NOT NULL |
| description | TEXT | NULL |
| is_active | BOOLEAN | DEFAULT TRUE |

Initial records:

```text
TRADEMARK
PATENT
COPYRIGHT
```

### 22.6 ip_questionnaires

Stores questionnaire versions.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| version | INTEGER | NOT NULL |
| title | VARCHAR(255) | NOT NULL |
| description | TEXT | NULL |
| is_active | BOOLEAN | DEFAULT FALSE |
| published_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |

A questionnaire version must become immutable after publication.

### 22.7 ip_questions

Stores questionnaire questions.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| questionnaire_id | UUID | Foreign Key |
| category_id | UUID | Foreign Key, NULL for general questions |
| question_text | TEXT | NOT NULL |
| description | TEXT | NULL |
| question_type | ENUM | NOT NULL |
| is_required | BOOLEAN | DEFAULT TRUE |
| display_order | INTEGER | NOT NULL |
| scoring_config | JSONB | NULL |
| conditional_config | JSONB | NULL |
| is_active | BOOLEAN | DEFAULT TRUE |

### 22.8 ip_assessments

Stores individual startup assessments.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| startup_id | UUID | Foreign Key |
| questionnaire_id | UUID | Foreign Key |
| version | INTEGER | NOT NULL |
| status | ENUM | NOT NULL |
| submitted_at | TIMESTAMP | NULL |
| approved_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Unique constraint:

```text
UNIQUE(startup_id, version)
```

### 22.9 ip_responses

Stores responses to individual questions.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| assessment_id | UUID | Foreign Key |
| question_id | UUID | Foreign Key |
| response | ENUM | NOT NULL |
| text_value | TEXT | NULL |
| justification | TEXT | NULL |
| created_at | TIMESTAMP | NOT NULL |
| updated_at | TIMESTAMP | NOT NULL |

Unique constraint:

```text
UNIQUE(assessment_id, question_id)
```

### 22.10 assessment_applicability

Stores category applicability declarations and reviewer verification.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| assessment_id | UUID | Foreign Key |
| category_id | UUID | Foreign Key |
| startup_applicable | BOOLEAN | NOT NULL |
| startup_remarks | TEXT | NULL |
| reviewer_applicable | BOOLEAN | NULL |
| reviewer_remarks | TEXT | NULL |
| verified_by | UUID | Foreign Key to users |
| verified_at | TIMESTAMP | NULL |

Unique constraint:

```text
UNIQUE(assessment_id, category_id)
```

### 22.11 ip_scores

Stores assessment scores.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| assessment_id | UUID | Foreign Key |
| category_id | UUID | Foreign Key, NULL for overall score |
| score | DECIMAL(5,2) | NOT NULL |
| applicable_questions | INTEGER | NOT NULL |
| scored_questions | INTEGER | NOT NULL |
| is_overridden | BOOLEAN | DEFAULT FALSE |
| override_reason | TEXT | NULL |
| calculated_at | TIMESTAMP | NOT NULL |

### 22.12 review_records

Stores reviewer decisions and remarks.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| assessment_id | UUID | Foreign Key |
| reviewer_id | UUID | Foreign Key |
| decision | ENUM | NOT NULL |
| general_remarks | TEXT | NULL |
| trademark_remarks | TEXT | NULL |
| patent_remarks | TEXT | NULL |
| copyright_remarks | TEXT | NULL |
| recommendations | TEXT | NULL |
| previous_status | ENUM | NULL |
| new_status | ENUM | NOT NULL |
| reviewed_at | TIMESTAMP | NOT NULL |

### 22.13 review_schedules

Stores future review schedules.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| startup_id | UUID | Foreign Key |
| assessment_id | UUID | Foreign Key |
| reviewer_id | UUID | Foreign Key |
| scheduled_date | DATE | NOT NULL |
| status | ENUM | NOT NULL |
| completed_at | TIMESTAMP | NULL |
| created_at | TIMESTAMP | NOT NULL |

### 22.14 report_records

Stores metadata for generated reports.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| report_code | VARCHAR(50) | UNIQUE |
| report_type | ENUM | NOT NULL |
| startup_id | UUID | Foreign Key, NULL |
| assessment_id | UUID | Foreign Key, NULL |
| generated_by | UUID | Foreign Key |
| generated_at | TIMESTAMP | NOT NULL |
| filters | JSONB | NULL |

The application will generate reports on demand. No external document storage is required. The initial implementation may stream the generated report directly to the user without retaining the PDF or Excel file.

### 22.15 audit_logs

Stores important system actions.

| Column | Type | Constraints |
|---|---|---|
| id | UUID | Primary Key |
| user_id | UUID | Foreign Key, NULL |
| action | VARCHAR(100) | NOT NULL |
| entity_type | VARCHAR(100) | NOT NULL |
| entity_id | UUID | NULL |
| old_values | JSONB | NULL |
| new_values | JSONB | NULL |
| ip_address | VARCHAR(45) | NULL |
| created_at | TIMESTAMP | NOT NULL |

Audit records must not be editable through ordinary application APIs.

---

# PART C: PRISMA DATABASE SCHEMA

## 23. Prisma Schema

The following is the proposed starting Prisma schema. It establishes the core relationships and should be validated against the final questionnaire and workflow before the first production migration.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

enum UserRole {
  STARTUP
  CIE_ADMIN
  REVIEWER
}

enum AssessmentStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  CHANGES_REQUESTED
  RESUBMITTED
  APPROVED
  REJECTED
}

enum ResponseValue {
  YES
  NO
  APPLIED
  NOT_APPLICABLE
  NOT_SURE
}

enum QuestionType {
  SINGLE_CHOICE
  MULTIPLE_CHOICE
  TEXT
  NUMBER
  DATE
  BOOLEAN
}

enum ReviewDecision {
  APPROVED
  CHANGES_REQUESTED
  REJECTED
}

enum ReviewStatus {
  SCHEDULED
  COMPLETED
  CANCELLED
}

enum ReportType {
  STARTUP_REPORT
  CIE_ANALYTICS_REPORT
}

model User {
  id           String   @id @default(uuid()) @db.Uuid
  name         String
  email        String   @unique
  passwordHash String   @map("password_hash")
  role         UserRole
  isActive     Boolean  @default(true) @map("is_active")

  startupMembership StartupMember?
  sessions          Session[]
  reviews           ReviewRecord[]
  schedules         ReviewSchedule[]
  reports           ReportRecord[]
  auditLogs         AuditLog[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@map("users")
}

model Session {
  id        String   @id @default(uuid()) @db.Uuid
  userId    String   @db.Uuid @map("user_id")
  tokenHash String   @unique @map("token_hash")
  expiresAt DateTime @map("expires_at")
  createdAt DateTime @default(now()) @map("created_at")

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("sessions")
}

model Startup {
  id                 String   @id @default(uuid()) @db.Uuid
  startupCode        String   @unique @map("startup_code")
  name               String
  founderName        String   @map("founder_name")
  email              String
  contactNumber      String   @map("contact_number")
  website            String?
  industry           String
  startupStage       String   @map("startup_stage")
  incorporationDate  DateTime? @db.Date @map("incorporation_date")
  registrationNumber String?  @map("registration_number")
  description        String
  productDescription String   @map("product_description")

  members     StartupMember[]
  assessments IpAssessment[]
  schedules   ReviewSchedule[]
  reports     ReportRecord[]

  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  @@index([name])
  @@index([industry])
  @@map("startups")
}

model StartupMember {
  id        String   @id @default(uuid()) @db.Uuid
  startupId String   @db.Uuid @map("startup_id")
  userId    String   @unique @db.Uuid @map("user_id")
  memberRole String  @map("member_role")
  createdAt DateTime @default(now()) @map("created_at")

  startup Startup @relation(fields: [startupId], references: [id])
  user    User    @relation(fields: [userId], references: [id])

  @@unique([startupId, userId])
  @@map("startup_members")
}

model IpCategory {
  id          String   @id @default(uuid()) @db.Uuid
  code        String   @unique
  name        String
  description String?
  isActive    Boolean  @default(true) @map("is_active")

  questions     IpQuestion[]
  scores        IpScore[]
  applicability AssessmentApplicability[]

  @@map("ip_categories")
}

model IpQuestionnaire {
  id          String   @id @default(uuid()) @db.Uuid
  version     Int
  title       String
  description String?
  isActive    Boolean  @default(false) @map("is_active")
  publishedAt DateTime? @map("published_at")
  createdAt   DateTime @default(now()) @map("created_at")

  questions   IpQuestion[]
  assessments IpAssessment[]

  @@unique([version])
  @@map("ip_questionnaires")
}

model IpQuestion {
  id              String       @id @default(uuid()) @db.Uuid
  questionnaireId String       @db.Uuid @map("questionnaire_id")
  categoryId      String?      @db.Uuid @map("category_id")
  questionText    String       @map("question_text")
  description     String?
  questionType    QuestionType @map("question_type")
  isRequired      Boolean      @default(true) @map("is_required")
  displayOrder    Int          @map("display_order")
  scoringConfig   Json?        @map("scoring_config")
  conditionalConfig Json?      @map("conditional_config")
  isActive        Boolean      @default(true) @map("is_active")

  questionnaire IpQuestionnaire @relation(fields: [questionnaireId], references: [id])
  category      IpCategory?     @relation(fields: [categoryId], references: [id])
  responses     IpResponse[]

  @@index([questionnaireId, displayOrder])
  @@index([categoryId])
  @@map("ip_questions")
}

model IpAssessment {
  id              String           @id @default(uuid()) @db.Uuid
  startupId       String           @db.Uuid @map("startup_id")
  questionnaireId String           @db.Uuid @map("questionnaire_id")
  version         Int
  status          AssessmentStatus @default(DRAFT)
  submittedAt     DateTime?        @map("submitted_at")
  approvedAt      DateTime?        @map("approved_at")
  createdAt       DateTime         @default(now()) @map("created_at")
  updatedAt       DateTime         @updatedAt @map("updated_at")

  startup       Startup        @relation(fields: [startupId], references: [id])
  questionnaire IpQuestionnaire @relation(fields: [questionnaireId], references: [id])
  responses     IpResponse[]
  scores        IpScore[]
  reviews       ReviewRecord[]
  applicability AssessmentApplicability[]
  schedules     ReviewSchedule[]
  reports       ReportRecord[]

  @@unique([startupId, version])
  @@index([startupId, status])
  @@index([submittedAt])
  @@map("ip_assessments")
}

model IpResponse {
  id           String        @id @default(uuid()) @db.Uuid
  assessmentId String        @db.Uuid @map("assessment_id")
  questionId   String        @db.Uuid @map("question_id")
  response     ResponseValue
  textValue    String?       @map("text_value")
  justification String?
  createdAt    DateTime      @default(now()) @map("created_at")
  updatedAt    DateTime      @updatedAt @map("updated_at")

  assessment IpAssessment @relation(fields: [assessmentId], references: [id])
  question   IpQuestion   @relation(fields: [questionId], references: [id])

  @@unique([assessmentId, questionId])
  @@index([assessmentId])
  @@map("ip_responses")
}

model AssessmentApplicability {
  id                String   @id @default(uuid()) @db.Uuid
  assessmentId      String   @db.Uuid @map("assessment_id")
  categoryId        String   @db.Uuid @map("category_id")
  startupApplicable Boolean  @map("startup_applicable")
  startupRemarks    String?  @map("startup_remarks")
  reviewerApplicable Boolean? @map("reviewer_applicable")
  reviewerRemarks   String?  @map("reviewer_remarks")
  verifiedBy        String?  @db.Uuid @map("verified_by")
  verifiedAt        DateTime? @map("verified_at")

  assessment IpAssessment @relation(fields: [assessmentId], references: [id])
  category   IpCategory   @relation(fields: [categoryId], references: [id])

  @@unique([assessmentId, categoryId])
  @@map("assessment_applicability")
}

model IpScore {
  id                 String   @id @default(uuid()) @db.Uuid
  assessmentId       String   @db.Uuid @map("assessment_id")
  categoryId         String?  @db.Uuid @map("category_id")
  score              Decimal  @db.Decimal(5, 2)
  applicableQuestions Int     @map("applicable_questions")
  scoredQuestions    Int      @map("scored_questions")
  isOverridden       Boolean  @default(false) @map("is_overridden")
  overrideReason     String?  @map("override_reason")
  calculatedAt       DateTime @default(now()) @map("calculated_at")

  assessment IpAssessment @relation(fields: [assessmentId], references: [id])
  category   IpCategory?  @relation(fields: [categoryId], references: [id])

  @@index([assessmentId])
  @@map("ip_scores")
}

model ReviewRecord {
  id              String         @id @default(uuid()) @db.Uuid
  assessmentId    String         @db.Uuid @map("assessment_id")
  reviewerId      String         @db.Uuid @map("reviewer_id")
  decision        ReviewDecision
  generalRemarks  String?        @map("general_remarks")
  trademarkRemarks String?       @map("trademark_remarks")
  patentRemarks   String?        @map("patent_remarks")
  copyrightRemarks String?       @map("copyright_remarks")
  recommendations String?
  previousStatus  AssessmentStatus? @map("previous_status")
  newStatus       AssessmentStatus @map("new_status")
  reviewedAt      DateTime       @default(now()) @map("reviewed_at")

  assessment IpAssessment @relation(fields: [assessmentId], references: [id])
  reviewer   User         @relation(fields: [reviewerId], references: [id])

  @@index([assessmentId])
  @@index([reviewerId])
  @@map("review_records")
}

model ReviewSchedule {
  id           String       @id @default(uuid()) @db.Uuid
  startupId    String       @db.Uuid @map("startup_id")
  assessmentId String       @db.Uuid @map("assessment_id")
  reviewerId   String       @db.Uuid @map("reviewer_id")
  scheduledDate DateTime    @db.Date @map("scheduled_date")
  status       ReviewStatus @default(SCHEDULED)
  completedAt  DateTime?    @map("completed_at")
  createdAt    DateTime     @default(now()) @map("created_at")

  startup    Startup      @relation(fields: [startupId], references: [id])
  assessment IpAssessment @relation(fields: [assessmentId], references: [id])
  reviewer   User         @relation(fields: [reviewerId], references: [id])

  @@index([startupId, scheduledDate])
  @@index([reviewerId, status])
  @@map("review_schedules")
}

model ReportRecord {
  id           String     @id @default(uuid()) @db.Uuid
  reportCode   String     @unique @map("report_code")
  reportType   ReportType @map("report_type")
  startupId    String?    @db.Uuid @map("startup_id")
  assessmentId String?    @db.Uuid @map("assessment_id")
  generatedBy  String     @db.Uuid @map("generated_by")
  generatedAt  DateTime   @default(now()) @map("generated_at")
  filters      Json?

  startup    Startup?      @relation(fields: [startupId], references: [id])
  assessment IpAssessment? @relation(fields: [assessmentId], references: [id])
  user       User          @relation(fields: [generatedBy], references: [id])

  @@index([generatedAt])
  @@map("report_records")
}

model AuditLog {
  id         String   @id @default(uuid()) @db.Uuid
  userId     String?  @db.Uuid @map("user_id")
  action     String
  entityType String   @map("entity_type")
  entityId   String?  @db.Uuid @map("entity_id")
  oldValues  Json?    @map("old_values")
  newValues  Json?    @map("new_values")
  ipAddress  String?  @map("ip_address")
  createdAt  DateTime @default(now()) @map("created_at")

  user User? @relation(fields: [userId], references: [id])

  @@index([userId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

# PART D: DATABASE RULES AND IMPLEMENTATION NOTES

## 24. Important Database Constraints

The Prisma schema is the starting point. The following additional constraints must be enforced through application validation and, where appropriate, PostgreSQL migrations.

### 24.1 Assessment Versioning

- Assessment versions must be unique per startup.
- A submitted assessment must not be edited directly.
- Resubmissions must create a new assessment version.
- Previous versions must remain accessible.
- Only one current approved assessment should be selected for official portfolio analytics.

### 24.2 Questionnaire Integrity

- A question must belong to the same questionnaire version referenced by its assessment.
- Published questionnaires must be immutable.
- Changes to questions must create a new questionnaire version.
- Historical responses must preserve their original question text and scoring configuration.

For stronger historical integrity, assessment creation should snapshot the applicable question text, response options, and scoring configuration, rather than relying solely on references to mutable question records.

### 24.3 Scoring Integrity

- Scores must be calculated server-side.
- One overall score must exist per assessment.
- One category score must exist per applicable category per assessment.
- The database must enforce uniqueness for assessment/category score combinations.
- Score overrides must require an authorized reviewer and a justification.
- Scoring inputs and configuration versions must be preserved.

### 24.4 Review Integrity

- Only reviewers may approve assessments.
- Approval and status updates must occur in one transaction.
- Every decision must create a review record.
- Approval date must be automatically populated.
- A rejected assessment must require a rejection reason.
- Changes requested must include reviewer remarks.
- The next review date must be recorded.

### 24.5 Referential Integrity

- A response must belong to its assessment.
- The response question must belong to the assessment's questionnaire version.
- A reviewer record must reference a valid reviewer account.
- A review schedule must reference a valid startup and assessment.
- A startup cannot be deleted if it has historical assessments without an explicit archival process.

---

## 25. Transaction Requirements

The following operations must use PostgreSQL transactions.

### Assessment Submission

1. Validate startup ownership.
2. Validate assessment status.
3. Validate mandatory questions.
4. Validate category applicability declarations.
5. Calculate provisional scores.
6. Update assessment status.
7. Record submission timestamp.
8. Create audit log.
9. Commit transaction.

### Reviewer Approval

1. Validate reviewer permissions.
2. Verify assessment status.
3. Verify applicability.
4. Verify required review checks.
5. Calculate final scores.
6. Apply authorized overrides, if any.
7. Update assessment status to APPROVED.
8. Record approval timestamp.
9. Create reviewer record.
10. Create next review schedule.
11. Create audit log.
12. Commit transaction.

If any operation fails, the complete transaction must roll back.

---

## 26. Database Indexing Strategy

Recommended indexes:

| Table | Index | Purpose |
|---|---|---|
| users | email | Login lookup |
| startups | startup_code | Startup lookup |
| startups | industry | Analytics filters |
| ip_assessments | startup_id, status | Startup dashboard |
| ip_assessments | submitted_at | Submission analytics |
| ip_responses | assessment_id | Assessment loading |
| ip_scores | assessment_id | Score retrieval |
| review_records | reviewer_id | Reviewer history |
| review_schedules | scheduled_date | Upcoming reviews |
| audit_logs | user_id, created_at | Activity history |
| report_records | generated_at | Report history |

Indexes must be evaluated against actual query patterns.

---

# PART E: PROJECT DIRECTORY STRUCTURE

## 27. Recommended Next.js Project Structure

```text
ipms/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── logo.svg
│   └── assets/
│
├── src/
│   │
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │
│   │   ├── (startup)/
│   │   │   └── startup/
│   │   │       ├── dashboard/
│   │   │       ├── profile/
│   │   │       ├── assessment/
│   │   │       ├── history/
│   │   │       └── reports/
│   │   │
│   │   ├── (cie)/
│   │   │   └── cie/
│   │   │       ├── dashboard/
│   │   │       ├── startups/
│   │   │       ├── analytics/
│   │   │       ├── reviews/
│   │   │       ├── reports/
│   │   │       └── users/
│   │   │
│   │   ├── (reviewer)/
│   │   │   └── cie/
│   │   │       └── reviewer/
│   │   │           ├── dashboard/
│   │   │           ├── queue/
│   │   │           ├── assessments/
│   │   │           └── history/
│   │   │
│   │   └── api/
│   │       └── v1/
│   │           ├── auth/
│   │           ├── startups/
│   │           ├── questionnaires/
│   │           ├── assessments/
│   │           ├── reviewer/
│   │           ├── cie/
│   │           └── reports/
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── shared/
│   │   ├── startup/
│   │   ├── cie/
│   │   ├── reviewer/
│   │   ├── assessment/
│   │   └── charts/
│   │
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── auth.ts
│   │   ├── session.ts
│   │   ├── permissions.ts
│   │   ├── validations/
│   │   ├── scoring/
│   │   ├── reports/
│   │   └── utils/
│   │
│   ├── services/
│   │   ├── startup.service.ts
│   │   ├── assessment.service.ts
│   │   ├── questionnaire.service.ts
│   │   ├── scoring.service.ts
│   │   ├── reviewer.service.ts
│   │   ├── analytics.service.ts
│   │   └── report.service.ts
│   │
│   ├── types/
│   └── middleware.ts
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── security/
│
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

The route groups are organizational and do not automatically enforce security. Authorization must be implemented in server-side layouts, route handlers, and service functions.

---

# PART F: IMPLEMENTATION SEQUENCE

## 28. Recommended Development Order

### Sprint 1 – Foundation

- Initialize Next.js.
- Configure TypeScript.
- Configure Tailwind CSS and shadcn/ui.
- Create Neon database.
- Configure Prisma.
- Implement initial migrations.
- Implement authentication.
- Implement session management.
- Implement RBAC.

### Sprint 2 – Startup Management

- Create startup management APIs.
- Implement startup profiles.
- Implement startup user association.
- Implement CIE startup directory.
- Implement role-specific dashboards.

### Sprint 3 – Questionnaire and Assessment

- Create IP categories.
- Create questionnaire versioning.
- Implement dynamic questions.
- Implement conditional form logic.
- Implement draft management.
- Implement assessment submission.

### Sprint 4 – Scoring Engine

- Implement response normalization.
- Implement category score calculation.
- Implement overall score calculation.
- Implement applicability verification.
- Implement score persistence.
- Implement historical score tracking.

### Sprint 5 – Reviewer Workflow

- Implement reviewer queue.
- Implement assessment review page.
- Implement reviewer remarks.
- Implement approval and rejection.
- Implement changes requested.
- Implement assessment versioning.
- Implement next review scheduling.

### Sprint 6 – CIE Analytics

- Implement dashboard KPIs.
- Implement category analytics.
- Implement startup comparisons.
- Implement historical trends.
- Implement review monitoring.
- Implement search and filters.

### Sprint 7 – Reports

- Implement individual startup PDF.
- Implement consolidated CIE PDF.
- Implement Excel export.
- Implement report metadata.
- Implement report download functionality.

### Sprint 8 – Testing and Deployment

- Unit testing.
- Integration testing.
- Security testing.
- Performance testing.
- CIE User Acceptance Testing.
- Production deployment.
- Backup and recovery verification.

---

# 29. Final Technical Decisions

| Component | Final Decision |
|---|---|
| Architecture | Modular Monolith |
| Frontend | Next.js 16 |
| Backend | Next.js Route Handlers |
| Language | TypeScript |
| Database | Neon PostgreSQL |
| ORM | Prisma |
| Authentication | Custom Credentials Authentication |
| Password Hashing | Argon2id |
| Sessions | Database-backed secure sessions |
| Authorization | RBAC |
| UI | Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| PDF | React PDF |
| Excel | ExcelJS |
| Hosting | Vercel |
| Version Control | GitHub |
| File Storage | Not Required |
| Email Service | Not Required |
| External Authentication | Not Required |
| Background Job Service | Not Required Initially |

---

# 30. Engineering Priorities and Critical Considerations

The following requirements must not be compromised during implementation:

1. **Security:** Every protected API must validate authentication and authorization server-side.
2. **Data Integrity:** Assessment submissions must be transactional.
3. **Versioning:** Historical assessment records must never be silently overwritten.
4. **Scoring:** Scores must be calculated server-side using versioned configurations.
5. **Applicability:** Not Applicable responses must be handled correctly.
6. **Reviewer Accountability:** Every approval, rejection, and modification request must be auditable.
7. **Analytics Accuracy:** Official CIE analytics must use the latest approved assessment per startup.
8. **Historical Tracking:** Previous scores and assessment decisions must remain available.
9. **Recovery:** Production database backup and restoration must be tested.
10. **Maintainability:** The system must remain modular and easy to extend.

---

**END OF TECHNICAL REQUIREMENTS DOCUMENT**

**Bennett Hatchery – Centre for Innovation and Entrepreneurship**  
**Intellectual Property Management System (IPMS)**  
**Version 1.0**