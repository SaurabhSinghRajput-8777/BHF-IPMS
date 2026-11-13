import { Suspense } from "react";
import { PublicApplicationWizardClient } from "./PublicApplicationWizardClient";
import { SiteFooter } from "@/components/SiteFooter";
import { Loader2 } from "lucide-react";

export const instant = false;

export default async function ApplyPage() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      <div className="flex-1 flex flex-col w-full">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
              <Loader2 className="h-8 w-8 animate-spin text-blue-900" />
            </div>
          }
        >
          <PublicApplicationWizardClient />
        </Suspense>
      </div>
      <SiteFooter />
    </div>
  );
}

