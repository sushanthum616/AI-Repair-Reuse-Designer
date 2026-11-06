import { randomUUID } from "node:crypto";

import { createClient } from "@supabase/supabase-js";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { runAccountDeletion } from "@/server/account/delete-account";
import { buildAccountExport } from "@/server/account/export";
import { createSupabaseDeletionRepository } from "@/server/account/supabase-deletion-repository";
import type { Database } from "@/types/database";

const url = process.env.SUPABASE_URL!;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;
const password = "Test-password-4831";

const admin = createClient<Database>(url, secretKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const users = [
  { id: randomUUID(), email: `m3-owner-${randomUUID()}@example.test` },
  { id: randomUUID(), email: `m3-other-${randomUUID()}@example.test` },
];

let ownerClient: ReturnType<typeof createPublicClient>;
let otherClient: ReturnType<typeof createPublicClient>;

describe("local Supabase auth and RLS", () => {
  beforeAll(async () => {
    for (const user of users) {
      const { error } = await admin.auth.admin.createUser({
        id: user.id,
        email: user.email,
        password,
        email_confirm: true,
      });
      if (error) throw error;
    }

    ownerClient = createPublicClient();
    otherClient = createPublicClient();
    await signIn(ownerClient, users[0].email);
    await signIn(otherClient, users[1].email);
  });

  afterAll(async () => {
    for (const user of users) await admin.auth.admin.deleteUser(user.id);
  });

  it("creates isolated profiles and rejects server-authored field forgery", async () => {
    const { data: ownerProfiles, error: ownerError } = await ownerClient
      .from("profiles")
      .select("id,account_state");
    expect(ownerError).toBeNull();
    expect(ownerProfiles).toEqual([{ id: users[0].id, account_state: "active" }]);

    const { error: forgedStateError } = await ownerClient
      .from("profiles")
      .update({ account_state: "deleting" })
      .eq("id", users[0].id);
    expect(forgedStateError?.code).toBe("42501");
  });

  it("isolates projects and exports only owned records", async () => {
    const { data: project, error: insertError } = await ownerClient
      .from("projects")
      .insert({ title: "Owner-only chair" })
      .select("id,title,owner_id")
      .single();
    expect(insertError).toBeNull();
    expect(project?.owner_id).toBe(users[0].id);

    const { data: foreignRows, error: foreignReadError } = await otherClient
      .from("projects")
      .select("id");
    expect(foreignReadError).toBeNull();
    expect(foreignRows).toEqual([]);

    const accountExport = await buildAccountExport(
      ownerClient as never,
      users[0].id,
      "2026-11-05T00:00:00.000Z",
    );
    expect(accountExport.profile.id).toBe(users[0].id);
    expect(accountExport.projects.map((row) => row.title)).toEqual(["Owner-only chair"]);

    const otherExport = await buildAccountExport(
      otherClient as never,
      users[1].id,
      "2026-11-05T00:00:00.000Z",
    );
    expect(otherExport.projects).toEqual([]);
  });

  it("serializes deletion against writes and removes Auth last", async () => {
    const concurrentInsert = ownerClient.from("projects").insert({ title: "Concurrent write" });
    const beginDeletion = ownerClient.rpc("begin_account_deletion");
    const [, deletionResult] = await Promise.all([concurrentInsert, beginDeletion]);
    expect(deletionResult.error).toBeNull();

    const { error: blockedInsert } = await ownerClient
      .from("projects")
      .insert({ title: "Blocked after deletion marker" });
    expect(blockedInsert?.message).toContain("account is not active");

    await runAccountDeletion(
      createSupabaseDeletionRepository(ownerClient as never, admin),
      users[0].id,
    );

    const { data: deletedUser } = await admin.auth.admin.getUserById(users[0].id);
    expect(deletedUser.user).toBeNull();

    const { error: staleWrite } = await ownerClient
      .from("projects")
      .insert({ title: "Stale token write" });
    expect(staleWrite).not.toBeNull();
  });
});

function createPublicClient() {
  return createClient(url, publishableKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function signIn(client: ReturnType<typeof createPublicClient>, email: string) {
  const { error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
}
