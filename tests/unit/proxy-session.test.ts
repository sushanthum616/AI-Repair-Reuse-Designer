// @vitest-environment node

import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  refreshDuring: "claims" as "claims" | "user" | "both" | "never",
}));

vi.mock("@/server/env", () => ({
  getServerEnvironment: () => ({
    NEXT_PUBLIC_SUPABASE_URL: "https://supabase.example",
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "publishable-test-key-long-enough",
  }),
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          cookies: Array<{ name: string; value: string; options: Record<string, unknown> }>,
          headers: Record<string, string>,
        ) => void;
      };
    },
  ) => {
    const refresh = (name: string, includeHeaders = true) =>
      options.cookies.setAll(
        [{ name, value: "rotated", options: { httpOnly: true } }],
        includeHeaders
          ? {
              "Cache-Control": "private, no-cache, no-store, must-revalidate, max-age=0",
              Expires: "0",
              Pragma: "no-cache",
            }
          : {},
      );

    return {
      auth: {
        getClaims: vi.fn(async () => {
          if (state.refreshDuring === "claims" || state.refreshDuring === "both") {
            refresh("sb-refresh-first");
          }
          return { data: { claims: { sub: "user-1" } }, error: null };
        }),
        getUser: vi.fn(async () => {
          if (state.refreshDuring === "user") refresh("sb-refresh-user");
          if (state.refreshDuring === "both") refresh("sb-refresh-second", false);
          return { data: { user: { id: "user-1" } }, error: null };
        }),
      },
    };
  },
}));

import { proxy } from "@/proxy";
import { refreshSupabaseSession } from "@/server/supabase/proxy";

describe("Supabase proxy refresh response", () => {
  beforeEach(() => {
    state.refreshDuring = "claims";
  });

  it("preserves cookies and private cache headers when a public route refreshes", async () => {
    const response = await proxy(new NextRequest("https://app.example/"));

    expect(response.cookies.get("sb-refresh-first")?.value).toBe("rotated");
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(response.headers.get("expires")).toBe("0");
    expect(response.headers.get("pragma")).toBe("no-cache");
  });

  it("exposes a response replaced by a later fresh-user check", async () => {
    state.refreshDuring = "user";
    const session = await refreshSupabaseSession(new NextRequest("https://app.example/sign-in"));
    const responseBeforeVerification = session.response;

    await session.getVerifiedUser();

    expect(session.response).not.toBe(responseBeforeVerification);
    expect(session.response.cookies.get("sb-refresh-user")?.value).toBe("rotated");
    expect(session.response.headers.get("cache-control")).toContain("no-store");
  });

  it("retains first-write cookies and cache headers across a later cookie write", async () => {
    state.refreshDuring = "both";
    const session = await refreshSupabaseSession(new NextRequest("https://app.example/sign-in"));

    await session.getVerifiedUser();

    expect(session.response.cookies.get("sb-refresh-first")?.value).toBe("rotated");
    expect(session.response.cookies.get("sb-refresh-second")?.value).toBe("rotated");
    expect(session.response.headers.get("cache-control")).toContain("private");
    expect(session.response.headers.get("cache-control")).toContain("no-store");
    expect(session.response.headers.get("expires")).toBe("0");
    expect(session.response.headers.get("pragma")).toBe("no-cache");
  });
});
