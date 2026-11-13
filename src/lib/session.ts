import { cookies } from "next/headers";
import { AuthService } from "@/services/auth.service";
import { AuthUserContext } from "@/types";

export const SESSION_COOKIE_NAME = "bhf_ipms_session";

export async function getSessionCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(SESSION_COOKIE_NAME);
  return cookie?.value ?? null;
}

export async function getCurrentUser(): Promise<AuthUserContext | null> {
  const token = await getSessionCookie();
  if (!token) return null;
  return await AuthService.validateSession(token);
}

export async function setSessionCookie(rawToken: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

