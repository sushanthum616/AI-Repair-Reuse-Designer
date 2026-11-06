import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

import { getServerEnvironment } from "@/server/env";

export const PASSWORD_RECOVERY_COOKIE = "repair_reuse_password_recovery";

const proofLifetimeSeconds = 15 * 60;

type RecoveryIntent = {
  purpose: "password-recovery-intent";
  expiresAt: number;
  nonce: string;
};

type RecoveryProof = {
  purpose: "password-recovery-proof";
  userId: string;
  expiresAt: number;
  nonce: string;
};

export function createRecoveryIntent(now = Date.now()) {
  return sign({
    purpose: "password-recovery-intent",
    expiresAt: Math.floor(now / 1000) + proofLifetimeSeconds,
    nonce: randomBytes(18).toString("base64url"),
  } satisfies RecoveryIntent);
}

export function verifyRecoveryIntent(value: string | null | undefined, now = Date.now()) {
  const payload = verify(value);
  return (
    payload?.purpose === "password-recovery-intent" &&
    typeof payload.nonce === "string" &&
    isUnexpired(payload.expiresAt, now)
  );
}

export function createRecoveryProof(userId: string, now = Date.now()) {
  return sign({
    purpose: "password-recovery-proof",
    userId,
    expiresAt: Math.floor(now / 1000) + proofLifetimeSeconds,
    nonce: randomBytes(18).toString("base64url"),
  } satisfies RecoveryProof);
}

export function verifyRecoveryProof(
  value: string | null | undefined,
  userId: string,
  now = Date.now(),
) {
  const payload = verify(value);
  return (
    payload?.purpose === "password-recovery-proof" &&
    payload.userId === userId &&
    typeof payload.nonce === "string" &&
    isUnexpired(payload.expiresAt, now)
  );
}

export function recoveryCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: proofLifetimeSeconds,
  };
}

function sign(payload: RecoveryIntent | RecoveryProof) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${encoded}.${signature(encoded)}`;
}

function verify(value: string | null | undefined): Record<string, unknown> | undefined {
  if (!value) return undefined;
  const parts = value.split(".");
  if (parts.length !== 2 || !parts[0] || !parts[1]) return undefined;

  const expected = Buffer.from(signature(parts[0]), "base64url");
  const actual = Buffer.from(parts[1], "base64url");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) return undefined;

  try {
    const parsed = JSON.parse(Buffer.from(parts[0], "base64url").toString("utf8"));
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function signature(encoded: string) {
  return createHmac("sha256", getServerEnvironment().SUPABASE_SECRET_KEY)
    .update(`repair-reuse-password-recovery-v1:${encoded}`)
    .digest("base64url");
}

function isUnexpired(value: unknown, now: number) {
  return typeof value === "number" && value >= Math.floor(now / 1000);
}
