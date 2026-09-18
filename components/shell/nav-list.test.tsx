import { describe, it, expect, beforeEach } from "vitest";
import { screen, render } from "@testing-library/react";
import { NavList } from "./nav-list";
import { mockPermissions } from "@/test/test-utils";
import { PERMISSIONS } from "@/lib/api/types";

beforeEach(() => {
  mockPermissions([...PERMISSIONS], "owner");
});

describe("NavList", () => {
  it("4. an owner sees every nav item, including Billing", () => {
    render(<NavList />);

    for (const label of ["Overview", "Assets", "Scans", "Reports", "Team", "Activity", "Usage", "Billing", "Settings"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
  });

  it("1/2. a member excludes Billing by default but keeps operational pages visible", () => {
    mockPermissions(
      [
        "dashboard.view",
        "assets.view",
        "scans.view",
        "reports.view",
        "team.view",
        "activity.view",
        "usage.view",
        "profile.view",
        "profile.change_password",
      ],
      "member",
    );

    render(<NavList />);

    expect(screen.queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();
    for (const label of ["Overview", "Assets", "Scans", "Reports", "Team", "Activity", "Usage"]) {
      expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
    }
    // Settings has no permission gate — always visible (Account/Security are personal).
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });

  it("hides an entire section when every item in it is unauthorized", () => {
    mockPermissions(["dashboard.view", "profile.view", "profile.change_password"], "viewer");

    render(<NavList />);

    expect(screen.queryByRole("link", { name: "Assets" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Team" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Activity" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Usage" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Billing" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Settings" })).toBeInTheDocument();
  });
});
