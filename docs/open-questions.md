# Bennett Hatchery IPMS — Open Questions, Ambiguities & Technical Clarifications

**Document Version:** 1.0.0  
**Classification:** Requirements Clarification & Institutional Governance  
**Organization:** Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University  
**Last Updated:** November 13, 2026

---

## Executive Summary

During the Phase 0 documentation review and technical architecture specification, several product ambiguities, technical edge cases, and policy decisions were identified across `docs/PRD.md` and `docs/TRD.md`. 

While the core baseline architecture is solid and development can proceed through foundational phases, the following items require formal confirmation or consensus from Bennett Hatchery / CIE leadership prior to finalizing Phase 4 (Questionnaire), Phase 5 (Scoring), and Phase 6 (Reviewer Workflow).

---

## 1. Product & Business Logic Clarifications

### Q1.1: Document References vs. Future Binary Uploads
- **Current Observation:** The PRD mentions document uploads (e.g. registration certificates, filing receipts, assignment agreements) and an `ip_documents` table. However, the TRD and project master guidelines explicitly state that external file storage (S3/R2/Supabase) is excluded from Release 1.0.
- **Architectural Baseline Adopted:** In Release 1.0, document references will be captured as structured metadata and text fields (e.g., Application Number, Filing Date, Registration Certificate Number, or institutional Google Drive links).
- **Question for Stakeholders:** Is capturing registration numbers and drive links sufficient for incubation records in Release 1.0, or will there be an immediate requirement to introduce local/cloud file storage in a sub-release?

### Q1.2: Multi-Founder / Multi-User Startup Access
- **Current Observation:** `StartupMember` schema enforces `@@unique([userId])`, meaning each user belongs to exactly one startup.
- **Question for Stakeholders:** 
  1. Can multiple team members (co-founders) from the same startup log in using distinct email accounts to view or edit the same assessment draft?
  2. If multiple users have access, should edits be locked to one user at a time to prevent concurrent edit collisions?

### Q1.3: Assessment Resubmission Limits & Frequency
- **Current Observation:** If a reviewer sets status to `CHANGES_REQUESTED`, the startup creates a new version (e.g. V1 $\to$ V2).
- **Question for Stakeholders:** Is there any institutional policy limiting how many times a startup can resubmit an assessment, or can resubmissions continue indefinitely until approved or rejected?

---

## 2. Scoring Engine Edge Cases & Weighting Formulas

### Q2.1: Equal Category Weighting vs. Domain-Specific Weighting
- **Current Observation:** The PRD proposes equal category weighting:
  $$\text{Overall Score} = \frac{\text{Trademark Score} + \text{Patent Score} + \text{Copyright Score}}{\text{Applicable Categories Count}}$$
- **Question for Stakeholders:** Does Bennett Hatchery intend to keep equal weighting across all categories, or should certain categories have higher institutional weight (e.g. Patent weighted 50%, Trademark 25%, Copyright 25%) depending on whether the startup is Deep-Tech, Hardware, or Digital Platform?

### Q2.2: Question Weightage Customization
- **Current Observation:** The schema includes a `scoringConfig Json?` column on `IpQuestion`, but current formula weights all applicable questions equally within a category (YES=100, APPLIED=50, NO=0).
- **Question for Stakeholders:** Are certain questions considered "critical milestones" that should carry higher weight? (For example: having a *granted* patent or *registered* trademark vs. having completed an initial prior-art search). If so, what are the approved point values?

### Q2.3: Edge Case: 100% Not Applicable
- **Current Observation:** A pre-revenue service or idea-stage startup might declare Trademark, Patent, and Copyright as `NOT_APPLICABLE`.
- **Architectural Baseline Adopted:** If all categories are verified Not Applicable, Overall Score defaults to `0.00` with the status flag `NO_APPLICABLE_IP` rather than triggering a division-by-zero error.
- **Question for Stakeholders:** Is this acceptable, or should startups be required to have at least one applicable category (e.g. Trademark at minimum) to be admitted for incubation assessment?

### Q2.4: Handling of "NOT_SURE" Responses in Scored Assessments
- **Current Observation:** PRD specifies `NOT_SURE` as "Unscored until reviewed".
- **Architectural Baseline Adopted:** When a startup selects `NOT_SURE`, the question is provisionally scored as `0` in draft/provisional scores, and flagged in the Reviewer workspace so the reviewer can clarify the answer and guide the startup or adjust applicability.
- **Question for Stakeholders:** Does Bennett Hatchery approve this provisional handling?

