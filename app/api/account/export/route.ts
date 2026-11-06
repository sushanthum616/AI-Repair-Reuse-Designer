import { NextResponse } from "next/server";

import { buildAccountExport } from "@/server/account/export";
import { createServerSupabaseClient } from "@/server/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Authentication required" }, { status: 401 });

  const accountExport = await buildAccountExport(supabase, user.id);
  const date = accountExport.exportedAt.slice(0, 10);
  return NextResponse.json(accountExport, {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="repair-reuse-export-${date}.json"`,
      Expires: "0",
      Pragma: "no-cache",
    },
  });
}
