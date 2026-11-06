import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

const projectExportFields =
  "id,title,description,item_type,materials,damage_description,intended_use,skill_level,budget_minor,currency_code,constraints,status,created_at,updated_at,archived_at,deleted_at";

export async function buildAccountExport(
  supabase: SupabaseClient<Database>,
  userId: string,
  exportedAt = new Date().toISOString(),
) {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id,display_name,locale,skill_level,preferences,account_state,created_at,updated_at")
    .eq("id", userId)
    .single();

  if (profileError) throw profileError;

  const projects = [];
  const pageSize = 500;

  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("projects")
      .select(projectExportFields)
      .eq("owner_id", userId)
      .order("created_at", { ascending: true })
      .order("id", { ascending: true })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;
    projects.push(...data);
    if (data.length < pageSize) break;
  }

  return {
    version: 1,
    exportedAt,
    profile,
    projects,
  };
}
