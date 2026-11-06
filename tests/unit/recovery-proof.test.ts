// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

vi.mock("@/server/env", () => ({
  getServerEnvironment: () => ({
    SUPABASE_SECRET_KEY: "test-secret-key-that-is-long-enough-for-hmac",
  }),
}));

import {
  createRecoveryIntent,
  createRecoveryProof,
  verifyRecoveryIntent,
  verifyRecoveryProof,
} from "@/server/auth/recovery-proof";

describe("password recovery proof", () => {
  const now = Date.UTC(2026, 10, 5, 12, 0, 0);

  it("accepts a signed recovery intent only before expiry", () => {
    const intent = createRecoveryIntent(now);

    expect(verifyRecoveryIntent(intent, now)).toBe(true);
    expect(verifyRecoveryIntent(intent, now + 16 * 60 * 1000)).toBe(false);
  });

  it("binds a recovery proof to one verified user", () => {
    const proof = createRecoveryProof("user-1", now);

    expect(verifyRecoveryProof(proof, "user-1", now)).toBe(true);
    expect(verifyRecoveryProof(proof, "user-2", now)).toBe(false);
  });

  it("rejects a tampered recovery proof", () => {
    const proof = createRecoveryProof("user-1", now);
    const tampered = `${proof.slice(0, -1)}${proof.endsWith("a") ? "b" : "a"}`;

    expect(verifyRecoveryProof(tampered, "user-1", now)).toBe(false);
  });
});
