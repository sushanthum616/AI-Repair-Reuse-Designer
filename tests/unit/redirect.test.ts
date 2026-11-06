import { describe, expect, it } from "vitest";

import { safeInternalPath } from "@/server/auth/redirect";

describe("safeInternalPath", () => {
  it.each([
    "https://attacker.example",
    "//attacker.example",
    "/a/..//attacker.example",
    "/a/%2e%2e//attacker.example",
    "/\\attacker",
    "javascript:alert(1)",
  ])("rejects unsafe destination %s", (destination) => {
    expect(safeInternalPath(destination)).toBe("/dashboard");
  });

  it("preserves internal paths with query parameters", () => {
    expect(safeInternalPath("/settings?tab=privacy")).toBe("/settings?tab=privacy");
  });
});
