import "server-only";

import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getServerEnvironment } from "@/server/env";
import type { Database } from "@/types/database";

export async function refreshSupabaseSession(request: NextRequest) {
  let response = NextResponse.next({ request });
  const environment = getServerEnvironment();

  const supabase = createServerClient<Database>(
    environment.NEXT_PUBLIC_SUPABASE_URL,
    environment.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headersToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          const previousResponse = response;
          response = NextResponse.next({ request });
          copySupabaseResponse(previousResponse, response);

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }

          for (const [name, value] of Object.entries(headersToSet)) {
            response.headers.set(name, value);
          }
        },
      },
    },
  );

  const { data, error } = await supabase.auth.getClaims();

  return {
    authenticated: !error && Boolean(data?.claims?.sub),
    async getVerifiedUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      return user;
    },
    get response() {
      return response;
    },
  };
}

export function copySupabaseResponse(source: NextResponse, destination: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    destination.cookies.set(cookie);
  }

  for (const header of ["cache-control", "expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) destination.headers.set(header, value);
  }

  return destination;
}
