import { Suspense } from "react";
import { AssessmentWizardClient } from "./AssessmentWizardClient";
import { Loader2 } from "lucide-react";

export const instant = false;

export default async function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
        </div>
      }
    >
      <AssessmentWizardClient />
    </Suspense>
  );
}
