import { type NextRequest, NextResponse } from "next/server";

import { safeInternalPath } from "@/server/auth/redirect";
import {
  createRecoveryProof,
  PASSWORD_RECOVERY_COOKIE,
  recoveryCookieOptions,
  verifyRecoveryIntent,
} from "@/server/auth/recovery-proof";
import { createServerSupabaseClient } from "@/server/supabase/server";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeInternalPath(request.nextUrl.searchParams.get("next"));
  const recoveryIntent = request.nextUrl.searchParams.get("recovery");
  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const response = NextResponse.redirect(new URL(next, request.url));
      if (next !== "/update-password") return response;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user && verifyRecoveryIntent(recoveryIntent)) {
        response.cookies.set(
          PASSWORD_RECOVERY_COOKIE,
          createRecoveryProof(user.id),
          recoveryCookieOptions(),
        );
        return response;
      }
    }
  }
  const signInUrl = new URL("/sign-in", request.url);
  signInUrl.searchParams.set("error", "The email link is invalid or expired.");
  return NextResponse.redirect(signInUrl);
}
