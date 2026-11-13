import crypto from "crypto";
import argon2 from "argon2";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { AuthUserContext } from "@/types";

export class AuthService {
  /**
   * Hashes a password using Argon2id with memory-hard institutional parameters.
   */
  static async hashPassword(password: string): Promise<string> {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  }

  /**
   * Verifies a plaintext password against an Argon2id hash.
   */
  static async verifyPassword(hash: string, plain: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, plain);
    } catch {
      return false;
    }
  }

  /**
   * Generates a cryptographically secure random session token (32 bytes = 64 hex chars).
   */
  static generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Generates a deterministic SHA-256 hash of a session token for safe database persistence.
   */
  static hashSessionToken(token: string): string {
    return crypto.createHash("sha256").update(token).digest("hex");
  }

  /**
   * Checks role-based access permission.
   */
  static hasPermission(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
  }

  /**
   * Creates an active database session for a user.
   */
  static async createSession(userId: string): Promise<{ rawToken: string; expiresAt: Date }> {
    const rawToken = this.generateSessionToken();
    const tokenHash = this.hashSessionToken(rawToken);

    // Default session: 7 days
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await prisma.session.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
      },
    });

    return { rawToken, expiresAt };
  }

  /**
   * Validates a raw session token, returning the authenticated user context or null.
   */
  static async validateSession(rawToken: string): Promise<AuthUserContext | null> {
    if (!rawToken || rawToken.length !== 64) {
      return null;
    }

    const tokenHash = this.hashSessionToken(rawToken);

    try {
      const session = await prisma.session.findUnique({
        where: { tokenHash },
        include: {
          user: {
            include: {
              startupMembership: {
                include: {
                  startup: true,
                },
              },
            },
          },
        },
      });

      if (!session) {
        return null;
      }

      // Check session expiration
      if (new Date() > session.expiresAt) {
        // Asynchronously delete expired session
        await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
        return null;
      }

      // Check if user account is active
      if (!session.user.isActive) {
        return null;
      }

      return {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        isActive: session.user.isActive,
        startupId: session.user.startupMembership?.startupId ?? null,
        startupCode: session.user.startupMembership?.startup.startupCode ?? null,
        startupName: session.user.startupMembership?.startup.name ?? null,
      };
    } catch {
      return null;
    }
  }

  /**
   * Revokes a session on logout.
   */
  static async revokeSession(rawToken: string): Promise<void> {
    if (!rawToken) return;
    const tokenHash = this.hashSessionToken(rawToken);
    await prisma.session.deleteMany({ where: { tokenHash } }).catch(() => {});
  }
}