---

## 3. Reviewer Workflow & Assignment Mechanics

### Q3.1: Review Queue Assignment Model
- **Current Observation:** PRD mentions "assigned startups" and "assigned reviewers", but TRD schema does not maintain an `assignedReviewerId` on the `IpAssessment` table.
- **Architectural Baseline Adopted:** We implemented a **shared review queue** (ADR-010) where all designated reviewers see pending submissions, and when a reviewer evaluates and takes action, their `reviewerId` is bound to the `ReviewRecord` and `ReviewSchedule`.
- **Question for Stakeholders:** Is an open shared queue acceptable, or must CIE administrators explicitly assign specific reviewers to specific startups prior to review?

### Q3.2: Reviewer Score Override Policy
- **Current Observation:** TRD permits a reviewer to override a category or overall score if accompanied by a logged `overrideReason`.
- **Question for Stakeholders:** Under what specific circumstances should a reviewer override an automated score (e.g., exceptional proprietary trade secrets not captured by standard questionnaire), and does a score override require secondary sign-off from the CIE Director?

### Q3.3: Next Review Date Default Intervals
- **Current Observation:** Upon approving an assessment, setting a `Next Review Date` is mandatory.
- **Question for Stakeholders:** Should the UI provide standard institutional quick-select intervals (e.g., 3 months, 6 months, 12 months) based on incubation stage, or remain a free-form date picker?

---

## 4. User Provisioning & Startup Onboarding Policies

### Q4.1: Initial Startup Provisioning Workflow
- **Current Observation:** Public user registration is disabled for security and institutional governance.
- **Question for Stakeholders:** What is the preferred mechanism for onboarding new startups:
  - Option A: CIE Administrator fills a "New Startup Account" form in `/cie/users` which generates a temporary password and sends credentials manually.
  - Option B: CIE Administrator uploads a CSV batch file of approved incubation startups.
  - Option C: System seeds approved startups via database scripts.
  *(Recommended for Phase 2/3: Option A as the primary administrative UI flow).*

### Q4.2: Maximum CIE Team Accounts
- **Current Observation:** TRD §5.6 mentions that the initial system will support four CIE team accounts as a configurable administrative limit rather than a database constraint.
- **Question for Stakeholders:** What are the exact roles and designated initial emails for these four accounts?

---

## 5. Reporting & Branding Guidelines

### Q5.1: Institutional Branding Assets
- **Current Observation:** Both PDF and Excel reports require official Bennett Hatchery and Bennett University branding.
- **Action Item:** CIE team to provide official vector SVG / high-resolution PNG logos, primary hexadecimal color codes, and official university address/disclaimer blocks to be embedded in report templates.

### Q5.2: Official Legal Disclaimers on Reports
- **Current Observation:** The IP maturity score must not be misrepresented as a legal certification of patentability.
- **Proposed Disclaimer Text:**  
  *"Disclaimer: The IP Maturity Score and classification presented in this report represent an internal incubation readiness assessment conducted by Bennett Hatchery – Centre for Innovation and Entrepreneurship (CIE), Bennett University. This document does not constitute formal legal advice, patentability opinion, or trademark certification by any governmental authority."*
- **Question for Stakeholders:** Is this disclaimer text formally approved by university legal counsel?

---

## Summary of Recommendations

| Item | Recommendation | Impacted Phase |
|---|---|---|
| Document Uploads | Capture numbers & drive links; omit binary file storage | Phase 4 |
| Multi-User Startup Access | 1-to-1 founder account per startup in v1 | Phase 2, 3 |
| Resubmission Policy | Unlimited resubmissions until approved or formally rejected | Phase 4, 6 |
| Category Weighting | Equal weighting ($\frac{1}{N}$) initially; allow config in DB | Phase 5 |
| Review Queue Model | Shared queue with reviewer attribution on decision | Phase 6 |
| Next Review Date | Date picker with 3, 6, 12-month quick buttons | Phase 6 |
| Onboarding Flow | Admin single-startup provisioning in CIE dashboard | Phase 2, 3 |

