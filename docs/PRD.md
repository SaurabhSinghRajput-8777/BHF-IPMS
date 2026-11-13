# Product Requirements Document (PRD)
# Bennett Hatchery – Intellectual Property Management System (IPMS)

**Version:** 1.0  
**Status:** Initial Draft  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University  
**Product Type:** Web-Based Application  
**Document Owner:** Bennett Hatchery / CIE  
**Platform:** Web Application

---

## 1. Executive Summary

The Bennett Hatchery Intellectual Property Management System (IPMS) is a centralized web-based platform designed to collect, assess, monitor, and manage the Intellectual Property (IP) portfolio of startups incubated under Bennett Hatchery.

The platform will enable startups to submit their intellectual property information through a structured digital assessment form covering three primary IP categories:

1. Trademark
2. Patent
3. Copyright

Based on the information submitted, the system will calculate category-wise and overall IP maturity scores to help track the progress of individual startups.

The submitted assessments will be routed to the designated CIE Reviewer, who will verify the information, add remarks, request modifications, approve or reject submissions, and schedule the next review.

Once approved, the assessment data will become part of the consolidated CIE analytics dashboard.

The platform will also provide automated report generation, allowing CIE administrators to generate organization-wide analytics reports and individual startup IP assessment reports in PDF and Excel formats.

### 1.1 Product Vision

To establish a centralized Intellectual Property monitoring ecosystem that enables Bennett Hatchery to systematically evaluate, track, and improve the IP readiness and protection status of its incubated startups.

### 1.2 Primary Objectives

- Digitize the IP information collection process.
- Maintain a centralized database of startup IP information.
- Track Trademark, Patent, and Copyright progress.
- Calculate standardized IP maturity scores.
- Establish a structured reviewer approval workflow.
- Provide centralized analytics for the CIE team.
- Maintain historical assessment and review records.
- Enable individual and consolidated report generation.
- Monitor upcoming and overdue IP reviews.

---

## 2. Scope of the Product

The application will consist of three primary user-facing modules:

| Module | User | Purpose |
|---|---|---|
| Startup Portal | Startup Founder / Authorized Representative | Submit and monitor IP assessments |
| CIE Dashboard | CIE Administration Team | Monitor startup IP portfolio and analytics |
| Reviewer Dashboard | CIE Reviewer | Validate, review, approve, and schedule assessments |

All three modules will operate on a centralized backend and database.

### 2.1 Intellectual Property Categories

The system will initially support three categories:

- Trademark
- Patent
- Copyright

Each category will have its own questionnaire, response tracking, document uploads, applicability assessment, and maturity score.

### 2.2 Out of Scope – Initial Release

The following features are not included in the initial release:

- Direct filing of patents or trademarks with government authorities.
- Automated legal determination of patentability or trademark registrability.
- Integration with government IP filing portals.
- AI-powered legal advice.
- Automated patent prior-art searches.
- Payment processing for IP registrations.
- Direct legal representation or dispute management.

The platform is an IP management and monitoring system, not a substitute for professional legal assessment.

---

## 3. User Roles and Access Control

The system will implement Role-Based Access Control (RBAC).

### 3.1 Startup

Startups will have access to their own profiles, assessments, documents, reports, and review history.

**Permissions:**

- Login to the startup portal.
- View and update permitted startup information.
- Fill out the IP assessment questionnaire.
- Save assessments as drafts.
- Upload supporting documents.
- Submit completed assessments.
- View assessment status.
- View reviewer remarks.
- Respond to modification requests.
- View approved IP scores.
- Download individual IP reports.
- View upcoming review dates.
- View previous assessment history.

**Restrictions:**

- Cannot access another startup's records.
- Cannot approve or reject assessments.
- Cannot modify an assessment after approval.
- Cannot access CIE-wide analytics.

### 3.2 CIE Team / Administrator

The CIE team will have access to the consolidated startup IP portfolio.

**Permissions:**

- View all registered startups.
- View all submitted assessments.
- Access approved assessment records.
- Monitor startup-wise IP scores.
- View trademark, patent, and copyright statistics.
- Access organization-wide analytics.
- Monitor pending and upcoming reviews.
- Generate consolidated reports.
- Export analytics in PDF and Excel formats.
- View individual startup reports.
- Manage permitted system configurations.
- Manage user access where authorized.

### 3.3 CIE Team / Reviewer

Reviewers will be responsible for validating startup submissions.

**Permissions:**

