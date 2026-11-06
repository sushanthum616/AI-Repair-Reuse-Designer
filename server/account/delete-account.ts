import "server-only";

export interface AccountDeletionRepository {
  begin(): Promise<string>;
  markCleaning(operationId: string): Promise<void>;
  deleteApplicationData(userId: string): Promise<void>;
  markAuthDeletionPending(operationId: string): Promise<void>;
  deleteAuthUser(userId: string): Promise<void>;
  markFailed(operationId: string, code: string): Promise<void>;
}

export async function runAccountDeletion(repository: AccountDeletionRepository, userId: string) {
  const operationId = await repository.begin();

  try {
    await repository.markCleaning(operationId);
    await repository.deleteApplicationData(userId);
    await repository.markAuthDeletionPending(operationId);
    await repository.deleteAuthUser(userId);
  } catch (error) {
    await repository.markFailed(operationId, deletionErrorCode(error));
    throw error;
  }
}

function deletionErrorCode(error: unknown) {
  if (error && typeof error === "object" && "code" in error && typeof error.code === "string") {
    return error.code.slice(0, 120);
  }

  return "account_deletion_failed";
}
