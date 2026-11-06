import { type NextRequest, NextResponse } from "next/server";

import { copySupabaseResponse, refreshSupabaseSession } from "@/server/supabase/proxy";

const protectedPaths = ["/dashboard", "/settings"];

export async function proxy(request: NextRequest) {
  const session = await refreshSupabaseSession(request);
  const needsAuthentication = protectedPaths.some(
    (path) => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(`${path}/`),
  );

  if (needsAuthentication && !session.authenticated) {
    const signInUrl = new URL("/sign-in", request.url);
    signInUrl.searchParams.set("next", request.nextUrl.pathname);
    return copySupabaseResponse(session.response, NextResponse.redirect(signInUrl));
  }

  if (request.nextUrl.pathname === "/sign-in" && session.authenticated) {
    const verifiedUser = await session.getVerifiedUser();
    if (verifiedUser) {
      return copySupabaseResponse(
        session.response,
        NextResponse.redirect(new URL("/dashboard", request.url)),
      );
    }
  }

  return session.response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
