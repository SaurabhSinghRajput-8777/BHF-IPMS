import test from "node:test";
import assert from "node:assert/strict";
import { AssessmentStateMachine } from "../../src/services/assessment-state.service";

test("Assessment State Machine: Valid Lifecycle Transitions", () => {
  // DRAFT -> SUBMITTED
  assert.strictEqual(AssessmentStateMachine.canTransition("DRAFT", "SUBMITTED"), true);

  // SUBMITTED -> UNDER_REVIEW
  assert.strictEqual(AssessmentStateMachine.canTransition("SUBMITTED", "UNDER_REVIEW"), true);

  // UNDER_REVIEW -> APPROVED
  assert.strictEqual(AssessmentStateMachine.canTransition("UNDER_REVIEW", "APPROVED"), true);

  // UNDER_REVIEW -> CHANGES_REQUESTED
  assert.strictEqual(AssessmentStateMachine.canTransition("UNDER_REVIEW", "CHANGES_REQUESTED"), true);

  // CHANGES_REQUESTED -> RESUBMITTED
  assert.strictEqual(AssessmentStateMachine.canTransition("CHANGES_REQUESTED", "RESUBMITTED"), true);

  // RESUBMITTED -> UNDER_REVIEW
  assert.strictEqual(AssessmentStateMachine.canTransition("RESUBMITTED", "UNDER_REVIEW"), true);

  // UNDER_REVIEW -> REJECTED
  assert.strictEqual(AssessmentStateMachine.canTransition("UNDER_REVIEW", "REJECTED"), true);
});

test("Assessment State Machine: Rejects Invalid Transitions", () => {
  // Cannot jump from DRAFT directly to APPROVED
  assert.strictEqual(AssessmentStateMachine.canTransition("DRAFT", "APPROVED"), false);

  // Cannot jump from DRAFT to REJECTED
  assert.strictEqual(AssessmentStateMachine.canTransition("DRAFT", "REJECTED"), false);

  // Once APPROVED, cannot transition to DRAFT or SUBMITTED
  assert.strictEqual(AssessmentStateMachine.canTransition("APPROVED", "DRAFT"), false);
  assert.strictEqual(AssessmentStateMachine.canTransition("APPROVED", "SUBMITTED"), false);

  // Once REJECTED, cannot transition to APPROVED
  assert.strictEqual(AssessmentStateMachine.canTransition("REJECTED", "APPROVED"), false);
});