- View assigned assessment submissions.
- Access startup information.
- Review individual questionnaire responses.
- View supporting documents.
- Add general remarks.
- Add category-specific remarks.
- Request modifications.
- Approve assessments.
- Reject assessments with reasons.
- Set next review dates.
- View previous review records.
- View assessment history.
- Record reviewer-specific recommendations.

**Restrictions:**

- Cannot modify original startup responses without an auditable correction process.
- Cannot access unrelated administrative configurations unless separately authorized.
- Cannot permanently delete submitted assessment records.

### 3.4 Permission Matrix

| Feature | Startup | CIE Team | Reviewer |
|---|---|---|---|
| View own startup | Yes | Yes | Yes |
| View all startups | No | Yes | Assigned startups |
| Submit assessment | Yes | No | No |
| Upload documents | Yes | No | No |
| View IP scores | Own | All | Assigned |
| Add reviewer remarks | No | No | Yes |
| Approve assessment | No | No | Yes |
| Generate startup report | Own | All | Assigned |
| Generate consolidated report | No | Yes | No |
| Schedule next review | No | Optional admin override | Yes |
| Manage users | No | Authorized admin | No |

---

## 4. Functional Requirements

## 4.1 Authentication and User Management

The platform must provide secure authentication for all three user roles.

**Requirements:**

- Users must authenticate before accessing protected modules.
- Each account must have an assigned role.
- Access must be controlled through server-side authorization.
- Startup accounts must be associated with a unique startup record.
- Reviewer accounts must be associated with their reviewer permissions.
- Unauthorized users must not access protected resources.
- All important user actions must be recorded in audit logs.

**Acceptance Criteria:**

- A startup cannot access another startup's assessment.
- A reviewer cannot approve an assessment without appropriate permissions.
- CIE administrators can access consolidated analytics.
- Unauthorized API requests return appropriate authorization errors.

## 4.2 Startup Registration and Profile Management

Each startup must have a centralized profile.

### Startup Information Fields

| Field | Type | Required |
|---|---|---|
| Startup ID | System Generated | Yes |
| Startup Name | Text | Yes |
| Founder Name | Text | Yes |
| Co-founder Details | Repeatable Fields | No |
| Official Email | Email | Yes |
| Contact Number | Phone | Yes |
| Website | URL | No |
| Industry / Sector | Dropdown | Yes |
| Startup Stage | Dropdown | Yes |
| Date of Incorporation | Date | No |
| CIN / Registration Number | Text | No |
| Startup Description | Long Text | Yes |
| Product / Service Description | Long Text | Yes |
| Registered Address | Text | No |

### Startup Stage Options

- Idea Stage
- Prototype Stage
- MVP Stage
- Early Revenue
- Growth Stage
- Established Business

**System Behaviour:**

- Startup ID must be generated automatically.
- The startup profile must be linked to its assessments.
- The system must maintain profile creation and modification timestamps.
- Only authorized users may modify startup information.

## 4.3 IP Assessment Questionnaire

The platform must provide a structured, multi-section questionnaire.

The questionnaire will be divided into:

1. General IP Information
2. Trademark Assessment
3. Patent Assessment
4. Copyright Assessment

Startups must be able to save their progress and continue later.

### 4.3.1 General IP Information

Initial questions:

1. Does your startup own or develop any intellectual property?
2. Have you previously applied for any form of IP protection?
3. Does your startup currently hold any registered intellectual property?
4. Have you documented the ownership of intellectual property created by founders, employees, or contractors?
5. Are you interested in obtaining professional assistance for IP protection?

Response options:

- Yes
- No
- Not Sure
- Not Applicable

### 4.3.2 Trademark Assessment

The system must collect information regarding brand identity and trademark protection.

**Suggested Questions:**

1. Does your startup have a registered or established brand name?
2. Does your startup have a logo?
3. Have you conducted a trademark availability search?
4. Have you identified the relevant trademark classes?
5. Have you applied for trademark registration?
6. Has your trademark application been approved or registered?
7. Do you possess a trademark application or registration number?
8. Do you have supporting trademark documentation?

Additional fields:

- Trademark Name
- Trademark Application Number
- Registration Number
- Filing Date
- Registration Date
- Trademark Classes
- Document Upload

### 4.3.3 Patent Assessment

The system must collect information regarding inventions, technical innovations, and patent filing progress.

**Suggested Questions:**

1. Has your startup developed a novel invention?
2. Does your product or technology involve a technical innovation?
3. Have you conducted a preliminary prior-art search?
4. Have you evaluated the novelty of the invention?
5. Have you evaluated whether the invention involves an inventive step?
6. Have you evaluated its industrial applicability?
7. Have you filed a patent application?
8. Has a patent been granted?

