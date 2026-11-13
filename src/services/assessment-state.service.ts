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

  /**
   * Validates a state transition and throws an Error if invalid.
   */
  static validateTransition(fromStatus: AssessmentStatus, toStatus: AssessmentStatus): void {
    // Reviewers can directly act from SUBMITTED or RESUBMITTED to APPROVED / CHANGES_REQUESTED / REJECTED
    const isDirectReviewerAction =
      (fromStatus === "SUBMITTED" || fromStatus === "RESUBMITTED") &&
      (toStatus === "APPROVED" || toStatus === "CHANGES_REQUESTED" || toStatus === "REJECTED");

    if (!this.canTransition(fromStatus, toStatus) && !isDirectReviewerAction) {
      throw new Error(`Invalid transition from state '${fromStatus}' to '${toStatus}'.`);
    }
  }
}

