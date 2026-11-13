import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full border-slate-200 shadow-md">
        <CardHeader className="text-center">
          <div className="h-14 w-14 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-3">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Access Restricted</CardTitle>
          <CardDescription className="text-slate-500 mt-1">
            You do not have the required role or authorization to access this institutional resource.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            If you believe this is an error, please reach out to the Bennett Hatchery / CIE administrator 
            to verify your account permissions.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/login">
              <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white">
                Return to Login
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

