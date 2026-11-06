// @vitest-environment node

import type { SupabaseClient } from "@supabase/supabase-js";
import { describe, expect, it, vi } from "vitest";

import { buildAccountExport } from "@/server/account/export";
import type { Database } from "@/types/database";

describe("buildAccountExport", () => {
  it("paginates beyond the Data API default page size", async () => {
    const projects = Array.from({ length: 501 }, (_, index) => ({ id: `project-${index}` }));
    const ranges: Array<[number, number]> = [];

    const profileQuery = chain();
    profileQuery.single = vi.fn(async () => ({ data: { id: "user-1" }, error: null }));

    const projectQuery = chain();
    projectQuery.range = vi.fn(async (start: number, end: number) => {
      ranges.push([start, end]);
      return { data: projects.slice(start, end + 1), error: null };
    });

    const supabase = {
      from: vi.fn((table: string) => (table === "profiles" ? profileQuery : projectQuery)),
    } as unknown as SupabaseClient<Database>;

    const accountExport = await buildAccountExport(supabase, "user-1", "2026-11-05T00:00:00.000Z");

    expect(accountExport.projects).toHaveLength(501);
    expect(ranges).toEqual([
      [0, 499],
      [500, 999],
    ]);
    expect(projectQuery.order).toHaveBeenNthCalledWith(1, "created_at", { ascending: true });
    expect(projectQuery.order).toHaveBeenNthCalledWith(2, "id", { ascending: true });
  });
});

function chain() {
  const value = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    range: vi.fn(),
    single: vi.fn(),
  };
  value.select.mockReturnValue(value);
  value.eq.mockReturnValue(value);
  value.order.mockReturnValue(value);
  return value;
}