Additional fields:

- Invention Title
- Invention Description
- Patent Application Number
- Filing Date
- Patent Grant Number
- Patent Status
- Supporting Documents

### 4.3.4 Copyright Assessment

The system must collect information regarding original works and copyright ownership.

**Suggested Questions:**

1. Has your startup developed original software or source code?
2. Does your startup own original creative or literary content?
3. Does your startup create original designs, graphics, or multimedia content?
4. Are intellectual property ownership rights documented?
5. Are founder and employee IP assignment agreements in place?
6. Have you applied for copyright registration?
7. Has copyright registration been completed?
8. Do you maintain supporting copyright documentation?

Additional fields:

- Copyright Work Title
- Work Category
- Creator Name
- Creation Date
- Registration Number, if applicable
- Registration Date, if applicable
- Supporting Documents

### 4.3.5 Response Options

Each applicable questionnaire item must support standardized response options.

| Response | Meaning | Illustrative Score |
|---|---|---:|
| Yes | Completed / Available | 100 |
| Applied | Application Submitted / In Progress | 50 |
| No | Not Started / Not Available | 0 |
| Not Applicable | Not Relevant | Excluded |
| Not Sure | Requires Verification | Unscored until reviewed |

The questionnaire must support configurable questions and response options.

**Important:** Different question types may require different scoring rules. For example, a question about whether an application has been filed should not receive the same interpretation as a question about whether an invention is potentially novel.

The CIE team must be able to configure scoring rules for individual questions.

### 4.3.6 Conditional Questions

The system must support conditional question rendering.

Examples:

- If the startup selects that it has applied for a patent, display patent application details.
- If the startup indicates that a trademark is registered, display registration information.
- If the startup has developed software, display software copyright-related questions.
- If the startup selects Not Applicable, allow it to provide a justification where required.

This will prevent startups from having to answer irrelevant questions.

### 4.3.7 Assessment Submission

Startups must be able to:

- Save an assessment as a draft.
- Preview their responses.
- Validate mandatory fields.
- Upload supporting documents.
- Submit the assessment.
- Receive a submission confirmation.

After submission:

- The assessment must become read-only for the startup.
- A unique assessment ID must be generated.
- Submission date and time must be recorded.
- The assessment must enter the reviewer queue.
- The startup must receive a submission status notification.

---

## 5. IP Scoring Engine

The platform must calculate category-wise and overall IP maturity scores.

### 5.1 Category Scores

Three independent scores will be calculated:

- Trademark Score
- Patent Score
- Copyright Score

### 5.2 Question-Level Scoring

Initial proposed mapping:

- Yes = 100
- Applied = 50
- No = 0
- Not Applicable = Excluded
- Not Sure = Pending verification

The scoring configuration must be maintained separately from questionnaire data.

### 5.3 Category Score Formula

Category score:

Category Score = (Sum of Applicable Question Scores / Total Applicable Question Count)

For example:

If a startup has five applicable trademark questions with scores of:

100, 100, 50, 0, 100

Trademark Score = 350 / 5 = 70%

### 5.4 Overall IP Maturity Score

Initial proposed model:

Overall IP Score = (Trademark Score + Patent Score + Copyright Score) / Number of Applicable Categories

The system must exclude categories that have been formally marked as Not Applicable and verified by the reviewer.

### 5.5 Score Classification

| Score Range | Classification |
|---|---|
| 0–20 | Initial |
| 21–40 | Developing |
| 41–60 | Intermediate |
| 61–80 | Advanced |
| 81–100 | Strong IP Readiness |

These classifications are indicative and must not be interpreted as legal certification.

### 5.6 Score Management

- Scores must be calculated automatically.
- Category-wise scores must be stored separately.
- Overall scores must be stored for each assessment version.
- Reviewers must be able to verify scoring inputs.
- Any manual score override must require a justification.
- Previous scores must remain available for historical comparison.
- Score changes between assessments must be measurable.

### 5.7 IP Applicability

IP applicability must be treated separately from IP protection progress.

A startup may not require patent protection but may have substantial trademark and copyright requirements.

The system must therefore record:

- Startup-declared applicability.
- Reviewer-verified applicability.
- Applicability justification.
- Final applicable category set.

The system must not penalize startups for categories formally marked Not Applicable.

---

## 6. Assessment Status and Workflow

The platform must maintain a defined assessment lifecycle.

### 6.1 Assessment Statuses

