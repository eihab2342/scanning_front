import { describe, it, expect } from "vitest";
import { screen, render } from "@testing-library/react";
import { AdminNavList } from "./admin-nav-list";

describe("AdminNavList", () => {
  it("renders every platform-admin section, unconditionally (no permission gating — platform-admin auth is role-based, not permission-based)", () => {
    render(<AdminNavList />);

    for (const label of ["Overview", "Organizations", "Plans", "Features", "Billing Events", "Cash Payments", "Audit", "Website", "Settings"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("links to their real /admin/* routes", () => {
    render(<AdminNavList />);

    expect(screen.getByRole("link", { name: "Organizations" })).toHaveAttribute("href", "/admin/organizations");
    expect(screen.getByRole("link", { name: "Plans" })).toHaveAttribute("href", "/admin/plans");
    expect(screen.getByRole("link", { name: "Billing Events" })).toHaveAttribute("href", "/admin/billing-events");
  });
});
