import { AssessmentReviewWorkspaceClient } from "./AssessmentReviewWorkspaceClient";

export const instant = false;

export default async function ReviewWorkspacePage({
  params,
}: {
  params: Promise<{ assessmentId: string }>;
}) {
  const { assessmentId } = await params;
  return <AssessmentReviewWorkspaceClient assessmentId={assessmentId} />;
}