| Status | Description |
|---|---|
| Draft | Startup is filling the questionnaire |
| Submitted | Startup has submitted the assessment |
| Under Review | Reviewer is evaluating the submission |
| Changes Requested | Reviewer has requested modifications |
| Resubmitted | Startup has submitted requested modifications |
| Approved | Reviewer has approved the assessment |
| Rejected | Reviewer has rejected the submission |

### 6.2 Workflow

1. Startup logs in.
2. Startup completes the profile.
3. Startup fills the IP questionnaire.
4. Startup uploads relevant documents.
5. Startup submits the assessment.
6. System generates an assessment ID.
7. Assessment enters the reviewer queue.
8. Reviewer examines the submission.
9. Reviewer adds remarks and recommendations.
10. Reviewer chooses one of the available decisions:
    - Approve
    - Request Changes
    - Reject
11. If changes are requested, the startup receives the remarks and can resubmit.
12. If approved, the system records the approval date.
13. Reviewer schedules the next review date.
14. Approved assessment is included in official CIE analytics.
15. Individual startup report becomes available.

### 6.3 Reviewer Approval Requirements

The reviewer must be able to:

- View the complete assessment.
- View category-wise responses.
- View uploaded documents.
- Add general remarks.
- Add category-specific remarks.
- Request modifications.
- Approve the assessment.
- Reject the assessment with a mandatory reason.
- Set the next review date.

### 6.4 Approval Conditions

An assessment cannot be approved unless:

- Mandatory information is completed.
- Required supporting documents are provided, where applicable.
- All required reviewer checks are completed.
- Applicability is verified.
- The next review date is specified.

The system must record the reviewer ID and approval timestamp.

---

## 7. Startup Dashboard

The startup dashboard will provide a consolidated view of its IP progress.

### 7.1 Dashboard Components

**Overview Cards:**

- Overall IP Maturity Score
- Trademark Score
- Patent Score
- Copyright Score
- Current Assessment Status
- Next Review Date

**Dashboard Sections:**

1. Startup Profile
2. IP Assessment
3. IP Score Overview
4. Assessment History
5. Reviewer Remarks
6. Supporting Documents
7. Reports and Downloads
8. Upcoming Reviews

### 7.2 Assessment History

The system must maintain previous submissions and approved assessments.

Startups should be able to compare:

- Previous overall score.
- Current overall score.
- Previous category scores.
- Current category scores.
- Reviewer recommendations.
- Assessment submission dates.
- Approval dates.

### 7.3 Notifications

The startup should receive notifications for:

- Successful assessment submission.
- Assessment moved to review.
- Changes requested.
- Assessment approved.
- Assessment rejected.
- Upcoming review.
- Overdue review.

---

## 8. CIE Team Dashboard and Analytics

The CIE dashboard will provide a centralized view of the IP portfolio across all incubated startups.

### 8.1 Key Performance Indicators

The dashboard must display:

1. Total Registered Startups
2. Total Assessments Submitted
3. Total Approved Assessments
4. Pending Assessments
5. Assessments Requiring Changes
6. Average IP Maturity Score
7. Trademark Progress
8. Patent Progress
9. Copyright Progress
10. Upcoming Reviews
11. Overdue Reviews

### 8.2 Analytics Modules

**A. IP Category Distribution**

Display the number and percentage of startups with:

- Trademark applications and registrations.
- Patent applications and grants.
- Copyright-related documentation and registrations.

**B. Startup-Wise IP Performance**

Provide comparative visualization of startup IP maturity scores.

**C. Assessment Status Distribution**

Display:

- Draft
- Submitted
- Under Review
- Changes Requested
- Approved
- Rejected

**D. IP Maturity Distribution**

Group startups according to their overall IP maturity classification.

**E. Time-Based Analytics**

Display:

- Monthly assessment submissions.
- Monthly approvals.
- Average IP score over time.
- Improvement in startup IP maturity.
- Upcoming review schedules.

**F. Review Monitoring**

Display:

- Reviews due within the next 7 days.
- Reviews due within the next 30 days.
- Overdue reviews.
- Completed reviews.

### 8.3 Startup Directory

The CIE team must have access to a searchable startup directory.

Suggested columns:

- Startup ID
- Startup Name
- Industry
- Overall IP Score
- Trademark Score
- Patent Score
- Copyright Score
- Latest Assessment Status
- Submission Date
- Approval Date
- Next Review Date

Available filters:

- Startup Name
- Startup Stage
- Industry
- IP Category
- Assessment Status
- Score Range
- Submission Date
- Next Review Date

Clicking a startup must open its detailed IP profile.

### 8.4 Analytics Data Rules

Official portfolio analytics must use the latest approved assessment version for each startup.

Pending and rejected assessments must not be counted as approved IP progress.

