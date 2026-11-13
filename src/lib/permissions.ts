import { redirect } from "next/navigation";
import { getCurrentUser } from "./session";
import { AuthUserContext, UserRole } from "@/types";

/**
 * Ensures user is authenticated, redirecting to /login if not.
 */
export async function requireAuth(): Promise<AuthUserContext> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/**
 * Ensures user has one of the allowed roles, redirecting to /unauthorized if not.
 */
export async function requireRole(allowedRoles: UserRole[]): Promise<AuthUserContext> {
  const user = await requireAuth();
  if (!allowedRoles.includes(user.role)) {
    redirect("/unauthorized");
  }
  return user;
}

/**
 * Enforces startup tenant isolation:
 * Startup users can ONLY access their own startupId.
 * CIE_ADMIN and REVIEWER can access any assigned startup.
 */
export async function requireStartupIsolation(requestedStartupId: string): Promise<AuthUserContext> {
  const user = await requireAuth();

  if (user.role === "STARTUP") {
    if (!user.startupId || user.startupId !== requestedStartupId) {
      redirect("/unauthorized");
    }
  }

  return user;
}

