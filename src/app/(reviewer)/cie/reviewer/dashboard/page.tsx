import { redirect } from "next/navigation";

export default function ReviewerDashboardRedirect() {
  redirect("/cie/reviewer/queue");
}