The dashboard may separately display pending assessment statistics.

Historical approved assessments must remain available for trend analysis.

---

## 9. Reviewer Dashboard

The reviewer dashboard will provide a dedicated workspace for assessment verification.

### 9.1 Reviewer Overview

Dashboard cards:

- Assigned Assessments
- Pending Reviews
- Under Review
- Changes Requested
- Approved Assessments
- Upcoming Reviews
- Overdue Reviews

### 9.2 Review Queue

The reviewer must be able to view assessments in a table.

Suggested columns:

- Assessment ID
- Startup Name
- Submission Date
- Current Status
- Overall Calculated Score
- Assigned Reviewer
- Review Priority

### 9.3 Assessment Review Page

The review page must contain:

1. Startup Information
2. General IP Information
3. Trademark Assessment
4. Patent Assessment
5. Copyright Assessment
6. Uploaded Documents
7. Category-Wise Scores
8. Overall Score
9. Previous Assessment History
10. Reviewer Remarks
11. Review Decision
12. Next Review Date

### 9.4 Reviewer Remarks

The reviewer must be able to enter:

- General Remarks
- Trademark Remarks
- Patent Remarks
- Copyright Remarks
- Recommended Actions
- Required Modifications

Remarks must be timestamped and associated with the reviewer account.

### 9.5 Review Scheduling

The reviewer must be able to select the next review date.

The system must:

- Record the selected date.
- Associate the date with the relevant startup and assessment.
- Display it on the reviewer dashboard.
- Display it on the startup dashboard.
- Trigger notifications before the due date.
- Identify overdue reviews.

Review frequency must be configurable.

---

## 10. Report Generation

The platform must support two types of reports.

### 10.1 Individual Startup IP Report

Each startup must have a downloadable IP assessment report.

**Report Contents:**

1. Bennett Hatchery branding.
2. Report ID.
3. Startup ID.
4. Startup Name.
5. Startup Profile.
6. Industry and Startup Stage.
7. Assessment Submission Date.
8. Approval Date.
9. Reviewer Details.
10. Overall IP Maturity Score.
11. Trademark Score.
12. Patent Score.
13. Copyright Score.
14. Detailed Questionnaire Responses.
15. Reviewer Remarks.
16. Supporting Document References.
17. Recommended Actions.
18. Next Review Date.
19. Report Generation Date.

**Output Format:** PDF.

Only approved assessments should be labelled as approved reports.

Draft or pending assessments, if made downloadable, must be clearly labelled accordingly.

### 10.2 Consolidated CIE Analytics Report

The CIE team must be able to generate organization-wide reports.

**Report Contents:**

1. Total Registered Startups.
2. Total Submitted Assessments.
3. Total Approved Assessments.
4. Pending Assessments.
5. Average IP Maturity Score.
6. Trademark Statistics.
7. Patent Statistics.
8. Copyright Statistics.
9. Startup-Wise Score Comparison.
10. IP Maturity Distribution.
11. Assessment Status Distribution.
12. Monthly Submission Trends.
13. Monthly Approval Trends.
14. Upcoming Reviews.
15. Overdue Reviews.

**Output Formats:**

- PDF
- Excel (.xlsx)

### 10.3 Report Filters

The CIE team must be able to generate reports based on:

- Date Range
- Startup Stage
- Industry
- IP Category
- Assessment Status
- Score Range

### 10.4 Report Metadata

Each generated report must contain:

- Unique Report ID
- Generation Timestamp
- Generated By
- Associated Startup ID, where applicable
- Associated Assessment ID
- Report Version

---

## 11. Notifications and Reminders

The system must support notifications through email and in-application alerts.

### Notification Events

| Event | Recipient |
|---|---|
| Assessment Submitted | Startup and Reviewer |
| New Assessment Assigned | Reviewer |
| Assessment Under Review | Startup |
| Changes Requested | Startup |
| Assessment Approved | Startup |
| Assessment Rejected | Startup |
| Upcoming Review | Startup and Reviewer |
| Overdue Review | Startup and CIE Team |

### Reminder Schedule

The reminder system should support configurable notification intervals.

Initial proposal:

- 7 days before review.
- 3 days before review.
- On the review due date.
- After the review becomes overdue.

---

## 12. Database Requirements

The application must use a relational database.

PostgreSQL is recommended.

### 12.1 Proposed Database Tables

