import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AccountDeletionRepository } from "@/server/account/delete-account";
import type { Database } from "@/types/database";

export function createSupabaseDeletionRepository(
  userClient: SupabaseClient<Database>,
  adminClient: SupabaseClient<Database>,
): AccountDeletionRepository {
  return {
    async begin() {
      const { data, error } = await userClient.rpc("begin_account_deletion");
      if (error) throw error;
      return data;
    },
    async markCleaning(operationId) {
      await updateJob(adminClient, operationId, { status: "cleaning", last_error_code: null });
    },
    async deleteApplicationData(userId) {
      const { error } = await adminClient.from("projects").delete().eq("owner_id", userId);
      if (error) throw error;
    },
    async markAuthDeletionPending(operationId) {
      await updateJob(adminClient, operationId, {
        status: "auth_deletion_pending",
        last_error_code: null,
      });
    },
    async deleteAuthUser(userId) {
      const { error } = await adminClient.auth.admin.deleteUser(userId);
      if (error) throw error;
    },
    async markFailed(operationId, code) {
      await updateJob(adminClient, operationId, { status: "failed", last_error_code: code });
    },
  };
}

async function updateJob(
  adminClient: SupabaseClient<Database>,
  operationId: string,
  values: Database["public"]["Tables"]["deletion_jobs"]["Update"],
) {
  const { error } = await adminClient.from("deletion_jobs").update(values).eq("id", operationId);
  if (error) throw error;
}
