// @vitest-environment node

import { describe, expect, it, vi } from "vitest";

import {
  type AccountDeletionRepository,
  runAccountDeletion,
} from "@/server/account/delete-account";

describe("runAccountDeletion", () => {
  it("deletes the Auth user only after application cleanup", async () => {
    const calls: string[] = [];
    const repository = fakeRepository(calls);

    await runAccountDeletion(repository, "user-1");

    expect(calls).toEqual([
      "begin",
      "cleaning",
      "application-data:user-1",
      "auth-pending",
      "auth-user:user-1",
    ]);
  });

  it("keeps Auth intact and records failure when cleanup fails", async () => {
    const calls: string[] = [];
    const repository = fakeRepository(calls);
    repository.deleteApplicationData = vi.fn(async () => {
      calls.push("application-data-failed");
      throw Object.assign(new Error("cleanup failed"), { code: "cleanup_failed" });
    });

    await expect(runAccountDeletion(repository, "user-1")).rejects.toThrow("cleanup failed");

    expect(calls).toEqual([
      "begin",
      "cleaning",
      "application-data-failed",
      "failed:cleanup_failed",
    ]);
    expect(repository.deleteAuthUser).not.toHaveBeenCalled();
  });
});

function fakeRepository(calls: string[]): AccountDeletionRepository {
  return {
    begin: vi.fn(async () => {
      calls.push("begin");
      return "operation-1";
    }),
    markCleaning: vi.fn(async () => {
      calls.push("cleaning");
    }),
    deleteApplicationData: vi.fn(async (userId) => {
      calls.push(`application-data:${userId}`);
    }),
    markAuthDeletionPending: vi.fn(async () => {
      calls.push("auth-pending");
    }),
    deleteAuthUser: vi.fn(async (userId) => {
      calls.push(`auth-user:${userId}`);
    }),
    markFailed: vi.fn(async (_operationId, code) => {
      calls.push(`failed:${code}`);
    }),
  };
}
