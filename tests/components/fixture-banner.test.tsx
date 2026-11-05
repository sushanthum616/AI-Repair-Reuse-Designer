import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FixtureBanner } from "@/components/shared/fixture-banner";

describe("FixtureBanner", () => {
  it("discloses that dashboard content is illustrative", () => {
    render(<FixtureBanner />);

    expect(
      screen.getByRole("complementary", { name: "Demonstration data notice" }),
    ).toHaveTextContent("illustrative fixture data");
  });
});
