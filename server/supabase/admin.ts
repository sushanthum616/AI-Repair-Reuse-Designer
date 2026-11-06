import "server-only";

import { createClient } from "@supabase/supabase-js";

import { getServerEnvironment } from "@/server/env";
import type { Database } from "@/types/database";

export function createAdminSupabaseClient() {
  const environment = getServerEnvironment();

  return createClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.SUPABASE_SECRET_KEY,
    {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    },
  );
}
