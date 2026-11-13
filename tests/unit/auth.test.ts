import test from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "../../src/services/auth.service";

test("Auth Service: Password Hashing with Argon2id", async () => {
  const plainPassword = "SuperSecretPassword123!";
  const hash = await AuthService.hashPassword(plainPassword);

  assert.ok(hash.startsWith("$argon2id$"), "Hash must be an Argon2id formatted string");
  assert.notStrictEqual(hash, plainPassword);

  const isValid = await AuthService.verifyPassword(hash, plainPassword);
  assert.strictEqual(isValid, true, "Password verification must succeed for correct password");

  const isInvalid = await AuthService.verifyPassword(hash, "WrongPassword!");
  assert.strictEqual(isInvalid, false, "Password verification must fail for wrong password");
});

test("Auth Service: Session Token Generation & Hashing", () => {
  const rawToken = AuthService.generateSessionToken();
  assert.strictEqual(typeof rawToken, "string");
  assert.strictEqual(rawToken.length, 64, "Token should be 32 bytes hex encoded (64 chars)");

  const hashedToken1 = AuthService.hashSessionToken(rawToken);
  const hashedToken2 = AuthService.hashSessionToken(rawToken);

  assert.strictEqual(hashedToken1, hashedToken2, "Hashing same token must be deterministic");
  assert.strictEqual(hashedToken1.length, 64, "SHA-256 hex output should be 64 chars");
  assert.notStrictEqual(hashedToken1, rawToken, "Hashed token must differ from raw token");
});

test("Auth Service: Role Authorization Check", () => {
  assert.strictEqual(AuthService.hasPermission("CIE_ADMIN", ["CIE_ADMIN"]), true);
  assert.strictEqual(AuthService.hasPermission("REVIEWER", ["CIE_ADMIN", "REVIEWER"]), true);
  assert.strictEqual(AuthService.hasPermission("STARTUP", ["CIE_ADMIN"]), false);
  assert.strictEqual(AuthService.hasPermission("STARTUP", ["STARTUP"]), true);
});