| Table | Purpose |
|---|---|
| users | User authentication and information |
| roles | User role definitions |
| startups | Startup master records |
| startup_members | Startup-founder associations |
| ip_categories | Trademark, Patent, Copyright |
| ip_questions | Questionnaire definitions |
| ip_assessments | Assessment master records |
| ip_responses | Individual question responses |
| ip_documents | Supporting document metadata |
| ip_scores | Calculated category and overall scores |
| review_records | Reviewer actions and remarks |
| review_schedules | Next review information |
| report_records | Generated report metadata |
| notifications | Notification history |
| audit_logs | System activity records |

### 12.2 Database Design Requirements

- Every startup must have a unique startup ID.
- Every assessment must have a unique assessment ID.
- Each assessment must be associated with a startup.
- Each assessment must maintain its own version.
- Every response must be associated with a question and assessment.
- Every reviewer action must be timestamped.
- Previous assessment versions must never be overwritten.
- Documents must be linked to the appropriate assessment.
- Reports must be associated with their source assessment or analytics snapshot.
- Database records must maintain creation and modification timestamps.

### 12.3 Assessment Versioning

Assessment versioning is mandatory.

Example:

- Startup submits Assessment V1.
- Reviewer requests modifications.
- Startup updates and resubmits.
- System creates Assessment V2.
- V1 remains available for historical reference.
- V2 goes through the review process.

The system must maintain a complete history of submissions and reviewer actions.

---

## 13. API Requirements

The backend must expose secure REST APIs.

### 13.1 Startup APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/startups/me | Get startup profile |
| PUT | /api/startups/me | Update startup profile |
| GET | /api/assessments/me | Get startup assessments |
| POST | /api/assessments | Create assessment draft |
| PUT | /api/assessments/:id | Update draft |
| POST | /api/assessments/:id/submit | Submit assessment |
| GET | /api/assessments/:id | Get assessment details |
| GET | /api/assessments/:id/report | Download startup report |

### 13.2 CIE Team APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/cie/startups | List startups |
| GET | /api/cie/analytics/overview | Dashboard overview |
| GET | /api/cie/analytics/ip-distribution | IP category analytics |
| GET | /api/cie/analytics/trends | Historical trends |
| GET | /api/cie/reviews/upcoming | Upcoming reviews |
| GET | /api/cie/reports/analytics | Generate analytics report |
| GET | /api/cie/startups/:id | Get startup details |

### 13.3 Reviewer APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | /api/reviewer/queue | Get pending assessments |
| GET | /api/reviewer/assessments/:id | Get assessment details |
| POST | /api/reviewer/assessments/:id/remarks | Add remarks |
| POST | /api/reviewer/assessments/:id/approve | Approve assessment |
| POST | /api/reviewer/assessments/:id/request-changes | Request modifications |
| POST | /api/reviewer/assessments/:id/reject | Reject assessment |
| POST | /api/reviewer/assessments/:id/schedule | Schedule next review |
| GET | /api/reviewer/history | Review history |

### 13.4 API Security

- All protected endpoints must require authentication.
- All endpoints must enforce role-based authorization.
- Startup access must be restricted to its own records.
- Reviewer access must be restricted to authorized assessments.
- File upload endpoints must validate file types and sizes.
- Sensitive operations must be logged.
- API inputs must be validated server-side.

---

## 14. Technical Architecture

### 14.1 Recommended Technology Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js with TypeScript |
| UI Framework | Tailwind CSS |
| Component Library | shadcn/ui |
| Authentication | Existing CIE Authentication / Supabase Auth |
| Backend | Next.js API Routes |
| Database | PostgreSQL |
| ORM | Prisma |
| File Storage | Supabase Storage |
| Analytics Charts | Recharts |
| PDF Generation | React PDF / PDFKit |
| Excel Generation | ExcelJS |
| Email Notifications | Resend |
| Deployment | Bennett Hatchery Infrastructure |
| Monitoring | Sentry |

### 14.2 Architecture Principles

- Modular application architecture.
- Centralized authentication and authorization.
- Reusable frontend components.
- Configurable questionnaires.
- Configurable scoring rules.
- Secure document storage.
- Version-controlled assessments.
- Server-side score calculations.
- Auditable reviewer workflows.
- Scalable analytics queries.

### 14.3 Integration with Existing Bennett Hatchery Systems

Where technically feasible, the platform should reuse existing CIE/Bennett Hatchery infrastructure.

Potential integration areas:

- Existing startup master records.
- Existing authentication system.
- Existing user management.
- Existing organization branding.
- Existing deployment infrastructure.

The system should avoid maintaining duplicate startup records wherever existing data can be reused securely.

---

## 15. UI/UX Requirements

The application should follow Bennett Hatchery's existing digital branding and design language.

