import "server-only";

import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/server/supabase/server";

export async function requireUser() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  return { supabase, user };
}
