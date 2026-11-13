# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary User:** CIE Intellectual Property Evaluators & Reviewers managing the institutional assessment queue, verifying category applicability, auditing disclosures, and issuing binding IP readiness sign-offs.
- **Secondary Users:**
  - Incubated student & faculty founders submitting venture disclosures and IP evaluations directly.
  - Bennett Hatchery (CIE) executive leadership tracking incubation cohort readiness, annual review schedules, and portfolio metrics.

## Product Purpose

The Bennett Hatchery Intellectual Property Management System (IPMS) provides an institutional-grade platform to evaluate, monitor, score, and govern the intellectual property portfolio (Trademarks, Patents, Copyrights) of startups incubated at the Centre for Innovation and Entrepreneurship (CIE), Bennett University.

Success means:
1. Frictionless, zero-login intake for early-stage ventures to complete comprehensive IP readiness disclosures.
2. Rigorous, auditable review workflows for CIE reviewers with category applicability verification and override authority.
3. Accurate server-side maturity scoring (0–100%) reflecting true legal/procedural status.
4. Continuous portfolio monitoring with annual audit reminders and executive Excel/PDF reporting.

## Positioning

Unlike generic venture management or CRM systems, Bennett Hatchery IPMS is an institutional intellectual property governance platform purpose-built for university incubators. It combines self-declared founder disclosures with formal evaluator verification, strict category applicability logic (excluding inapplicable IP types from penalizing scores), and permanent version-locked assessment histories.

## Operating Context

- **Workflows:** Public venture onboarding & assessment wizard (`/apply`), Reviewer queue & multi-category workspace (`/cie/reviewer/queue`), and Executive portfolio analytics & annual review monitoring (`/cie/dashboard`, `/cie/reviews`).
- **Institutional Environment:** Centre for Innovation & Entrepreneurship (CIE), Bennett University (Times of India Group).
- **Audit & Governance:** Every reviewer decision is timestamped, logged, and attached to formal recommendations and annual review deadlines.

## Capabilities and Constraints

- **Capabilities:**
  - Zero-login multi-step public application wizard with sequential startup code generation (`BH-YYYY-NNN`).
  - Active versioned questionnaire engine (21 questions across General IP, Trademark, Patent, and Copyright).
  - Reviewer applicability overrides with immediate score recalculation.
  - Multi-sheet Excel exports (`.xlsx`) via ExcelJS and individual startup report records.
  - Urgent review categorization (`Overdue`, `Due in 7 Days`, `Due in 30 Days`, `Upcoming`).
- **Constraints:**
  - Institutional data isolation and server-side RBAC enforcement.
  - No external third-party auth services (custom Argon2id + database sessions).
  - Immutable versioning: submitted assessments cannot be silently overwritten; resubmissions generate incremental versions (`V+1`).

## Brand Commitments

- **Institutional Identity:** Bennett Hatchery, CIE, Bennett University.
- **Visual Tone:** Academic/Institutional rigor: formal deep navy (`#1e3a8a`, `#0f172a`), crisp slate surfaces (`#f8fafc`, `#f1f5f9`), structured data tables, and high-density, accessible interfaces.
- **Typography & Details:** Clean system/sans typography, subtle borders, high scanability, and restrained motion.

## Evidence on Hand

- Standardized scoring schema and institutional questionnaire v1 seeded in database.
- 15 relational PostgreSQL models and 7 institutional lifecycle enums.
- Comprehensive architectural specifications in `memory.md`, `task.md`, and `docs/decisions.md`.

## Product Principles

1. **Institutional Rigor Over Fluff:** Interface emphasizes scanability, factual accuracy, and unambiguous legal/audit states over decorative flair.
2. **Reviewer Authority:** The reviewer's verified determinations govern official portfolio metrics; founder declarations serve as evidence and input.
3. **Zero-Friction Intake:** Startups must never be blocked by credential barriers when disclosing IP details.
4. **Permanent Auditability:** Every evaluation, response change, and review decision is version-locked and recorded permanently.

## Accessibility & Inclusion

- WCAG 2.1 AA contrast compliance across navy/slate text and status badges.
- Full keyboard navigation across the multi-step questionnaire and review tables.