### 15.1 Design Principles

- Clean and professional interface.
- Minimal cognitive load.
- Responsive design.
- Consistent navigation.
- Clear status indicators.
- Data-focused dashboard layouts.
- Accessible forms.
- Simple report downloads.

### 15.2 Startup Interface

Primary navigation:

- Dashboard
- Startup Profile
- IP Assessment
- Assessment History
- Reports
- Notifications

### 15.3 CIE Interface

Primary navigation:

- Dashboard
- Startups
- IP Analytics
- Assessment Records
- Review Monitoring
- Reports
- Settings

### 15.4 Reviewer Interface

Primary navigation:

- Dashboard
- Review Queue
- Assigned Startups
- Assessment History
- Review Calendar
- Notifications

### 15.5 Responsive Requirements

The application must support:

- Desktop
- Laptop
- Tablet
- Mobile devices

The startup assessment form must remain usable on mobile devices.

---

## 16. Security and Data Privacy

The system will store business-sensitive information, technical invention details, and proprietary documents.

Security is therefore a critical requirement.

### Security Requirements

1. Role-based access control.
2. Server-side permission validation.
3. Secure authentication.
4. HTTPS for all application traffic.
5. Secure document storage.
6. Restricted file access.
7. Input validation and sanitization.
8. Protection against SQL injection.
9. Protection against XSS and CSRF where applicable.
10. Secure session management.
11. Audit logging.
12. Database backup and recovery.
13. Restricted access to confidential startup information.
14. Prevention of unauthorized assessment modification.

### Document Security

- Uploaded documents must not be publicly accessible.
- Documents must be accessible only to authorized users.
- Signed URLs should be used for temporary document access.
- File types and maximum upload sizes must be configurable.
- Sensitive documents must not be exposed through public report URLs.

### Audit Logging

The system must record:

- User login events.
- Profile updates.
- Assessment creation.
- Assessment submission.
- Assessment modification.
- Reviewer remarks.
- Approval and rejection.
- Review date modifications.
- Report generation.
- Administrative changes.

---

## 17. Non-Functional Requirements

| Requirement | Description |
|---|---|
| Performance | Dashboard and standard pages should load within 3 seconds under normal operating conditions |
| Scalability | Support an increasing number of startups and assessment records |
| Availability | Target 99.5% monthly application availability |
| Security | Enforce authentication, authorization, and secure storage |
| Reliability | Prevent data loss during assessment submission |
| Maintainability | Use modular and documented code |
| Usability | Provide intuitive navigation and clear form validation |
| Compatibility | Support modern Chrome, Edge, Firefox, and Safari |
| Responsiveness | Support desktop, tablet, and mobile layouts |
| Data Integrity | Maintain relational consistency and historical records |
| Auditability | Maintain a traceable history of critical operations |

---

## 18. Acceptance Criteria

The initial release will be considered successful when the following requirements are fulfilled.

### Startup Module

- [ ] Startup can securely log in.
- [ ] Startup can view and update its profile.
- [ ] Startup can complete the IP questionnaire.
- [ ] Startup can select Yes, No, Applied, Not Applicable, or Not Sure.
- [ ] Conditional questions work correctly.
- [ ] Startup can upload supporting documents.
- [ ] Startup can save drafts.
- [ ] Startup can submit assessments.
- [ ] Startup can view assessment status.
- [ ] Startup can view reviewer remarks.
- [ ] Startup can download its approved IP report.

### Reviewer Module

- [ ] Reviewer can view assigned submissions.
- [ ] Reviewer can access startup information.
- [ ] Reviewer can inspect supporting documents.
- [ ] Reviewer can add remarks.
- [ ] Reviewer can request modifications.
- [ ] Reviewer can approve assessments.
- [ ] Reviewer can reject assessments with reasons.
- [ ] Reviewer can set the next review date.
- [ ] Reviewer actions are recorded.

### CIE Dashboard

- [ ] CIE can view all authorized startup records.
- [ ] CIE can view overall portfolio statistics.
- [ ] CIE can view Trademark, Patent, and Copyright analytics.
- [ ] CIE can compare startup IP scores.
- [ ] CIE can filter startup records.
- [ ] CIE can monitor pending assessments.
- [ ] CIE can monitor upcoming and overdue reviews.
- [ ] CIE can generate consolidated reports.
- [ ] CIE can export Excel reports.

### Scoring and Reporting

