import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ErrorPage from "@/app/error";
import Loading from "@/app/loading";
import { EmptyState } from "@/components/shared/empty-state";

describe("application states", () => {
  it("announces the loading state", () => {
    render(<Loading />);

    expect(screen.getByText("Loading page")).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveAttribute("aria-busy", "true");
  });

  it("offers a retry action after an error", () => {
    const reset = vi.fn();
    render(<ErrorPage error={new Error("test failure")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(reset).toHaveBeenCalledOnce();
  });

  it("explains the future empty project state", () => {
    render(<EmptyState />);

    expect(screen.getByRole("heading", { name: "No projects here yet" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See how projects will work" })).toHaveAttribute(
      "href",
      "/#how-it-works",
    );
  });
});
