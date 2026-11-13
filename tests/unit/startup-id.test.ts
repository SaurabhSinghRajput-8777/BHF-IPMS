import test from "node:test";
import assert from "node:assert/strict";
import { StartupService } from "../../src/services/startup.service";

test("Startup Service: Startup ID Format & Sequence Generator", () => {
  const code1 = StartupService.formatStartupCode(2026, 1);
  assert.strictEqual(code1, "BH-2026-001");

  const code42 = StartupService.formatStartupCode(2026, 42);
  assert.strictEqual(code42, "BH-2026-042");

  const code999 = StartupService.formatStartupCode(2026, 999);
  assert.strictEqual(code999, "BH-2026-999");
});

test("Startup Service: Startup Code Regex Validation", () => {
  assert.strictEqual(StartupService.isValidStartupCode("BH-2026-001"), true);
  assert.strictEqual(StartupService.isValidStartupCode("BH-2025-105"), true);
  assert.strictEqual(StartupService.isValidStartupCode("INVALID-123"), false);
  assert.strictEqual(StartupService.isValidStartupCode("BH-26-01"), false);
});

