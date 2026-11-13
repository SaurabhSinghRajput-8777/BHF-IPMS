import test from "node:test";
import assert from "node:assert/strict";
import { AnalyticsService } from "../../src/services/analytics.service";

test("Analytics Service: Latest Approved Assessment Filter", () => {
  // Startup 1 has versions 1 (Approved), 2 (Changes Requested), 3 (Approved) -> Latest is 3
  // Startup 2 has version 1 (Approved) -> Latest is 1
  // Startup 3 has version 1 (Submitted) -> None approved
  const assessments = [
    { id: "a1", startupId: "s1", version: 1, status: "APPROVED", score: 65, approvedAt: new Date("2026-01-10") },
    { id: "a2", startupId: "s1", version: 2, status: "CHANGES_REQUESTED", score: 70, approvedAt: null },
    { id: "a3", startupId: "s1", version: 3, status: "APPROVED", score: 85, approvedAt: new Date("2026-06-15") },
    { id: "a4", startupId: "s2", version: 1, status: "APPROVED", score: 50, approvedAt: new Date("2026-02-20") },
    { id: "a5", startupId: "s3", version: 1, status: "SUBMITTED", score: 40, approvedAt: null },
  ];

  const latestApproved = AnalyticsService.filterLatestApprovedAssessments(assessments);
  assert.strictEqual(latestApproved.length, 2, "Only 2 startups have approved assessments");

  const s1Record = latestApproved.find((a: (typeof assessments)[number]) => a.startupId === "s1");
  assert.ok(s1Record);
  assert.strictEqual(s1Record.version, 3, "Startup 1 latest approved version must be 3");
  assert.strictEqual(s1Record.score, 85);

  const s2Record = latestApproved.find((a: (typeof assessments)[number]) => a.startupId === "s2");
  assert.ok(s2Record);
  assert.strictEqual(s2Record.version, 1);
});

test("Analytics Service: Review Schedule Categorization", () => {
  const now = new Date("2026-11-13T00:00:00Z");

  const overdueDate = new Date("2026-11-10T00:00:00Z");
  const dueIn5Days = new Date("2026-11-18T00:00:00Z");
  const dueIn20Days = new Date("2026-12-03T00:00:00Z");
  const dueIn60Days = new Date("2027-01-12T00:00:00Z");

  assert.strictEqual(AnalyticsService.categorizeReviewSchedule(overdueDate, now), "OVERDUE");
  assert.strictEqual(AnalyticsService.categorizeReviewSchedule(dueIn5Days, now), "DUE_7_DAYS");
  assert.strictEqual(AnalyticsService.categorizeReviewSchedule(dueIn20Days, now), "DUE_30_DAYS");
  assert.strictEqual(AnalyticsService.categorizeReviewSchedule(dueIn60Days, now), "UPCOMING");
});
