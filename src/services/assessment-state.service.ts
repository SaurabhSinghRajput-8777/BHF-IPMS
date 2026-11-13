import { AssessmentStatus } from "@prisma/client";

export class AssessmentStateMachine {
  private static readonly transitions: Record<AssessmentStatus, AssessmentStatus[]> = {
    DRAFT: ["SUBMITTED"],
    SUBMITTED: ["UNDER_REVIEW"],
    UNDER_REVIEW: ["APPROVED", "CHANGES_REQUESTED", "REJECTED"],
    CHANGES_REQUESTED: ["RESUBMITTED"],
    RESUBMITTED: ["UNDER_REVIEW"],
    APPROVED: [], // Terminal official state for this version
    REJECTED: [], // Terminal rejected state for this version
  };

  /**
   * Evaluates if an assessment state transition is valid according to the governance lifecycle.
   */
  static canTransition(fromStatus: AssessmentStatus, toStatus: AssessmentStatus): boolean {
    const validNextStates = this.transitions[fromStatus] || [];
    return validNextStates.includes(toStatus);
  }
}