- [ ] Scores are calculated automatically.
- [ ] Category-wise scores are available.
- [ ] Overall scores are available.
- [ ] Not Applicable responses are handled correctly.
- [ ] Scoring rules are configurable.
- [ ] Historical scores are preserved.
- [ ] Individual startup reports contain the required information.
- [ ] Reports display submission, approval, and next review dates.
- [ ] Only approved assessments are included in official portfolio metrics.

### Security

- [ ] Role-based access works correctly.
- [ ] Startups cannot access other startup records.
- [ ] Reviewers cannot perform unauthorized actions.
- [ ] Documents are protected.
- [ ] Critical operations are logged.
- [ ] Assessment versions cannot be silently overwritten.

---

## 19. Development Phases

### Phase 1 – Foundation

- Project initialization.
- Database design.
- Authentication.
- Role-based access control.
- Startup master data integration.
- Initial UI design system.

### Phase 2 – Startup Module

- Startup dashboard.
- Startup profile management.
- Dynamic IP questionnaire.
- Conditional form logic.
- Document uploads.
- Draft and submission functionality.

### Phase 3 – Scoring Engine

- Question-level scoring.
- Category-wise score calculation.
- Overall maturity score.
- Applicability handling.
- Score configuration.
- Assessment versioning.

### Phase 4 – Reviewer Module

- Reviewer dashboard.
- Review queue.
- Assessment verification.
- Reviewer remarks.
- Approval and rejection workflow.
- Modification requests.
- Review scheduling.

### Phase 5 – CIE Analytics

- CIE dashboard.
- Portfolio KPIs.
- Category distribution.
- Startup comparison.
- Historical trends.
- Review monitoring.
- Search and filters.

### Phase 6 – Reporting

- Individual startup PDF.
- Consolidated analytics PDF.
- Excel export.
- Report metadata.
- Download management.

### Phase 7 – Testing and Deployment

- Unit testing.
- Integration testing.
- Role-based access testing.
- Security testing.
- Performance testing.
- User acceptance testing.
- Production deployment.

---

## 20. Success Metrics

The platform's effectiveness will be measured using:

| Metric | Objective |
|---|---|
| Startup Registration Coverage | Percentage of incubated startups registered |
| Assessment Completion Rate | Percentage of registered startups submitting assessments |
| Reviewer Turnaround Time | Average time between submission and decision |
| IP Assessment Coverage | Percentage of startups assessed across applicable categories |
| Review Completion Rate | Percentage of scheduled reviews completed |
| Report Generation Time | Time required to generate individual and consolidated reports |
| Historical Progress Tracking | Percentage of startups with comparable assessment history |

---

## 21. Assumptions and Open Decisions

The following decisions require confirmation from Bennett Hatchery/CIE before final implementation.

| Decision | Initial Recommendation |
|---|---|
| Application Deployment | Independent module integrated with existing CIE infrastructure |
| Authentication | Reuse existing CIE authentication wherever possible |
| Database | PostgreSQL |
| Overall Scoring | Equal weighting of applicable IP categories initially |
| Question Weightage | Configurable at question level |
| Analytics Inclusion | Only latest approved assessment per startup |
| IP Applicability | Startup declaration verified by reviewer |
| Review Frequency | Reviewer-defined |
| Report Format | PDF and Excel |
| Assessment Versioning | Mandatory |
| Document Storage | Private cloud storage |

### Important Product Considerations

1. IP applicability must not be confused with IP registration progress.
2. Copyright protection must not be represented as dependent on registration.
3. Patent eligibility must not be determined automatically by questionnaire scores.
4. Trademark application and registration must be tracked separately.
5. A score must indicate IP maturity and progress, not legal validity.
6. Every approval and modification must have an audit trail.
7. Previous assessment records must remain available.
8. The latest approved assessment must drive official CIE analytics.

---

## 22. Final Product Outcome

The Bennett Hatchery Intellectual Property Management System will serve as a centralized platform for monitoring the intellectual property readiness and protection progress of startups incubated under Bennett Hatchery.

The system will establish a structured process from startup data collection to reviewer verification, approval, analytics, and report generation.

By implementing this platform, Bennett Hatchery will be able to:

- Maintain a centralized IP database.
- Understand the IP landscape of its incubated startups.
- Identify gaps in trademark, patent, and copyright protection.
- Monitor individual startup progress.
- Maintain accountability through structured reviews.
- Generate standardized reports for institutional use.
- Make data-driven decisions regarding IP support and startup development.

**The ultimate objective is to transform IP monitoring from a manual, fragmented process into a structured, measurable, and continuously trackable digital ecosystem.**

---

**Document End**

**Bennett Hatchery – Centre for Innovation and Entrepreneurship**  
Bennett University  
**Intellectual Property Management System (IPMS)**