import { describe, expect, it } from "vitest";

import { demoProjects } from "@/lib/fixtures";

describe("demo project fixtures", () => {
  it("marks every sample as a fixture with bounded progress", () => {
    expect(demoProjects.length).toBeGreaterThan(0);

    for (const project of demoProjects) {
      expect(project.isFixture).toBe(true);
      expect(project.progress).toBeGreaterThanOrEqual(0);
      expect(project.progress).toBeLessThanOrEqual(100);
      expect(project.updatedLabel).toMatch(/^Illustrative update/);
    }
  });
});
